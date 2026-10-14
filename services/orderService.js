/* ==========================================================================
   ORDER SERVICE - CREATING, FETCHING & CANCELING ORDERS
   ========================================================================== */

const STORAGE_KEY_ORDERS = 'shopsphere_orders';

const orderService = {
    async getAllOrders() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY_ORDERS);
            return Promise.resolve(stored ? JSON.parse(stored) : []);
        } catch (e) {
            return Promise.resolve([]);
        }
    },

    async getUserOrders(userEmailOrId) {
        const orders = await this.getAllOrders();
        if (!userEmailOrId) return Promise.resolve([]);

        const userOrders = orders.filter(o =>
            (o.userId && o.userId.toLowerCase() === userEmailOrId.toLowerCase()) ||
            (o.userEmail && o.userEmail.toLowerCase() === userEmailOrId.toLowerCase())
        );

        userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return Promise.resolve(userOrders);
    },

    async getOrderById(orderId) {
        const orders = await this.getAllOrders();
        const found = orders.find(o => o.id === orderId || o.orderNumber === orderId);
        return Promise.resolve(found || null);
    },

    async createOrder(orderPayload) {
        const { shippingAddress, paymentMethod, user } = orderPayload;

        const cartSummary = await cartService.getCartSummary();
        if (cartSummary.items.length === 0) {
            throw new Error("Cannot place an order with an empty cart.");
        }

        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const orderId = `SS-${dateStr}-${randomNum}`;

        const minDeliveryDate = new Date(now);
        minDeliveryDate.setDate(minDeliveryDate.getDate() + 5);
        const maxDeliveryDate = new Date(now);
        maxDeliveryDate.setDate(maxDeliveryDate.getDate() + 7);

        const formatDateStr = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const estimatedDeliveryStr = `${formatDateStr(minDeliveryDate)} - ${formatDateStr(maxDeliveryDate)}`;

        const newOrder = {
            id: orderId,
            orderNumber: orderId,
            userId: user ? (user.email || user.id) : (shippingAddress.email || 'guest'),
            userEmail: user ? user.email : shippingAddress.email,
            userName: user ? user.name : shippingAddress.fullName,
            createdAt: now.toISOString(),
            formattedDate: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            items: cartSummary.items,
            summary: {
                subtotal: cartSummary.subtotal,
                coupon: cartSummary.coupon,
                couponDiscount: cartSummary.couponDiscount,
                gst: cartSummary.gst,
                deliveryFee: cartSummary.deliveryFee,
                total: cartSummary.total
            },
            shippingAddress,
            paymentMethod,
            status: "Placed",
            estimatedDelivery: estimatedDeliveryStr,
            statusTimeline: [
                { status: "Placed", timestamp: now.toISOString(), done: true },
                { status: "Confirmed", timestamp: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(), done: true },
                { status: "Shipped", timestamp: null, done: false },
                { status: "Out for Delivery", timestamp: null, done: false },
                { status: "Delivered", timestamp: null, done: false }
            ]
        };

        const orders = await this.getAllOrders();
        orders.unshift(newOrder);
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));

        await productService.updateStockForOrder(cartSummary.items);
        await cartService.clearCart();

        return Promise.resolve({
            success: true,
            order: newOrder,
            message: `Order #${orderId} placed successfully!`
        });
    },

    async cancelOrder(orderId) {
        const orders = await this.getAllOrders();
        const orderIndex = orders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            throw new Error("Order not found.");
        }

        const order = orders[orderIndex];
        if (order.status !== "Placed" && order.status !== "Confirmed") {
            throw new Error(`Order #${orderId} cannot be cancelled because it is already ${order.status.toLowerCase()}.`);
        }

        order.status = "Cancelled";
        order.cancelledAt = new Date().toISOString();
        if (order.statusTimeline) {
            order.statusTimeline.forEach(step => {
                if (!step.done) step.cancelled = true;
            });
        }

        orders[orderIndex] = order;
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));

        await productService.restoreStockForOrder(order.items);

        return Promise.resolve({
            success: true,
            order,
            message: `Order #${orderId} has been cancelled successfully and stock restored.`
        });
    }
};

window.orderService = orderService;
