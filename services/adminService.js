/* ==========================================================================
   SHOPSPHERE - ADMIN SERVICE (DASHBOARD, USERS, SELLERS, PRODUCTS, ORDERS, LOGS & REPORTS)
   ========================================================================== */

const STORAGE_KEY_ADMIN_USERS = 'shopsphere_admin_users';
const STORAGE_KEY_ADMIN_SELLERS = 'shopsphere_admin_sellers';
const STORAGE_KEY_ADMIN_LOGS = 'shopsphere_admin_logs';

const INITIAL_USERS = [
    { id: 1, name: 'Admin Master', email: 'admin@shopsphere.com', role: 'ADMIN', phone: '+91 9876543210', active: true, createdAt: '2026-01-10T10:00:00Z' },
    { id: 2, name: 'Tech World Retailers', email: 'seller@shopsphere.com', role: 'SELLER', phone: '+91 9876543211', active: true, createdAt: '2026-02-15T11:30:00Z' },
    { id: 3, name: 'John Doe', email: 'buyer@shopsphere.com', role: 'BUYER', phone: '+91 9876543212', active: true, createdAt: '2026-03-01T14:20:00Z' },
    { id: 4, name: 'Priya Sharma', email: 'priya.sharma@example.com', role: 'BUYER', phone: '+91 9812345678', active: true, createdAt: '2026-04-12T09:15:00Z' },
    { id: 5, name: 'Fashion Hub Electronics', email: 'fashionhub@seller.com', role: 'SELLER', phone: '+91 9898989898', active: true, createdAt: '2026-05-05T16:45:00Z' },
    { id: 6, name: 'Rahul Verma', email: 'rahul.v@example.com', role: 'BUYER', phone: '+91 9765432109', active: false, createdAt: '2026-06-20T12:00:00Z' }
];

const INITIAL_SELLERS = [
    { id: 1, userId: 2, storeName: 'Tech World Retailers', email: 'seller@shopsphere.com', phone: '+91 9876543211', status: 'APPROVED', active: true, category: 'Tech & Gadgets', totalSales: 458000, productsCount: 8, rating: 4.8, joinedDate: '15 Feb 2026' },
    { id: 2, userId: 5, storeName: 'Fashion Hub Accessories', email: 'fashionhub@seller.com', phone: '+91 9898989898', status: 'APPROVED', active: true, category: 'Fashion & Apparel', totalSales: 215000, productsCount: 5, rating: 4.6, joinedDate: '05 May 2026' },
    { id: 3, userId: 7, storeName: 'Urban Home Essentials', email: 'urbanhome@seller.com', phone: '+91 9123456780', status: 'PENDING', active: false, category: 'Home & Living', totalSales: 0, productsCount: 3, rating: 0.0, joinedDate: '01 Oct 2026' },
    { id: 4, userId: 8, storeName: 'Glow & Glamour Beauty', email: 'glowglam@seller.com', phone: '+91 9871234567', status: 'REJECTED', active: false, category: 'Beauty & Care', totalSales: 0, productsCount: 0, rating: 0.0, joinedDate: '04 Oct 2026' }
];

const INITIAL_LOGS = [
    { id: 101, action: 'User Registration', details: 'New Buyer Rahul Verma created an account.', user: 'System', timestamp: '2026-10-09 10:15 AM', type: 'user' },
    { id: 102, action: 'Order Placed', details: 'Order #SS-20261009-4821 placed by John Doe for ₹12,999.', user: 'buyer@shopsphere.com', timestamp: '2026-10-09 11:30 AM', type: 'order' },
    { id: 103, action: 'Stock Updated', details: 'Wireless ANC Headphones stock updated to 15.', user: 'seller@shopsphere.com', timestamp: '2026-10-09 12:00 PM', type: 'product' },
    { id: 104, action: 'Seller Status Update', details: 'Seller "Fashion Hub Accessories" was APPROVED by Admin.', user: 'admin@shopsphere.com', timestamp: '2026-10-09 01:45 PM', type: 'admin' },
    { id: 105, action: 'Coupon Applied', details: 'Coupon CLASSIC40 applied on Cart.', user: 'Priya Sharma', timestamp: '2026-10-09 02:10 PM', type: 'order' }
];

