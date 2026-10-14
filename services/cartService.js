/* ==========================================================================
   CART SERVICE - MANAGING SHOPPING CART & PERSISTENCE
   ========================================================================== */

const STORAGE_KEY_CART = 'shopsphere_cart_items';
const STORAGE_KEY_COUPON = 'shopsphere_applied_coupon';

const cartService = {
    async getCart() {
        try {
            const storedCart = localStorage.getItem(STORAGE_KEY_CART);
            const items = storedCart ? JSON.parse(storedCart) : [];
            const storedCoupon = localStorage.getItem(STORAGE_KEY_COUPON);
            const coupon = storedCoupon ? JSON.parse(storedCoupon) : null;

            return Promise.resolve({ items, coupon });
        } catch (e) {
            return Promise.resolve({ items: [], coupon: null });
        }
    },

    async saveCartItems(items) {
        localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(items));
        return Promise.resolve(items);
    },

    async saveAppliedCoupon(coupon) {
        if (coupon) {
            localStorage.setItem(STORAGE_KEY_COUPON, JSON.stringify(coupon));
        } else {
            localStorage.removeItem(STORAGE_KEY_COUPON);
        }
        return Promise.resolve(coupon);
    },

    async addToCart(productId, qty = 1) {
        const product = await productService.getProductById(productId);
        if (!product) throw new Error("Product not found");
        if (product.stock === 0) throw new Error("Product is currently out of stock");

        const { items } = await this.getCart();
        const existingIndex = items.findIndex(i => i.id === productId);

        if (existingIndex > -1) {
            const newQty = items[existingIndex].qty + qty;
            if (newQty > product.stock) {
                items[existingIndex].qty = product.stock;
            } else {
                items[existingIndex].qty = newQty;
            }
        } else {
            const addQty = Math.min(qty, product.stock);
            items.push({
                id: product.id,
                name: product.name || product.title,
                title: product.title || product.name,
                category: product.category,
                categoryName: product.categoryName,
                price: product.price,
                oldPrice: product.oldPrice,
                image: product.image,
                stock: product.stock,
                qty: addQty
            });
        }

        await this.saveCartItems(items);
        return Promise.resolve(items);
    },

    async updateQuantity(productId, qty) {
        const { items } = await this.getCart();
        const product = await productService.getProductById(productId);
        const maxStock = product ? product.stock : 99;

        const item = items.find(i => i.id === productId);
        if (item) {
            if (qty <= 0) {
                return await this.removeFromCart(productId);
            }
            item.qty = Math.min(qty, maxStock);
            await this.saveCartItems(items);
        }
        return Promise.resolve(items);
    },

    async removeFromCart(productId) {
        const { items } = await this.getCart();
        const filtered = items.filter(i => i.id !== productId);
        await this.saveCartItems(filtered);
        return Promise.resolve(filtered);
    },

    async clearCart() {
        await this.saveCartItems([]);
        await this.saveAppliedCoupon(null);
        return Promise.resolve([]);
    },

    async applyCoupon(code) {
        const { items } = await this.getCart();
        if (items.length === 0) {
            throw new Error("Your cart is empty. Add products before applying a coupon.");
        }

        const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const result = await couponService.validateAndCalculate(code, subtotal, items);

        if (!result.valid) {
            throw new Error(result.message);
        }

        await this.saveAppliedCoupon(result.coupon);
        return Promise.resolve(result);
    },

    async removeCoupon() {
        await this.saveAppliedCoupon(null);
        return Promise.resolve(true);
    },

    async getCartSummary() {
        const { items, coupon } = await this.getCart();
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

        let couponDiscount = 0;
        let isFreeShipCoupon = false;

        if (coupon && subtotal > 0) {
            const validation = await couponService.validateAndCalculate(coupon.code, subtotal, items);
            if (validation.valid) {
                couponDiscount = validation.discountAmount;
                if (coupon.type === "freeship") {
                    isFreeShipCoupon = true;
                }
            } else {
                await this.saveAppliedCoupon(null);
            }
        }

        const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
        const gst = Math.round(discountedSubtotal * 0.18);

        let deliveryFee = 49;
        if (subtotal >= 999 || isFreeShipCoupon || subtotal === 0) {
            deliveryFee = 0;
        }

        const total = subtotal === 0 ? 0 : (discountedSubtotal + gst + deliveryFee);

        return Promise.resolve({
            items,
            subtotal,
            coupon,
            couponDiscount,
            gst,
            deliveryFee,
            total,
            totalItemsCount: items.reduce((acc, item) => acc + item.qty, 0)
        });
    }
};

window.cartService = cartService;
