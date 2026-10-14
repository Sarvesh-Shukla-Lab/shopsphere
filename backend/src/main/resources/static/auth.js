/* ==========================================================================
   SHOPSPHERE - AUTHENTICATION & USER SESSION MANAGER
   ========================================================================== */

const AuthStore = {
    user: null,
    token: null,

    init() {
        const token = localStorage.getItem('shopsphere_token');
        const userStr = localStorage.getItem('shopsphere_user');
        
        if (token && userStr) {
            try {
                this.token = token;
                this.user = JSON.parse(userStr);
            } catch (e) {
                this.clear();
            }
        }
    },

    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('shopsphere_token', token);
        localStorage.setItem('shopsphere_user', JSON.stringify(user));
    },

    clear() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('shopsphere_token');
        localStorage.removeItem('shopsphere_user');
    },

    isLoggedIn() {
        return !!this.token && !!this.user;
    },

    getRole() {
        return this.user ? this.user.role : null;
    }
};

AuthStore.init();