const adminService = {
    // ------------------------------------------------------------------------
    // 1. USERS DATA MANAGEMENT
    // ------------------------------------------------------------------------
    async getUsers() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY_ADMIN_USERS);
            if (stored) return JSON.parse(stored);
            localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(INITIAL_USERS));
            return INITIAL_USERS;
        } catch (e) {
            return INITIAL_USERS;
        }
    },

    async saveUsers(users) {
        localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(users));
    },

    async addUser(userData) {
        const users = await this.getUsers();
        const newUser = {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            role: userData.role || 'BUYER',
            phone: userData.phone || '',
            active: userData.active !== false,
            createdAt: new Date().toISOString()
        };
        users.unshift(newUser);
        await this.saveUsers(users);
        await this.logActivity('User Added', `Admin added new user "${newUser.name}" (${newUser.role}).`, 'admin');
        return newUser;
    },

    async updateUser(id, updateData) {
        const users = await this.getUsers();
        const idx = users.findIndex(u => u.id === parseInt(id) || u.id === id);
        if (idx === -1) throw new Error("User not found.");

        users[idx] = { ...users[idx], ...updateData };
        await this.saveUsers(users);
        await this.logActivity('User Updated', `Admin updated user "${users[idx].name}" profile & role (${users[idx].role}).`, 'admin');
        return users[idx];
    },

    async deleteUser(id) {
        let users = await this.getUsers();
        const user = users.find(u => u.id === parseInt(id) || u.id === id);
        users = users.filter(u => u.id !== parseInt(id) && u.id !== id);
        await this.saveUsers(users);
        if (user) {
            await this.logActivity('User Deleted', `Admin deleted user "${user.name}" (${user.email}).`, 'admin');
        }
        return true;
    },

    // ------------------------------------------------------------------------
    // 2. SELLERS DATA MANAGEMENT
    // ------------------------------------------------------------------------
    async getSellers() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY_ADMIN_SELLERS);
            if (stored) return JSON.parse(stored);
            localStorage.setItem(STORAGE_KEY_ADMIN_SELLERS, JSON.stringify(INITIAL_SELLERS));
            return INITIAL_SELLERS;
        } catch (e) {
            return INITIAL_SELLERS;
        }
    },

    async saveSellers(sellers) {
        localStorage.setItem(STORAGE_KEY_ADMIN_SELLERS, JSON.stringify(sellers));
    },

    async updateSellerStatus(sellerId, status) {
        const sellers = await this.getSellers();
        const idx = sellers.findIndex(s => s.id === parseInt(sellerId) || s.id === sellerId);
        if (idx === -1) throw new Error("Seller not found.");

        sellers[idx].status = status;
        sellers[idx].active = (status === 'APPROVED');
        await this.saveSellers(sellers);
        await this.logActivity('Seller Status Changed', `Seller "${sellers[idx].storeName}" status set to ${status}.`, 'admin');
        return sellers[idx];
    },

    async toggleSellerActive(sellerId) {
        const sellers = await this.getSellers();
        const idx = sellers.findIndex(s => s.id === parseInt(sellerId) || s.id === sellerId);
        if (idx === -1) throw new Error("Seller not found.");

        sellers[idx].active = !sellers[idx].active;
        await this.saveSellers(sellers);
        await this.logActivity('Seller Account Toggled', `Seller "${sellers[idx].storeName}" account ${sellers[idx].active ? 'Activated' : 'Deactivated'}.`, 'admin');
        return sellers[idx];
    },

    // ------------------------------------------------------------------------
    // 3. SYSTEM ACTIVITY LOGS
    // ------------------------------------------------------------------------
    async getLogs() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY_ADMIN_LOGS);
            if (stored) return JSON.parse(stored);
            localStorage.setItem(STORAGE_KEY_ADMIN_LOGS, JSON.stringify(INITIAL_LOGS));
            return INITIAL_LOGS;
        } catch (e) {
            return INITIAL_LOGS;
        }
    },

    async logActivity(action, details, type = 'admin') {
        const logs = await this.getLogs();
        const now = new Date();
        const timeStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        const currentUser = (typeof AuthStore !== 'undefined' && AuthStore.user) ? AuthStore.user.email : 'Admin';

        const newLog = {
            id: Date.now(),
            action,
            details,
            user: currentUser,
            timestamp: timeStr,
            type
        };

        logs.unshift(newLog);
        localStorage.setItem(STORAGE_KEY_ADMIN_LOGS, JSON.stringify(logs.slice(0, 50))); // Keep last 50 logs
        return newLog;
    },

    // ------------------------------------------------------------------------
    // 4. OVERVIEW STATS & REPORTS
    // ------------------------------------------------------------------------
    async getDashboardMetrics() {
        const users = await this.getUsers();
        const sellers = await this.getSellers();
        const products = (typeof productService !== 'undefined') ? await productService.getProducts() : [];
        const orders = (typeof orderService !== 'undefined') ? await orderService.getAllOrders() : [];

        const buyersCount = users.filter(u => u.role === 'BUYER').length;
        const sellersCount = users.filter(u => u.role === 'SELLER').length;
        const adminCount = users.filter(u => u.role === 'ADMIN').length;

        const totalSales = orders.reduce((sum, o) => {
            if (o.status !== 'Cancelled') {
                return sum + (o.summary ? o.summary.total : 0);
            }
            return sum;
        }, 0);

        return {
            totalUsers: users.length,
            buyersCount,
            sellersCount,
            adminCount,
            totalProducts: products.length,
            totalOrders: orders.length,
            totalSales,
            recentOrders: orders.slice(0, 5)
        };
    }
};

window.adminService = adminService;
