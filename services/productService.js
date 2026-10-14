/* ==========================================================================
   PRODUCT SERVICE - INVENTORY & STOCK MANAGEMENT
   ========================================================================== */

const STORAGE_KEY_PRODUCTS = 'shopsphere_products';

const productService = {
    async getProducts() {
        try {
            // Attempt to fetch from Spring Boot Backend
            const res = await apiFetch('/products');
            if (res && res.success && res.data && res.data.length > 0) {
                const normalized = res.data.map(p => ({
                    ...p,
                    category: p.category || p.categoryName,
                    categoryName: p.categoryName || p.category,
                    sellerId: p.sellerId || p.seller_id,
                    images: (p.images && p.images.length) ? p.images : (p.image ? [p.image] : [])
                }));
                // Cache locally for performance
                localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(normalized));
                return normalized;
            }
        } catch (err) {
            console.warn("Backend REST API offline or empty. Executing client demo fallback.", err.message);
        }

        // Fallback to LocalStorage or Mock Data if backend is unavailable
        try {
            const stored = localStorage.getItem(STORAGE_KEY_PRODUCTS);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return Promise.resolve(parsed.map(p => ({
                        ...p,
                        category: p.category || p.categoryName,
                        categoryName: p.categoryName || p.category,
                        sellerId: p.sellerId || p.seller_id,
                        images: (p.images && p.images.length) ? p.images : (p.image ? [p.image] : [])
                    })));
                }
            }
            if (typeof PRODUCTS !== 'undefined') {
                localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(PRODUCTS));
                return Promise.resolve([...PRODUCTS]);
            }
        } catch (e) {
            console.error("Failed to read products from localStorage", e);
        }
        return Promise.resolve(typeof PRODUCTS !== 'undefined' ? [...PRODUCTS] : []);
    },

    async getProductById(id) {
        try {
            const res = await apiFetch(`/products/${id}`);
            if (res && res.success && res.data) {
                const p = res.data;
                p.category = p.category || p.categoryName;
                p.categoryName = p.categoryName || p.category;
                p.sellerId = p.sellerId || p.seller_id;
                p.images = (p.images && p.images.length) ? p.images : (p.image ? [p.image] : []);
                return p;
            }
        } catch (err) {
            console.warn("Backend REST API offline for product details. Executing client demo fallback.", err.message);
        }

        const products = await this.getProducts();
        const found = products.find(p => p.id === parseInt(id));
        return Promise.resolve(found || null);
    },

    async addProduct(productData) {
        const payload = {
            ...productData,
            category: productData.category || productData.categoryName,
            categoryName: productData.categoryName || productData.category,
            sellerId: productData.sellerId || (typeof AuthStore !== 'undefined' && AuthStore.user?.id) || null
        };
        try {
            const res = await apiFetch('/products', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            const newProd = res && res.data ? res.data : { id: Date.now(), ...payload };
            newProd.category = newProd.category || newProd.categoryName;
            newProd.categoryName = newProd.categoryName || newProd.category;
            newProd.sellerId = newProd.sellerId || payload.sellerId;

            let products = [];
            try {
                products = JSON.parse(localStorage.getItem(STORAGE_KEY_PRODUCTS) || '[]');
            } catch(e) {}
            products.unshift(newProd);
            localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
            return newProd;
        } catch (err) {
            console.warn("Fallback to Local Storage for addProduct", err);
            const products = await this.getProducts();
            const newProd = { id: Date.now(), ...payload };
            products.unshift(newProd);
            localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
            return newProd;
        }
    },

    async updateProduct(id, productData) {
        const payload = {
            ...productData,
            category: productData.category || productData.categoryName,
            categoryName: productData.categoryName || productData.category
        };
        try {
            const res = await apiFetch(`/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            const updated = res && res.data ? res.data : { id: parseInt(id), ...payload };
            updated.category = updated.category || updated.categoryName;
            updated.categoryName = updated.categoryName || updated.category;

            let products = [];
            try {
                products = JSON.parse(localStorage.getItem(STORAGE_KEY_PRODUCTS) || '[]');
            } catch(e) {}
            const idx = products.findIndex(p => p.id === parseInt(id));
            if (idx !== -1) {
                products[idx] = { ...products[idx], ...updated };
                localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
            }
            return updated;
        } catch (err) {
            console.warn("Fallback to Local Storage for updateProduct", err);
            const products = await this.getProducts();
            const idx = products.findIndex(p => p.id === parseInt(id));
            if (idx !== -1) {
                products[idx] = { ...products[idx], ...payload };
                localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
                return products[idx];
            }
            throw new Error("Product not found");
        }
    },

    async deleteProduct(id) {
        try {
            await apiFetch(`/products/${id}`, { method: 'DELETE' });
        } catch (err) {
            console.warn("Fallback to Local Storage for deleteProduct", err);
        }

        try {
            let products = JSON.parse(localStorage.getItem(STORAGE_KEY_PRODUCTS) || '[]');
            products = products.filter(p => p.id !== parseInt(id));
            localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
        } catch (e) {}

        return true;
    },

    async updateStockForOrder(items) {
        const products = await this.getProducts();
        items.forEach(item => {
            const p = products.find(prod => prod.id === item.id);
            if (p) {
                p.stock = Math.max(0, (p.stock || 0) - item.qty);
            }
        });
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));

        if (typeof PRODUCTS !== 'undefined') {
            products.forEach(p => {
                const g = PRODUCTS.find(gp => gp.id === p.id);
                if (g) g.stock = p.stock;
            });
        }

        return Promise.resolve(true);
    },

    async restoreStockForOrder(items) {
        const products = await this.getProducts();
        items.forEach(item => {
            const p = products.find(prod => prod.id === item.id);
            if (p) {
                p.stock = (p.stock || 0) + item.qty;
            }
        });
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));

        if (typeof PRODUCTS !== 'undefined') {
            products.forEach(p => {
                const g = PRODUCTS.find(gp => gp.id === p.id);
                if (g) g.stock = p.stock;
            });
        }

        return Promise.resolve(true);
    }
};

window.productService = productService;
