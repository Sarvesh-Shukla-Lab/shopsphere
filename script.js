/* ==========================================================================
   SHOPSPHERE - COMPLETE FRONTEND ENGINE WITH CART, COUPONS, CHECKOUT & ORDERS
   ========================================================================== */

// STATE MANAGEMENT
let wishlistItems = JSON.parse(localStorage.getItem('shopsphere_wishlist') || '[]');
let activeCategory = "all";
let searchQuery = "";
let sortBy = "featured";
let displayedProductCount = 12;
let searchTimeout = null;
window.pendingRedirectPage = null;

// DEBOUNCE UTILITY FOR SEARCH PERFORMANCE
function debounce(func, delay = 300) {
    return function(...args) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', async () => {
    initAuthEngine();
    initNavigation();
    initAnnouncementBar();
    initModalsAndDrawers();
    initPasswordToggles();
    
    // Seed and sync products stock from localStorage
    if (typeof productService !== 'undefined') {
        await productService.getProducts();
    }

    renderHomeCategories();
    renderFeaturedProducts();
    renderCatalogProducts();
    renderFullCategoriesPage();
    initContactForm();
    initNewsletterForm();
    initLoginAndRegisterForms();
    initProfileForms();
    initLoadMoreButton();

    // Sync Cart UI from cartService
    await updateCartUI();

    // Home Category Section click handlers
    document.querySelectorAll('.cat-card-modern').forEach(card => {
        card.addEventListener('click', () => {
            const cat = card.getAttribute('data-category') || card.getAttribute('data-cat');
            if (cat) {
                activeCategory = cat;
                displayedProductCount = 12;
                const productsTab = document.querySelector('[data-page="products"]');
                if (productsTab) productsTab.click();
                renderCatalogProducts();
            }
        });
    });

    // Home Page Promo Claim Discount button
    const claimBtn = document.querySelector('.promo-card-stitch .btn-classic-green');
    if (claimBtn) {
        claimBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const code = "CLASSIC40";
            if (navigator.clipboard && navigator.clipboard.writeText) {
                try { await navigator.clipboard.writeText(code); } catch (err) {}
            }
            try {
                const res = await cartService.applyCoupon(code);
                await updateCartUI();
                showToast(res.message, "success");
            } catch (err) {
                showToast(`🎉 Code CLASSIC40 copied to clipboard!`, 'success');
            }
        });
    }
});

// 1. AUTH & ROLE-BASED UI ENGINE
function initAuthEngine() {
    renderAuthUI();
}

function renderAuthUI() {
    const container = document.getElementById('navAuthContainer');
    if (!container) return;

    if (AuthStore.isLoggedIn()) {
        const user = AuthStore.user;
        const role = user.role || 'BUYER';
        
        let dashboardPageId = 'buyer-dashboard';
        if (role === 'ADMIN') dashboardPageId = 'admin-dashboard';
        else if (role === 'SELLER') dashboardPageId = 'seller-dashboard';

        container.innerHTML = `
            <div class="user-dropdown-wrapper">
                <button class="btn-user-profile" id="userMenuBtn" type="button">
                    ${user.avatar ? `<img src="${user.avatar}" alt="Avatar" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--orange-primary); flex-shrink: 0;">` : `<i class="fa-solid fa-user-circle" style="font-size: 1.15rem; color: var(--orange-primary);"></i>`}
                    <span class="user-name-label">My Account</span>
                    <span class="role-badge ${role.toLowerCase()}">${role}</span>
                    <i class="fa-solid fa-chevron-down arrow-icon"></i>
                </button>
                <div class="user-dropdown-menu" id="userDropdownMenu">
                    <div style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid var(--border-color);">
                        <img src="${user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=ff6b35&color=fff&bold=true`}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid var(--orange-primary); flex-shrink: 0;">
                        <div style="overflow: hidden; flex: 1;">
                            <div style="font-weight: 700; color: var(--text-primary); font-size: 0.88rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${user.name || 'User'}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${user.email || ''}</div>
                        </div>
                    </div>
                    <a href="#${dashboardPageId}-page" class="dropdown-item" data-page="${dashboardPageId}">
                        <i class="fa-solid fa-chart-line"></i> Dashboard
                    </a>
                    <a href="#orders-page" class="dropdown-item" data-page="orders">
                        <i class="fa-solid fa-box font-icon"></i> My Orders
                    </a>
                    <a href="#profile-page" class="dropdown-item" data-page="profile">
                        <i class="fa-solid fa-id-card"></i> My Profile
                    </a>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item logout-item" id="navLogoutBtn" type="button">
                        <i class="fa-solid fa-right-from-bracket"></i> Logout
                    </button>
                </div>
            </div>
        `;

        const menuBtn = document.getElementById('userMenuBtn');
        const menu = document.getElementById('userDropdownMenu');
        if (menuBtn && menu) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.toggle('active');
            });
            document.addEventListener('click', () => menu.classList.remove('active'));
        }

        container.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = link.getAttribute('data-page');
                switchPage(pageId);
                if (menu) menu.classList.remove('active');
            });
        });

        const logoutBtn = document.getElementById('navLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                AuthStore.clear();
                renderAuthUI();
                switchPage('home');
                showToast("Logged out successfully.", "success");
            });
        }

        populateProfileFields();
    } else {
        container.innerHTML = `
            <button class="btn-classic-login" id="loginModalToggle" type="button">
                <i class="fa-solid fa-user-circle"></i>
                <span>Login</span>
            </button>
        `;

        const loginBtn = document.getElementById('loginModalToggle');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                switchPage('login');
            });
        }
    }

    // Sync Mobile Drawer Auth UI
    const drawerFooter = document.getElementById('drawerFooter');
    if (drawerFooter) {
        if (AuthStore.isLoggedIn()) {
            const user = AuthStore.user;
            const role = user.role || 'BUYER';
            let dashboardPageId = 'buyer-dashboard';
            if (role === 'ADMIN') dashboardPageId = 'admin-dashboard';
            else if (role === 'SELLER') dashboardPageId = 'seller-dashboard';

            drawerFooter.innerHTML = `
                <div class="drawer-user-box" style="padding: 10px; background: var(--bg-secondary); border-radius: var(--radius-md); margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                    <img src="${user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=ff6b35&color=fff&bold=true`}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 2px solid var(--orange-primary); flex-shrink: 0;">
                    <div style="flex: 1; overflow: hidden;">
                        <div style="font-weight: 700; color: var(--navy-dark); display: flex; align-items: center; justify-content: space-between;">
                            <span>My Account</span>
                            <span class="badge-role ${role.toLowerCase()}">${role}</span>
                        </div>
                        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${user.email || ''}
                        </div>
                    </div>
                </div>
                <div style="display: grid; gap: 8px;">
                    <a href="#${dashboardPageId}-page" class="btn-classic-orange full-width text-center" data-page="${dashboardPageId}" style="display:block; text-align:center; padding:10px;">
                        <i class="fa-solid fa-chart-line"></i> Dashboard
                    </a>
                    <button class="btn-classic-secondary full-width" id="drawerLogoutBtn" type="button" style="padding:10px;">
                        <i class="fa-solid fa-right-from-bracket"></i> Logout
                    </button>
                </div>
            `;

            drawerFooter.querySelectorAll('[data-page]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const pageId = link.getAttribute('data-page');
                    switchPage(pageId);
                    const mobileDrawer = document.getElementById('mobileDrawer');
                    const drawerBackdrop = document.getElementById('drawerBackdrop');
                    if (mobileDrawer) mobileDrawer.classList.remove('active');
                    if (drawerBackdrop) drawerBackdrop.classList.remove('active');
                });
            });

            const drawerLogout = document.getElementById('drawerLogoutBtn');
            if (drawerLogout) {
                drawerLogout.addEventListener('click', () => {
                    AuthStore.clear();
                    renderAuthUI();
                    switchPage('home');
                    const mobileDrawer = document.getElementById('mobileDrawer');
                    const drawerBackdrop = document.getElementById('drawerBackdrop');
                    if (mobileDrawer) mobileDrawer.classList.remove('active');
                    if (drawerBackdrop) drawerBackdrop.classList.remove('active');
                    showToast("Logged out successfully.", "success");
                });
            }
        } else {
            drawerFooter.innerHTML = `
                <button class="btn-classic-primary full-width" id="drawerLoginBtn" type="button">
                    <i class="fa-solid fa-right-to-bracket"></i> Login / Register
                </button>
            `;
            const drawerLogin = document.getElementById('drawerLoginBtn');
            if (drawerLogin) {
                drawerLogin.addEventListener('click', () => {
                    switchPage('login');
                    const mobileDrawer = document.getElementById('mobileDrawer');
                    const drawerBackdrop = document.getElementById('drawerBackdrop');
                    if (mobileDrawer) mobileDrawer.classList.remove('active');
                    if (drawerBackdrop) drawerBackdrop.classList.remove('active');
                });
            }
        }
    }
}

function populateProfileFields() {
    if (!AuthStore.isLoggedIn()) return;
    const user = AuthStore.user;

    const nameInput = document.getElementById('profileName');
    const emailInput = document.getElementById('profileEmail');
    const roleInput = document.getElementById('profileRole');
    const phoneInput = document.getElementById('profilePhone');
    const avatarImg = document.getElementById('profileAvatarPreview');
    const btnRemoveAvatar = document.getElementById('btnRemoveAvatar');

    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (roleInput) roleInput.value = user.role || '';
    if (phoneInput) phoneInput.value = user.phone || '';

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=ff6b35&color=fff&bold=true`;
    if (avatarImg) {
        avatarImg.src = user.avatar || defaultAvatar;
    }
    if (btnRemoveAvatar) {
        btnRemoveAvatar.style.display = user.avatar ? 'inline-flex' : 'none';
    }
}

// 2. NAVIGATION & ROUTE GUARD SWITCHING
function initNavigation() {
    const navLinks = document.querySelectorAll('[data-page]');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    const mobileToggle = document.getElementById('mobileToggle');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const pageId = link.getAttribute('data-page');
            if (pageId) {
                e.preventDefault();
                switchPage(pageId);
            }
        });
    });

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            if (mobileDrawer) mobileDrawer.classList.toggle('active');
            if (drawerBackdrop) drawerBackdrop.classList.toggle('active');
        });
    }

    const drawerClose = document.getElementById('drawerClose');
    if (drawerClose) {
        drawerClose.addEventListener('click', () => {
            if (mobileDrawer) mobileDrawer.classList.remove('active');
            if (drawerBackdrop) drawerBackdrop.classList.remove('active');
        });
    }
    if (drawerBackdrop) {
        drawerBackdrop.addEventListener('click', () => {
            if (mobileDrawer) mobileDrawer.classList.remove('active');
            if (drawerBackdrop) drawerBackdrop.classList.remove('active');
        });
    }
}

function switchPage(pageId, pageParam = null) {
    const pageViews = document.querySelectorAll('.page-view');
    const protectedPages = ['admin-dashboard', 'seller-dashboard', 'buyer-dashboard', 'profile', 'checkout', 'orders', 'order-detail'];

    // Protected Route Check
    if (protectedPages.includes(pageId)) {
        if (!AuthStore.isLoggedIn()) {
            showToast("Please log in to proceed.", "orange");
            window.pendingRedirectPage = pageId;
            pageId = 'login';
        } else {
            // Role Guard
            const role = AuthStore.getRole();
            if (pageId === 'admin-dashboard' && role !== 'ADMIN') {
                showToast("Access Denied: Admin privileges required.", "orange");
                pageId = role === 'SELLER' ? 'seller-dashboard' : 'buyer-dashboard';
            } else if (pageId === 'seller-dashboard' && role !== 'SELLER' && role !== 'ADMIN') {
                showToast("Access Denied: Seller account required.", "orange");
                pageId = 'buyer-dashboard';
            }
        }
    }

    pageViews.forEach(view => {
        if (view.id === `${pageId}-page`) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });

    document.querySelectorAll('.nav-link, .drawer-link').forEach(link => {
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Route Dispatcher
    if (pageId === 'cart') renderFullCartPage();
    else if (pageId === 'checkout') renderCheckoutPage();
    else if (pageId === 'order-success') renderOrderSuccessPage(pageParam);
    else if (pageId === 'orders') renderOrdersListPage();
    else if (pageId === 'order-detail') renderOrderDetailPage(pageParam);
    else if (pageId === 'product-detail') renderProductDetailPage(pageParam);
    else if (pageId === 'profile') populateProfileFields();
    else if (pageId === 'admin-dashboard') renderAdminPanel();
    else if (pageId === 'seller-dashboard') renderSellerDashboard();
    else if (pageId === 'buyer-dashboard') renderBuyerDashboard();
    else if (pageId === 'wishlist') renderWishlistPage();

    // Close mobile drawer if open
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    if (mobileDrawer) mobileDrawer.classList.remove('active');
    if (drawerBackdrop) drawerBackdrop.classList.remove('active');
}

// 3. ANNOUNCEMENT BAR CLOSE
function initAnnouncementBar() {
    const closeBtn = document.getElementById('closeAnnouncement');
    const bar = document.getElementById('announcementBar');
    if (closeBtn && bar) {
        closeBtn.addEventListener('click', () => {
            bar.style.display = 'none';
        });
    }
}

// 4. MODALS & DRAWERS (CART, WISHLIST, SEARCH, LOGIN)
function initModalsAndDrawers() {
    const searchToggle = document.getElementById('searchToggle');
    const searchModalBar = document.getElementById('searchModalBar');
    const searchCloseBtn = document.getElementById('searchCloseBtn');
    const globalSearchInput = document.getElementById('globalSearchInput');

    const handleDebouncedSearch = debounce((val) => {
        const catalogSearch = document.getElementById('catalogSearchInput');
        if (catalogSearch) {
            catalogSearch.value = val;
        }
        searchQuery = val;
        displayedProductCount = 12;
        
        const productsPage = document.getElementById('products-page');
        if (productsPage && !productsPage.classList.contains('active')) {
            switchPage('products');
        }
        renderCatalogProducts();
    }, 300);

    if (searchToggle && searchModalBar) {
        searchToggle.addEventListener('click', () => {
            searchModalBar.classList.toggle('active');
            if (searchModalBar.classList.contains('active') && globalSearchInput) {
                globalSearchInput.focus();
            }
        });
        if (searchCloseBtn) {
            searchCloseBtn.addEventListener('click', () => searchModalBar.classList.remove('active'));
        }
        if (globalSearchInput) {
            globalSearchInput.addEventListener('input', (e) => {
                const val = e.target.value.toLowerCase().trim();
                handleDebouncedSearch(val);
            });
        }
    }

    // Cart Drawer Toggle
    const cartToggle = document.getElementById('cartToggle');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartClose = document.getElementById('cartClose');
    const cartBackdrop = document.getElementById('cartBackdrop');

    if (cartToggle) {
        cartToggle.addEventListener('click', () => {
            switchPage('cart');
        });
    }

    // Wishlist Button Toggle (Now navigates to page)
    const wishlistToggle = document.getElementById('wishlistToggle');
    const loginBackdrop = document.getElementById('loginBackdrop');

    if (wishlistToggle) {
        wishlistToggle.addEventListener('click', () => {
            switchPage('wishlist');
        });
    }

    // Login Modal Close
    const loginModal = document.getElementById('loginModal');
    const loginModalClose = document.getElementById('loginModalClose');
    const drawerLoginBtn = document.getElementById('drawerLoginBtn');

    const openLogin = () => {
        if (loginModal) loginModal.classList.add('active');
        if (loginBackdrop) loginBackdrop.classList.add('active');
    };
    const closeLogin = () => {
        if (loginModal) loginModal.classList.remove('active');
        if (loginBackdrop) loginBackdrop.classList.remove('active');
    };

    if (drawerLoginBtn) drawerLoginBtn.addEventListener('click', openLogin);
    if (loginModalClose) loginModalClose.addEventListener('click', closeLogin);
    if (loginBackdrop) {
        loginBackdrop.addEventListener('click', () => {
            if (loginModal) loginModal.classList.remove('active');
            loginBackdrop.classList.remove('active');
        });
    }

    // Cart Drawer Checkout Button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            const summary = await cartService.getCartSummary();
            if (summary.items.length === 0) {
                showToast("Your cart is empty!", "orange");
                return;
            }
            if (cartDrawer) cartDrawer.classList.remove('active');
            if (cartBackdrop) cartBackdrop.classList.remove('active');
            switchPage('checkout');
        });
    }
}

// 5. PASSWORD VISIBILITY TOGGLE
function initPasswordToggles() {
    document.querySelectorAll('.pw-toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const input = btn.previousElementSibling;
            if (input && (input.type === 'password' || input.type === 'text')) {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
                }
            }
        });
    });
}

// 6. LOGIN & REGISTER FORM INTEGRATION
function initLoginAndRegisterForms() {
    const tabLogin = document.getElementById('tabLoginBtn');
    const tabRegister = document.getElementById('tabRegisterBtn');
    const formSignIn = document.getElementById('formSignIn');
    const formRegister = document.getElementById('formRegister');

    if (tabLogin && tabRegister) {
        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            if (formSignIn) formSignIn.classList.add('active');
            if (formRegister) formRegister.classList.remove('active');
        });
        tabRegister.addEventListener('click', () => {
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            if (formRegister) formRegister.classList.add('active');
            if (formSignIn) formSignIn.classList.remove('active');
        });
    }

    document.querySelectorAll('.role-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.role-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            const radio = option.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    });

    if (formSignIn) {
        formSignIn.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail')?.value.trim();
            const password = document.getElementById('loginPassword')?.value;
            const submitBtn = document.getElementById('btnSubmitLogin');

            if (!email || !password) {
                showToast("Please enter email and password.", "orange");
                return;
            }

            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Signing In...`;
                }

                // Call actual backend Spring Boot API
                const res = await apiFetch('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });

                if (res && res.data) {
                    AuthStore.setAuth(res.data.token, res.data);
                    renderAuthUI();
                    
                    showToast(`Welcome back, ${res.data.name}!`, "success");
                    formSignIn.reset();

                    const userRole = res.data.role;
                    if (window.pendingRedirectPage) {
                        const target = window.pendingRedirectPage;
                        window.pendingRedirectPage = null;
                        switchPage(target);
                    } else if (userRole === 'ADMIN') {
                        switchPage('admin-dashboard');
                    } else if (userRole === 'SELLER') {
                        switchPage('seller-dashboard');
                    } else {
                        switchPage('home');
                    }
                }
            } catch (err) {
                showToast(err.message || "Invalid credentials", "orange");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<span>Sign In To Account</span>`;
                }
            }
        });
    }

    if (formRegister) {
        formRegister.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('regName')?.value.trim();
            const email = document.getElementById('regEmail')?.value.trim();
            const phone = document.getElementById('regPhone')?.value.trim();
            const password = document.getElementById('regPassword')?.value;
            const roleRadio = document.querySelector('input[name="registerRole"]:checked');
            const role = roleRadio ? roleRadio.value : 'BUYER';
            const submitBtn = document.getElementById('btnSubmitRegister');

            const storeName = document.getElementById('regStoreName')?.value.trim();
            const gstNumber = document.getElementById('regGstNumber')?.value.trim();
            const sellingCategory = document.getElementById('regSellingCategory')?.value;
            const productDetails = document.getElementById('regProductDetails')?.value.trim();

            if (!name || !email || !password || !phone) {
                showToast("Please fill in required fields (Name, Email, Phone, Password).", "orange");
                return;
            }

            if (role === 'SELLER' && (!storeName || !gstNumber)) {
                showToast("Please enter your Store Name and GSTIN Number.", "orange");
                return;
            }

            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...`;
                }

                const payload = { 
                    name, email, password, phone, role,
                    storeName: role === 'SELLER' ? storeName : null,
                    gstNumber: role === 'SELLER' ? gstNumber : null,
                    sellingCategory: role === 'SELLER' ? sellingCategory : null,
                    productDetails: role === 'SELLER' ? productDetails : null
                };

                // Call actual backend Spring Boot API
                const res = await apiFetch('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                if (res && res.data) {
                    const userData = { ...res.data, storeName, gstNumber, sellingCategory, productDetails };
                    AuthStore.setAuth(res.data.token, userData);
                    renderAuthUI();
                    
                    showToast(`Account created successfully! Welcome, ${res.data.name}.`, "success");
                    formRegister.reset();

                    if (window.pendingRedirectPage) {
                        const target = window.pendingRedirectPage;
                        window.pendingRedirectPage = null;
                        switchPage(target);
                    } else if (role === 'ADMIN') {
                        switchPage('admin-dashboard');
                    } else if (role === 'SELLER') {
                        switchPage('seller-dashboard');
                    } else {
                        switchPage('home');
                    }
                }
            } catch (err) {
                showToast(err.message || "Failed to create account", "orange");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<span>Create Account Now</span>`;
                }
            }
        });
    }
}

// 7. PROFILE & PASSWORD FORMS INTEGRATION
let pendingProfileAvatar = null;

function initProfileForms() {
    const profileForm = document.getElementById('profileUpdateForm');
    const passwordForm = document.getElementById('changePasswordForm');
    const imageInput = document.getElementById('profileImageInput');
    const avatarPreview = document.getElementById('profileAvatarPreview');
    const btnRemoveAvatar = document.getElementById('btnRemoveAvatar');

    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                showToast("Please select a valid image file (JPG, PNG, WebP).", "orange");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showToast("Image size must be less than 5MB.", "orange");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                pendingProfileAvatar = event.target.result;
                if (avatarPreview) avatarPreview.src = pendingProfileAvatar;
                if (btnRemoveAvatar) btnRemoveAvatar.style.display = 'inline-flex';
                showToast("Photo selected! Click 'Update Profile Information' to save.", "success");
            };
            reader.readAsDataURL(file);
        });
    }

    if (btnRemoveAvatar) {
        btnRemoveAvatar.addEventListener('click', () => {
            pendingProfileAvatar = '';
            const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(AuthStore.user?.name || 'User')}&background=ff6b35&color=fff&bold=true`;
            if (avatarPreview) avatarPreview.src = defaultAvatar;
            btnRemoveAvatar.style.display = 'none';
            if (imageInput) imageInput.value = '';
            showToast("Photo removed. Click 'Update Profile Information' to save.", "orange");
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('profileName')?.value.trim();
            const phone = document.getElementById('profilePhone')?.value.trim();

            if (!name) {
                showToast("Name is required.", "orange");
                return;
            }

            const avatarToSend = pendingProfileAvatar !== null ? pendingProfileAvatar : (AuthStore.user?.avatar || '');

            try {
                const res = await apiFetch('/auth/profile', {
                    method: 'PUT',
                    body: JSON.stringify({ name, phone, avatar: avatarToSend })
                });

                if (res.success && res.data) {
                    if (AuthStore.user) {
                        AuthStore.user.name = res.data.name;
                        AuthStore.user.phone = res.data.phone;
                        AuthStore.user.avatar = res.data.avatar || null;
                        localStorage.setItem('shopsphere_user', JSON.stringify(AuthStore.user));
                    }
                    pendingProfileAvatar = null;
                    renderAuthUI();
                    populateProfileFields();
                    showToast("Profile information and photo updated successfully!", "success");
                }
            } catch (err) {
                // Fallback update in local AuthStore
                if (AuthStore.user) {
                    AuthStore.user.name = name;
                    AuthStore.user.phone = phone;
                    if (pendingProfileAvatar !== null) {
                        AuthStore.user.avatar = pendingProfileAvatar || null;
                    }
                    localStorage.setItem('shopsphere_user', JSON.stringify(AuthStore.user));
                    pendingProfileAvatar = null;
                    renderAuthUI();
                    populateProfileFields();
                    showToast("Profile information updated successfully!", "success");
                } else {
                    showToast(err.message || "Failed to update profile", "orange");
                }
            }
        });
    }

    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const oldPassword = document.getElementById('changeOldPassword')?.value;
            const newPassword = document.getElementById('changeNewPassword')?.value;

            if (!oldPassword || !newPassword) {
                showToast("Please enter current and new password.", "orange");
                return;
            }

            try {
                const res = await apiFetch('/auth/change-password', {
                    method: 'PUT',
                    body: JSON.stringify({ oldPassword, newPassword })
                });

                if (res.success) {
                    showToast("Security password updated successfully!", "success");
                    passwordForm.reset();
                }
            } catch (err) {
                showToast(err.message || "Failed to change password", "orange");
            }
        });
    }
}

// 8. RENDER CATEGORIES
function renderHomeCategories() {
    const grid = document.getElementById('homeCategoriesGrid');
    if (!grid || typeof CATEGORIES === 'undefined') return;

    grid.innerHTML = CATEGORIES.map(cat => {
        const count = getProductCountByCategory(cat.id);
        return `
            <div class="category-card" data-cat="${cat.id}">
                <div class="cat-icon-box">
                    <i class="${cat.icon}"></i>
                </div>
                <h3>${cat.name}</h3>
                <p>${count} Product${count === 1 ? '' : 's'}</p>
            </div>
        `;
    }).join('');

    grid.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const catId = card.getAttribute('data-cat');
            activeCategory = catId;
            displayedProductCount = 12;
            const prodPageBtn = document.querySelector('[data-page="products"]');
            if (prodPageBtn) prodPageBtn.click();
            renderCatalogProducts();
        });
    });
}

function renderFullCategoriesPage() {
    const grid = document.getElementById('fullCategoriesGrid');
    if (!grid || typeof CATEGORIES === 'undefined') return;

    grid.innerHTML = CATEGORIES.map(cat => {
        const count = getProductCountByCategory(cat.id);
        return `
            <div class="category-large-card">
                <div class="cat-icon-box">
                    <i class="${cat.icon}"></i>
                </div>
                <h3>${cat.name}</h3>
                <p style="color: var(--text-muted); margin: 8px 0 20px;">${cat.desc}</p>
                <span style="font-weight: 700; color: var(--green-primary); margin-bottom: 20px;">${count} Product${count === 1 ? '' : 's'} Available</span>
                <button class="btn-classic-orange explore-cat-btn" data-cat="${cat.id}">
                    Browse ${cat.name} <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;
    }).join('');

    grid.querySelectorAll('.explore-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activeCategory = btn.getAttribute('data-cat');
            displayedProductCount = 12;
            const prodPageBtn = document.querySelector('[data-page="products"]');
            if (prodPageBtn) prodPageBtn.click();
            renderCatalogProducts();
        });
    });
}

// 9. RENDER PRODUCTS & PRODUCT CARD BUILDER
function createProductCardHTML(p) {
    const isWishlisted = wishlistItems.some(w => w.id === p.id);
    const title = p.title || p.name;
    const revCount = p.reviewsCount || p.reviews || 0;
    const isOutOfStock = p.stock === 0;

    return `
        <div class="product-card" data-id="${p.id}">
            <div class="product-img-wrapper">
                <img src="${p.image}" alt="${title}" class="product-img" loading="lazy" decoding="async" onerror="handleImgError(this)">
                ${p.discount ? `<span class="product-badge-discount">${p.discount}</span>` : ''}
                <button class="product-wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${p.id}" aria-label="Add to Wishlist">
                    <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                </button>
            </div>
            <div class="product-details">
                <span class="product-category-tag">${p.categoryName}</span>
                <h3 class="product-title">${title}</h3>
                <div class="product-rating">
                    <i class="fa-solid fa-star"></i>
                    <span>${p.rating}</span>
                    <span class="rating-count">(${revCount})</span>
                </div>
                <div class="product-price" style="margin-bottom: 14px;">
                    <span class="current-price">${formatPrice(p.price)}</span>
                    ${p.oldPrice ? `<span class="old-price">${formatPrice(p.oldPrice)}</span>` : ''}
                </div>
                <div class="fp-actions">
                    <button class="btn-fp-cart" data-id="${p.id}" ${isOutOfStock ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''}>
                        <i class="fa-solid fa-cart-shopping"></i> ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button class="btn-fp-details" data-id="${p.id}">
                        <i class="fa-solid fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        </div>
    `;
}

function attachProductCardListeners(container) {
    container.querySelectorAll('.btn-fp-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            if (id) addToCart(id);
        });
    });

    container.querySelectorAll('.btn-fp-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            if (id) navigateToProductDetail(id);
        });
    });

    container.querySelectorAll('.product-wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            if (id) toggleWishlist(id, btn);
        });
    });

    container.querySelectorAll('.product-card').forEach((card) => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-fp-cart') && !e.target.closest('.btn-fp-details') && !e.target.closest('.product-wishlist-btn')) {
                const id = parseInt(card.getAttribute('data-id'));
                if (id) navigateToProductDetail(id);
            }
        });
    });
}

function navigateToProductDetail(productId) {
    switchPage('product-detail', productId);
}

// RENDER STANDALONE PRODUCT DETAIL PAGE
async function renderProductDetailPage(productId) {
    const container = document.getElementById('productDetailContainer');
    if (!container) return;

    const product = await productService.getProductById(productId);

    if (!product) {
        container.innerHTML = `
            <div style="text-align: center; padding: 80px 20px;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 4rem; color: var(--orange-primary); margin-bottom: 16px;"></i>
                <h2 style="font-family: var(--font-heading); font-size: 2rem;">Product Not Found</h2>
                <p style="color: var(--text-muted); margin: 12px 0 24px;">The product you are looking for does not exist or has been removed.</p>
                <button class="btn-classic-orange" onclick="switchPage('products')">
                    <i class="fa-solid fa-arrow-left"></i> Back to Product Catalog
                </button>
            </div>
        `;
        return;
    }

    // Track product view for Buyer Browsing History
    trackProductView(product);

    const isWishlisted = wishlistItems.some(w => w.id === product.id);
    const title = product.title || product.name;
    const revCount = product.reviewsCount || product.reviews || 0;
    const stock = product.stock !== undefined ? product.stock : 20;

    let stockBadgeHTML = '';
    if (stock > 5) {
        stockBadgeHTML = `<span class="detail-stock-badge in-stock"><i class="fa-solid fa-circle-check"></i> In Stock (${stock} available)</span>`;
    } else if (stock > 0) {
        stockBadgeHTML = `<span class="detail-stock-badge low-stock"><i class="fa-solid fa-clock"></i> Only ${stock} left in stock - Order Soon!</span>`;
    } else {
        stockBadgeHTML = `<span class="detail-stock-badge out-of-stock"><i class="fa-solid fa-circle-xmark"></i> Out of Stock</span>`;
    }

    const imagesList = (product.images && product.images.length) ? product.images : [product.image];
    const allProds = await productService.getProducts();
    const relatedProducts = allProds.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

    container.innerHTML = `
        <div class="detail-breadcrumb">
            <a href="#home-page" onclick="switchPage('home')">Home</a>
            <i class="fa-solid fa-chevron-right"></i>
            <a href="#products-page" onclick="activeCategory='${product.category}'; displayedProductCount=12; switchPage('products'); renderCatalogProducts();">${product.categoryName}</a>
            <i class="fa-solid fa-chevron-right"></i>
            <span>${title}</span>
        </div>

        <div class="product-detail-layout">
            <div class="detail-gallery">
                <div class="detail-main-img-box">
                    <img src="${imagesList[0]}" alt="${title}" id="detailMainImage" class="detail-main-img" onerror="handleImgError(this)">
                </div>
                ${imagesList.length > 1 ? `
                    <div class="detail-thumbnails">
                        ${imagesList.map((imgUrl, idx) => `
                            <button class="detail-thumb-btn ${idx === 0 ? 'active' : ''}" onclick="switchDetailImage('${imgUrl}', this)">
                                <img src="${imgUrl}" alt="Thumbnail ${idx + 1}" onerror="handleImgError(this)">
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>

            <div class="detail-summary">
                <span class="detail-category-badge"><i class="fa-solid fa-tag"></i> ${product.categoryName}</span>
                <h1 class="detail-title">${title}</h1>

                <div class="detail-meta-row">
                    <div class="detail-stars">
                        <i class="fa-solid fa-star"></i>
                        <span>${product.rating}</span>
                    </div>
                    <span class="detail-review-count">(${revCount} customer reviews)</span>
                    <span class="detail-seller-tag"><i class="fa-solid fa-store text-orange"></i> ${product.sellerName || 'ShopSphere Official'}</span>
                </div>

                <div class="detail-price-row">
                    <span class="detail-current-price">${formatPrice(product.price)}</span>
                    ${product.oldPrice ? `<span class="detail-old-price">${formatPrice(product.oldPrice)}</span>` : ''}
                    ${product.discount ? `<span class="detail-discount-badge">${product.discount}</span>` : ''}
                </div>

                ${stockBadgeHTML}

                <p class="detail-description">${product.description}</p>

                <div class="detail-actions-wrapper">
                    <div class="detail-qty-group">
                        <span style="font-weight: 700; font-size: 0.95rem;">Quantity:</span>
                        <div class="detail-qty-ctrl">
                            <button class="detail-qty-btn" onclick="adjustDetailQty(-1)">-</button>
                            <input type="number" id="detailQtyInput" class="detail-qty-input" value="1" min="1" max="${stock > 0 ? stock : 1}" readonly>
                            <button class="detail-qty-btn" onclick="adjustDetailQty(1)">+</button>
                        </div>
                    </div>

                    <div class="detail-btn-row">
                        <button class="btn-classic-orange" ${stock === 0 ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''} onclick="addDetailProductToCart(${product.id})">
                            <i class="fa-solid fa-cart-shopping"></i> ${stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button class="btn-classic-green" ${stock === 0 ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''} onclick="buyNowDetailProduct(${product.id})">
                            <i class="fa-solid fa-bolt"></i> Buy Now
                        </button>
                        <button class="detail-wishlist-toggle-btn ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist(${product.id}, this)">
                            <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                        </button>
                    </div>
                </div>

                <div class="pincode-checker-box">
                    <div class="pincode-header">
                        <i class="fa-solid fa-location-dot text-orange"></i>
                        <span>Delivery Estimate & Serviceability</span>
                    </div>
                    <div class="pincode-form">
                        <input type="text" id="pincodeInput" class="pincode-input" placeholder="Enter 6-digit Pincode (e.g. 110001)" maxlength="6">
                        <button class="pincode-btn" onclick="checkDeliveryPincode()">Check Pincode</button>
                    </div>
                    <div id="pincodeResult" class="pincode-result" style="display: none;"></div>
                </div>

                <div class="detail-trust-features">
                    <div class="detail-trust-badge">
                        <i class="fa-solid fa-truck-fast text-green"></i>
                        <span>Free Delivery over ₹999</span>
                    </div>
                    <div class="detail-trust-badge">
                        <i class="fa-solid fa-arrow-rotate-left text-orange"></i>
                        <span>7-Day Easy Returns</span>
                    </div>
                    <div class="detail-trust-badge">
                        <i class="fa-solid fa-shield-halved text-yellow"></i>
                        <span>100% Secure Payment</span>
                    </div>
                </div>
            </div>
        </div>

        ${relatedProducts.length > 0 ? `
            <div class="related-products-section">
                <div class="related-products-header">
                    <h3>Related Products You Might Like</h3>
                </div>
                <div class="products-grid" id="relatedProductsGrid">
                    ${relatedProducts.map(p => createProductCardHTML(p)).join('')}
                </div>
            </div>
        ` : ''}
    `;

    if (relatedProducts.length > 0) {
        const relGrid = document.getElementById('relatedProductsGrid');
        if (relGrid) attachProductCardListeners(relGrid);
    }
}

window.switchDetailImage = function(imgUrl, btn) {
    const mainImg = document.getElementById('detailMainImage');
    if (mainImg) mainImg.src = imgUrl;
    document.querySelectorAll('.detail-thumb-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
};

window.adjustDetailQty = function(delta) {
    const input = document.getElementById('detailQtyInput');
    if (!input) return;
    let val = parseInt(input.value) || 1;
    val += delta;
    if (val < 1) val = 1;
    const max = parseInt(input.getAttribute('max')) || 99;
    if (val > max) val = max;
    input.value = val;
};

window.addDetailProductToCart = async function(productId) {
    const qtyInput = document.getElementById('detailQtyInput');
    const qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
    await addToCart(productId, qty);
};

window.buyNowDetailProduct = async function(productId) {
    await addDetailProductToCart(productId);
    switchPage('checkout');
};

window.checkDeliveryPincode = function() {
    const input = document.getElementById('pincodeInput');
    const resultDiv = document.getElementById('pincodeResult');
    if (!input || !resultDiv) return;

    const pin = input.value.trim();
    if (!/^\d{6}$/.test(pin)) {
        resultDiv.style.display = 'flex';
        resultDiv.style.color = '#EF4444';
        resultDiv.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Please enter a valid 6-digit Pincode.`;
        return;
    }

    const now = new Date();
    now.setDate(now.getDate() + 4);
    const deliveryDateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    resultDiv.style.display = 'flex';
    resultDiv.style.color = 'var(--green-primary)';
    resultDiv.innerHTML = `<i class="fa-solid fa-truck-fast"></i> Delivery available to <strong>${pin}</strong> by <strong>${deliveryDateStr}</strong> (Eligible for Free Shipping)`;
};

async function renderFeaturedProducts() {
    const grid = document.getElementById('homeFeaturedProductsGrid');
    if (!grid) return;

    const products = await productService.getProducts();
    const featured = products.slice(0, 8);
    grid.innerHTML = featured.map(p => createProductCardHTML(p)).join('');
    attachProductCardListeners(grid);
}

async function renderCatalogProducts() {
    const grid = document.getElementById('catalogProductsGrid');
    const noMsg = document.getElementById('noProductsMsg');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    const loadMoreCount = document.getElementById('loadMoreRemainingCount');
    if (!grid) return;

    const products = await productService.getProducts();

    let filtered = products.filter(p => {
        const matchesCategory = activeCategory === "all" || p.category === activeCategory;
        const matchesSearch = searchQuery === "" || 
            (p.title && p.title.toLowerCase().includes(searchQuery)) ||
            (p.name && p.name.toLowerCase().includes(searchQuery)) ||
            (p.categoryName && p.categoryName.toLowerCase().includes(searchQuery));
        return matchesCategory && matchesSearch;
    });

    if (sortBy === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
    }

    if (filtered.length === 0) {
        grid.innerHTML = '';
        if (noMsg) noMsg.classList.remove('hidden');
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
    } else {
        if (noMsg) noMsg.classList.add('hidden');
        const displayed = filtered.slice(0, displayedProductCount);
        grid.innerHTML = displayed.map(p => createProductCardHTML(p)).join('');
        attachProductCardListeners(grid);

        if (filtered.length > displayedProductCount) {
            if (loadMoreContainer) loadMoreContainer.style.display = 'block';
            if (loadMoreCount) loadMoreCount.textContent = filtered.length - displayedProductCount;
        } else {
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
        }
    }

    document.querySelectorAll('#categoryFilterPills .pill-btn').forEach(btn => {
        if (btn.getAttribute('data-cat') === activeCategory) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function initLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            displayedProductCount += 12;
            renderCatalogProducts();
        });
    }
}

// CATALOG TOOLBAR LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    const pills = document.querySelectorAll('#categoryFilterPills .pill-btn');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            activeCategory = pill.getAttribute('data-cat');
            displayedProductCount = 12;
            renderCatalogProducts();
        });
    });

    const catalogSearchInput = document.getElementById('catalogSearchInput');
    const debouncedCatalogSearch = debounce((val) => {
        searchQuery = val;
        displayedProductCount = 12;
        renderCatalogProducts();
    }, 300);

    if (catalogSearchInput) {
        catalogSearchInput.addEventListener('input', (e) => {
            debouncedCatalogSearch(e.target.value.toLowerCase().trim());
        });
    }

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortBy = e.target.value;
            displayedProductCount = 12;
            renderCatalogProducts();
        });
    }

    const resetBtn = document.getElementById('resetFiltersBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            activeCategory = "all";
            searchQuery = "";
            displayedProductCount = 12;
            if (catalogSearchInput) catalogSearchInput.value = "";
            renderCatalogProducts();
        });
    }
});

// 10. CART ENGINE INTEGRATION (USING ASYNC CART SERVICE)
async function addToCart(productId, qty = 1) {
    try {
        await cartService.addToCart(productId, qty);
        await updateCartUI();
        const p = await productService.getProductById(productId);
        const name = p ? (p.title || p.name) : "Item";
        showToast(`Added "${name.slice(0, 20)}..." to Cart!`, 'success');
    } catch (e) {
        showToast(e.message || "Could not add to cart.", 'orange');
    }
}

async function updateCartUI() {
    const summary = await cartService.getCartSummary();
    const { items, subtotal, coupon, couponDiscount, gst, deliveryFee, total, totalItemsCount } = summary;

    const cartCountEl = document.getElementById('cartCount');
    const cartDrawerCount = document.getElementById('cartDrawerCount');
    const cartItemsBody = document.getElementById('cartDrawerItems');
    const cartSubtotalEl = document.getElementById('cartSubtotal');
    const cartCouponRow = document.getElementById('cartCouponRow');
    const cartCouponDiscountEl = document.getElementById('cartCouponDiscount');
    const cartTaxEl = document.getElementById('cartTax');
    const cartDeliveryEl = document.getElementById('cartDelivery');
    const cartTotalEl = document.getElementById('cartTotal');
    const shippingText = document.getElementById('shippingProgressText');
    const shippingFill = document.getElementById('shippingProgressFill');

    if (cartCountEl) cartCountEl.textContent = totalItemsCount;
    if (cartDrawerCount) cartDrawerCount.textContent = `${totalItemsCount} item${totalItemsCount === 1 ? '' : 's'}`;

    const freeThreshold = 999;
    if (shippingText && shippingFill) {
        if (subtotal >= freeThreshold || (coupon && coupon.type === 'freeship') || totalItemsCount === 0) {
            shippingText.innerHTML = subtotal >= freeThreshold ? "🎉 You unlocked <strong>FREE Delivery!</strong>" : (coupon && coupon.type === 'freeship' ? "🎉 Free Shipping Coupon Applied!" : "Add <strong>₹999</strong> more for Free Delivery!");
            shippingFill.style.width = (subtotal >= freeThreshold || (coupon && coupon.type === 'freeship')) ? "100%" : "0%";
        } else {
            const diff = freeThreshold - subtotal;
            const pct = (subtotal / freeThreshold) * 100;
            shippingText.innerHTML = `Add <strong>${formatPrice(diff)}</strong> more for Free Delivery!`;
            shippingFill.style.width = `${pct}%`;
        }
    }

    if (cartItemsBody) {
        if (items.length === 0) {
            cartItemsBody.innerHTML = `
                <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
                    <i class="fa-solid fa-bag-shopping" style="font-size: 3rem; opacity: 0.3; margin-bottom: 12px;"></i>
                    <p style="font-weight: 700;">Your cart is currently empty.</p>
                </div>
            `;
        } else {
            cartItemsBody.innerHTML = items.map(item => `
                <div class="cart-item-card">
                    <img src="${item.image}" alt="${item.title || item.name}" class="cart-item-img" onerror="handleImgError(this)">
                    <div class="cart-item-details">
                        <div class="cart-item-title" onclick="navigateToProductDetail(${item.id})">${item.title || item.name}</div>
                        <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
                        <div class="cart-qty-ctrl">
                            <button class="qty-btn" onclick="handleCartQtyChange(${item.id}, ${item.qty - 1})">-</button>
                            <span>${item.qty}</span>
                            <button class="qty-btn" onclick="handleCartQtyChange(${item.id}, ${item.qty + 1})">+</button>
                            <button style="margin-left: auto; color: var(--text-muted);" onclick="handleRemoveCartItem(${item.id})">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    // Side Drawer Coupon Box
    const couponBox = document.getElementById('cartDrawerCouponBox');
    if (couponBox) {
        const availableCoupons = await couponService.getAllCoupons();
        if (coupon) {
            couponBox.innerHTML = `
                <div class="coupon-applied-pill" style="margin-bottom: 0;">
                    <div>
                        <i class="fa-solid fa-ticket"></i>
                        <span>${coupon.code} Applied (${coupon.type === 'freeship' ? 'Free Shipping' : '-' + formatPrice(couponDiscount)})</span>
                    </div>
                    <button type="button" onclick="handleRemoveCoupon()" style="color: #DC2626; font-weight: 800;"><i class="fa-solid fa-xmark"></i></button>
                </div>
            `;
        } else {
            couponBox.innerHTML = `
                <div class="coupon-box-title" style="font-size: 0.85rem;"><i class="fa-solid fa-ticket text-orange"></i> Have a Coupon?</div>
                <div class="coupon-input-group" style="margin-bottom: 8px;">
                    <input type="text" id="cartDrawerCouponInput" class="coupon-input" placeholder="ENTER CODE" style="padding: 6px 10px; font-size: 0.85rem;">
                    <button type="button" class="btn-classic-orange" onclick="handleApplyCoupon('cartDrawerCouponInput')" style="padding: 6px 14px; font-size: 0.82rem;">Apply</button>
                </div>
                <div class="coupon-pills-list">
                    ${availableCoupons.map(c => `
                        <button type="button" class="coupon-tag-btn" onclick="handleSelectCouponPill('${c.code}', 'cartDrawerCouponInput')">
                            ${c.code}
                        </button>
                    `).join('')}
                </div>
            `;
        }
    }

    if (cartSubtotalEl) cartSubtotalEl.textContent = formatPrice(subtotal);

    if (cartCouponRow && cartCouponDiscountEl) {
        if (couponDiscount > 0 || (coupon && coupon.type === 'freeship')) {
            cartCouponRow.style.display = 'flex';
            cartCouponDiscountEl.textContent = coupon && coupon.type === 'freeship' ? 'Free Shipping' : `-${formatPrice(couponDiscount)}`;
        } else {
            cartCouponRow.style.display = 'none';
        }
    }

    if (cartTaxEl) cartTaxEl.textContent = formatPrice(gst);
    if (cartDeliveryEl) cartDeliveryEl.textContent = deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee);
    if (cartTotalEl) cartTotalEl.textContent = formatPrice(total);

    const cartPage = document.getElementById('cart-page');
    if (cartPage && cartPage.classList.contains('active')) {
        renderFullCartPage();
    }
}

window.handleCartQtyChange = async function(productId, newQty) {
    try {
        await cartService.updateQuantity(productId, newQty);
        await updateCartUI();
    } catch (e) {
        showToast(e.message || "Failed to update quantity", "orange");
    }
};

window.handleRemoveCartItem = async function(productId) {
    try {
        await cartService.removeFromCart(productId);
        await updateCartUI();
        showToast("Item removed from cart.", "orange");
    } catch (e) {
        showToast(e.message || "Failed to remove item", "orange");
    }
};

window.handleApplyCoupon = async function(inputId) {
    const input = document.getElementById(inputId);
    const code = input ? input.value.trim() : '';
    if (!code) {
        showToast("Please enter a coupon code.", "orange");
        return;
    }
    try {
        const res = await cartService.applyCoupon(code);
        await updateCartUI();
        showToast(res.message, "success");
    } catch (e) {
        showToast(e.message || "Invalid coupon code", "orange");
    }
};

window.handleRemoveCoupon = async function() {
    try {
        await cartService.removeCoupon();
        await updateCartUI();
        showToast("Coupon removed.", "orange");
    } catch (e) {
        showToast(e.message || "Failed to remove coupon", "orange");
    }
};

window.handleSelectCouponPill = function(code, inputId) {
    const input = document.getElementById(inputId);
    if (input) input.value = code;
    handleApplyCoupon(inputId);
};

// FULL CART PAGE RENDERER
async function renderFullCartPage() {
    const container = document.getElementById('fullCartContainer');
    if (!container) return;

    const summary = await cartService.getCartSummary();
    const { items, subtotal, coupon, couponDiscount, gst, deliveryFee, total } = summary;
    const availableCoupons = await couponService.getAllCoupons();

    if (items.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 80px 20px; background: #FFF; border: 2px solid var(--border-color); border-radius: var(--radius-lg);">
                <i class="fa-solid fa-bag-shopping" style="font-size: 4rem; color: var(--text-light); margin-bottom: 20px;"></i>
                <h2 style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; margin-bottom: 12px;">Your Cart is Currently Empty</h2>
                <p style="color: var(--text-muted); max-width: 480px; margin: 0 auto 28px;">Before proceeding to checkout, you must add some products to your shopping cart. You will find a lot of interesting products on our shop page.</p>
                <a href="#products-page" class="btn-classic-orange" data-page="products" style="display: inline-flex;">
                    <i class="fa-solid fa-compass"></i> Explore Products Now
                </a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="full-cart-grid">
            <div class="cart-items-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 2px solid var(--border-color);">
                    <h3 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800;">
                        Cart Items (${items.reduce((acc, i) => acc + i.qty, 0)})
                    </h3>
                    <button type="button" onclick="handleClearCartAll()" style="color: var(--text-muted); font-size: 0.9rem; font-weight: 700;">
                        <i class="fa-solid fa-trash-can text-orange"></i> Clear Cart
                    </button>
                </div>

                <div class="cart-table-header">
                    <span>Product Details</span>
                    <span>Price</span>
                    <span style="text-align: center;">Quantity</span>
                    <span style="text-align: right;">Subtotal</span>
                    <span></span>
                </div>

                <div class="cart-table-body">
                    ${items.map(item => `
                        <div class="cart-table-row">
                            <div class="cart-product-info">
                                <img src="${item.image}" alt="${item.title}" class="cart-product-img" onerror="handleImgError(this)">
                                <div>
                                    <div class="cart-product-title" onclick="navigateToProductDetail(${item.id})">${item.title}</div>
                                    <div class="cart-product-cat">${item.categoryName || 'General'}</div>
                                    <span style="font-size: 0.8rem; color: var(--green-primary); font-weight: 700;">In Stock</span>
                                </div>
                            </div>
                            <div style="font-weight: 700;">${formatPrice(item.price)}</div>
                            <div style="display: flex; justify-content: center;">
                                <div class="detail-qty-ctrl">
                                    <button class="detail-qty-btn" onclick="handleCartQtyChange(${item.id}, ${item.qty - 1})">-</button>
                                    <input type="number" class="detail-qty-input" value="${item.qty}" readonly>
                                    <button class="detail-qty-btn" onclick="handleCartQtyChange(${item.id}, ${item.qty + 1})">+</button>
                                </div>
                            </div>
                            <div style="text-align: right; font-weight: 800; color: var(--orange-primary);">${formatPrice(item.price * item.qty)}</div>
                            <div style="text-align: right;">
                                <button type="button" style="color: var(--text-muted);" onclick="handleRemoveCartItem(${item.id})">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div>
                <div class="coupon-box-card">
                    <div class="coupon-box-title"><i class="fa-solid fa-ticket text-orange"></i> Apply Promotional Coupon</div>
                    ${coupon ? `
                        <div class="coupon-applied-pill">
                            <div>
                                <i class="fa-solid fa-circle-check"></i>
                                <span>${coupon.code} Applied (${coupon.type === 'freeship' ? 'Free Delivery' : '-' + formatPrice(couponDiscount)})</span>
                            </div>
                            <button type="button" onclick="handleRemoveCoupon()" style="color: #DC2626; font-weight: 800;"><i class="fa-solid fa-xmark"></i> Remove</button>
                        </div>
                    ` : `
                        <div class="coupon-input-group">
                            <input type="text" id="fullCartCouponInput" class="coupon-input" placeholder="COUPON CODE">
                            <button type="button" class="btn-classic-orange" onclick="handleApplyCoupon('fullCartCouponInput')">Apply</button>
                        </div>
                        <div class="available-coupons-title">Available Offers (Click to apply)</div>
                        <div class="coupon-pills-list">
                            ${availableCoupons.map(c => `
                                <button type="button" class="coupon-tag-btn" onclick="handleSelectCouponPill('${c.code}', 'fullCartCouponInput')">
                                    <i class="fa-solid fa-tag"></i> ${c.code}
                                </button>
                            `).join('')}
                        </div>
                    `}
                </div>

                <div class="summary-card-box">
                    <div class="summary-title">Order Summary</div>
                    <div class="summary-row">
                        <span>Items Subtotal</span>
                        <span>${formatPrice(subtotal)}</span>
                    </div>
                    ${(couponDiscount > 0 || (coupon && coupon.type === 'freeship')) ? `
                        <div class="summary-row" style="color: var(--green-primary); font-weight: 700;">
                            <span>Coupon Discount (${coupon.code})</span>
                            <span>${coupon && coupon.type === 'freeship' ? 'Free Shipping' : '-' + formatPrice(couponDiscount)}</span>
                        </div>
                    ` : ''}
                    <div class="summary-row">
                        <span>GST (18%)</span>
                        <span>${formatPrice(gst)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Delivery Fee</span>
                        <span>${deliveryFee === 0 ? '<span style="color: var(--green-primary); font-weight: 800;">FREE</span>' : formatPrice(deliveryFee)}</span>
                    </div>
                    <div class="summary-row total-grand">
                        <span>Total Payable</span>
                        <span style="color: var(--orange-primary);">${formatPrice(total)}</span>
                    </div>

                    <button class="btn-classic-orange full-width" style="height: 50px; font-size: 1.05rem; margin-top: 20px;" onclick="switchPage('checkout')">
                        <span>Proceed to Checkout</span> <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

window.handleClearCartAll = async function() {
    await cartService.clearCart();
    await updateCartUI();
    showToast("Cart cleared.", "orange");
};

// CHECKOUT PAGE RENDERER
async function renderCheckoutPage() {
    const container = document.getElementById('checkoutContainer');
    if (!container) return;

    if (!AuthStore.isLoggedIn()) {
        showToast("Please log in to proceed with checkout.", "orange");
        window.pendingRedirectPage = 'checkout';
        switchPage('login');
        return;
    }

    const summary = await cartService.getCartSummary();
    const { items, subtotal, coupon, couponDiscount, gst, deliveryFee, total } = summary;

    if (items.length === 0) {
        showToast("Your cart is empty.", "orange");
        switchPage('cart');
        return;
    }

    const user = AuthStore.user || {};
    const savedAddresses = JSON.parse(localStorage.getItem('shopsphere_addresses') || '[]');

    let addressesHTML = '';
    if (savedAddresses.length > 0) {
        addressesHTML = `
            <div style="margin-bottom: 20px;">
                <label style="font-weight: 700; margin-bottom: 10px; display: block;">Select a Saved Address</label>
                <div style="display: grid; gap: 12px;">
                    ${savedAddresses.map((a, idx) => `
                        <label class="payment-card-option ${a.isDefault ? 'active' : ''}" style="cursor: pointer; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; display: flex; align-items: flex-start; gap: 12px;">
                            <input type="radio" name="checkoutSelectedAddress" value="${idx}" ${a.isDefault ? 'checked' : ''} style="margin-top: 4px; accent-color: var(--orange-primary);" onchange="handleCheckoutAddressSelect(this)">
                            <div>
                                <div style="font-weight: 700;">${a.fullName} ${a.isDefault ? '<span class="badge-status success" style="font-size:0.7rem; padding: 2px 6px; margin-left: 6px;">Default</span>' : ''}</div>
                                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">${a.line1}, ${a.city}, ${a.state} - ${a.pincode}</div>
                                <div style="font-size: 0.85rem; color: var(--text-muted);">Phone: ${a.phone}</div>
                            </div>
                        </label>
                    `).join('')}
                    <label class="payment-card-option" style="cursor: pointer; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; display: flex; align-items: center; gap: 12px;">
                        <input type="radio" name="checkoutSelectedAddress" value="new" ${savedAddresses.length === 0 ? 'checked' : ''} style="accent-color: var(--orange-primary);" onchange="handleCheckoutAddressSelect(this)">
                        <div style="font-weight: 700;">+ Use a New Address</div>
                    </label>
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="checkout-layout-grid">
            <div>
                <div class="checkout-step-card">
                    <div class="step-card-header">
                        <div class="step-num-badge">1</div>
                        <div class="step-card-title">Delivery Address</div>
                    </div>

                    ${addressesHTML}

                    <form id="checkoutAddressForm" style="${savedAddresses.length > 0 ? 'display: none;' : ''}">
                        <div style="margin-bottom: 16px; font-weight: 700; color: var(--orange-primary); font-size: 0.95rem;">Enter New Address Details</div>
                        <div class="form-row-2">
                            <div class="form-group">
                                <label>Full Name *</label>
                                <input type="text" id="checkoutName" required value="${user.name || ''}" placeholder="John Doe">
                            </div>
                            <div class="form-group">
                                <label>Phone Number * (10 Digits)</label>
                                <input type="tel" id="checkoutPhone" required value="${user.phone || ''}" placeholder="9876543210" maxlength="10">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Street Address / House No. *</label>
                            <input type="text" id="checkoutAddress" required placeholder="Flat / House No., Street, Area">
                        </div>

                        <div class="form-row-2">
                            <div class="form-group">
                                <label>City *</label>
                                <input type="text" id="checkoutCity" required placeholder="e.g. Mumbai, New Delhi">
                            </div>
                            <div class="form-group">
                                <label>State *</label>
                                <input type="text" id="checkoutState" required placeholder="e.g. Maharashtra, Delhi">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Pincode * (6 Digits)</label>
                            <input type="text" id="checkoutPincode" required placeholder="110001" maxlength="6">
                        </div>
                    </form>
                </div>

                <div class="checkout-step-card">
                    <div class="step-card-header">
                        <div class="step-num-badge">2</div>
                        <div class="step-card-title">Payment Method</div>
                    </div>

                    <div class="payment-methods-group">
                        <label class="payment-card-option active" id="payOptCOD">
                            <input type="radio" name="paymentMethod" value="Cash on Delivery" checked style="accent-color: var(--orange-primary);">
                            <i class="fa-solid fa-money-bill-wave text-green" style="font-size: 1.4rem;"></i>
                            <div>
                                <div style="font-weight: 700;">Cash on Delivery (COD)</div>
                                <div style="font-size: 0.82rem; color: var(--text-muted);">Pay with cash upon package arrival at your doorstep.</div>
                            </div>
                        </label>

                        <label class="payment-card-option" id="payOptUPI">
                            <input type="radio" name="paymentMethod" value="UPI Payment" style="accent-color: var(--orange-primary);">
                            <i class="fa-solid fa-mobile-screen-button text-orange" style="font-size: 1.4rem;"></i>
                            <div>
                                <div style="font-weight: 700;">UPI (Google Pay, PhonePe, Paytm, BHIM)</div>
                                <div style="font-size: 0.82rem; color: var(--text-muted);">Instant zero-fee payment via any UPI app.</div>
                            </div>
                        </label>
                        <div id="upiFieldsBox" class="payment-details-box" style="display: none;">
                            <label style="font-weight: 700; font-size: 0.88rem;">Enter your Virtual Payment Address (UPI ID)</label>
                            <input type="text" id="checkoutUpiId" placeholder="username@okaxis" style="width: 100%; padding: 8px 12px; margin-top: 6px; border: 1px solid var(--border-color); border-radius: 8px;">
                        </div>

                        <label class="payment-card-option" id="payOptCard">
                            <input type="radio" name="paymentMethod" value="Credit / Debit Card" style="accent-color: var(--orange-primary);">
                            <i class="fa-solid fa-credit-card text-yellow" style="font-size: 1.4rem;"></i>
                            <div>
                                <div style="font-weight: 700;">Credit or Debit Card</div>
                                <div style="font-size: 0.82rem; color: var(--text-muted);">Visa, MasterCard, RuPay, Maestro.</div>
                            </div>
                        </label>
                        <div id="cardFieldsBox" class="payment-details-box" style="display: none;">
                            <div class="form-group" style="margin-bottom: 10px;">
                                <label style="font-size: 0.82rem;">Card Number</label>
                                <input type="text" id="checkoutCardNum" placeholder="4111 2222 3333 4444" maxlength="19" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px;">
                            </div>
                            <div class="form-row-2">
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label style="font-size: 0.82rem;">Expiry Date</label>
                                    <input type="text" id="checkoutCardExp" placeholder="MM/YY" maxlength="5" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px;">
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label style="font-size: 0.82rem;">CVV</label>
                                    <input type="password" id="checkoutCardCvv" placeholder="123" maxlength="3" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px;">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div class="summary-card-box">
                    <div class="summary-title">Order Items (${items.reduce((acc, i) => acc + i.qty, 0)})</div>

                    <div style="max-height: 220px; overflow-y: auto; margin-bottom: 16px; padding-right: 4px;">
                        ${items.map(item => `
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; font-size: 0.88rem;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <img src="${item.image}" alt="${item.title}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;" onerror="handleImgError(this)">
                                    <div>
                                        <div style="font-weight: 700;">${item.title.slice(0, 22)}...</div>
                                        <div style="color: var(--text-muted);">Qty: ${item.qty}</div>
                                    </div>
                                </div>
                                <span style="font-weight: 800;">${formatPrice(item.price * item.qty)}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="summary-row">
                        <span>Subtotal</span>
                        <span>${formatPrice(subtotal)}</span>
                    </div>
                    ${(couponDiscount > 0 || (coupon && coupon.type === 'freeship')) ? `
                        <div class="summary-row" style="color: var(--green-primary); font-weight: 700;">
                            <span>Discount (${coupon.code})</span>
                            <span>${coupon && coupon.type === 'freeship' ? 'Free Shipping' : '-' + formatPrice(couponDiscount)}</span>
                        </div>
                    ` : ''}
                    <div class="summary-row">
                        <span>GST (18%)</span>
                        <span>${formatPrice(gst)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Delivery Fee</span>
                        <span>${deliveryFee === 0 ? '<span style="color: var(--green-primary); font-weight: 800;">FREE</span>' : formatPrice(deliveryFee)}</span>
                    </div>
                    <div class="summary-row total-grand">
                        <span>Grand Total</span>
                        <span style="color: var(--orange-primary);">${formatPrice(total)}</span>
                    </div>

                    <button class="btn-classic-orange full-width" id="btnPlaceOrder" style="height: 52px; font-size: 1.1rem; margin-top: 24px;" onclick="handlePlaceOrderSubmit()">
                        <i class="fa-solid fa-lock"></i> Place Order Now
                    </button>
                </div>
            </div>
        </div>
    `;

    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.querySelectorAll('.payment-card-option').forEach(opt => opt.classList.remove('active'));
            e.target.closest('.payment-card-option').classList.add('active');

            const upiBox = document.getElementById('upiFieldsBox');
            const cardBox = document.getElementById('cardFieldsBox');
            if (upiBox) upiBox.style.display = e.target.value === 'UPI Payment' ? 'block' : 'none';
            if (cardBox) cardBox.style.display = e.target.value === 'Credit / Debit Card' ? 'block' : 'none';
        });
    });
}

window.handleCheckoutAddressSelect = function(radio) {
    document.querySelectorAll('input[name="checkoutSelectedAddress"]').forEach(r => {
        r.closest('label').classList.remove('active');
    });
    radio.closest('label').classList.add('active');

    const form = document.getElementById('checkoutAddressForm');
    if (radio.value === 'new') {
        form.style.display = 'block';
    } else {
        form.style.display = 'none';
    }
};

window.handlePlaceOrderSubmit = async function() {
    const btn = document.getElementById('btnPlaceOrder');
    const selectedRadio = document.querySelector('input[name="checkoutSelectedAddress"]:checked');
    let shippingAddress = null;

    if (selectedRadio && selectedRadio.value !== 'new') {
        const savedAddresses = JSON.parse(localStorage.getItem('shopsphere_addresses') || '[]');
        shippingAddress = savedAddresses[parseInt(selectedRadio.value)];
    } else {
        const name = document.getElementById('checkoutName')?.value.trim();
        const phone = document.getElementById('checkoutPhone')?.value.trim();
        const address = document.getElementById('checkoutAddress')?.value.trim();
        const city = document.getElementById('checkoutCity')?.value.trim();
        const state = document.getElementById('checkoutState')?.value.trim();
        const pincode = document.getElementById('checkoutPincode')?.value.trim();

        if (!name || !phone || !address || !city || !state || !pincode) {
            showToast("Please fill in all required delivery address fields.", "orange");
            return;
        }

        if (!/^\d{10}$/.test(phone)) {
            showToast("Please enter a valid 10-digit phone number.", "orange");
            return;
        }

        if (!/^\d{6}$/.test(pincode)) {
            showToast("Please enter a valid 6-digit Indian Pincode.", "orange");
            return;
        }

        shippingAddress = {
            fullName: name,
            phone,
            line1: address,
            city,
            state,
            pincode,
            email: AuthStore.user ? AuthStore.user.email : 'customer@shopsphere.com'
        };

        // Automatically save new address if none exist
        const savedAddresses = JSON.parse(localStorage.getItem('shopsphere_addresses') || '[]');
        if (savedAddresses.length === 0) {
            savedAddresses.push({ ...shippingAddress, isDefault: true });
            localStorage.setItem('shopsphere_addresses', JSON.stringify(savedAddresses));
        }
    }

    const payMethodRadio = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = payMethodRadio ? payMethodRadio.value : 'Cash on Delivery';

    try {
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing Order...`;
        }



        const result = await orderService.createOrder({
            shippingAddress,
            paymentMethod,
            user: AuthStore.user
        });

        if (result.success) {
            await updateCartUI();
            switchPage('order-success', result.order.id);
            showToast(`🎉 ${result.message}`, "success");
        }
    } catch (err) {
        showToast(err.message || "Failed to place order", "orange");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-lock"></i> Place Order Now`;
        }
    }
};

// ORDER SUCCESS RENDERER
async function renderOrderSuccessPage(orderId) {
    const container = document.getElementById('orderSuccessContainer');
    if (!container) return;

    let order = await orderService.getOrderById(orderId);
    if (!order) {
        const userOrders = await orderService.getUserOrders(AuthStore.user ? AuthStore.user.email : null);
        order = userOrders[0] || null;
    }

    if (!order) {
        container.innerHTML = `
            <div class="order-success-card">
                <h2>Order Information Not Found</h2>
                <p style="color: var(--text-muted); margin: 12px 0 20px;">We could not locate details for this order.</p>
                <button class="btn-classic-orange" onclick="switchPage('products')">Continue Shopping</button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="order-success-card">
            <div class="success-icon-animation">
                <i class="fa-solid fa-check"></i>
            </div>

            <span class="section-subtitle-tag green">ORDER CONFIRMED</span>
            <h1 style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; margin: 10px 0 6px;">Your Order Has Been Placed Successfully!</h1>
            <p style="color: var(--text-muted); font-size: 1rem;">Thank you for shopping with ShopSphere Classic. Order details have been saved to your account.</p>

            <div class="success-details-box">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700;">ORDER NUMBER</div>
                        <div style="font-weight: 800; font-size: 1.1rem; color: var(--orange-primary);">${order.id}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700;">DATE</div>
                        <div style="font-weight: 700;">${order.formattedDate}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700;">PAYMENT METHOD</div>
                        <div style="font-weight: 700;">${order.paymentMethod}</div>
                    </div>
                </div>

                <div style="background: var(--green-light); border: 1px solid var(--green-primary); border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; color: var(--green-hover); font-weight: 700;">
                    <i class="fa-solid fa-truck-fast" style="font-size: 1.2rem;"></i>
                    <span>Expected Delivery: <strong>${order.estimatedDelivery}</strong></span>
                </div>

                <div style="margin-bottom: 16px;">
                    <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 700; margin-bottom: 6px;">DELIVERY ADDRESS</div>
                    <div style="font-weight: 600;">${order.shippingAddress.fullName}, ${order.shippingAddress.line1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode} (Ph: ${order.shippingAddress.phone})</div>
                </div>

                <div>
                    <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 700; margin-bottom: 10px;">ORDERED ITEMS</div>
                    ${order.items.map(item => `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed var(--border-color);">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <img src="${item.image}" alt="${item.title}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;" onerror="handleImgError(this)">
                                <div>
                                    <span style="font-weight: 700;">${item.title}</span>
                                    <span style="color: var(--text-muted); font-size: 0.85rem;"> × ${item.qty}</span>
                                </div>
                            </div>
                            <span style="font-weight: 700;">${formatPrice(item.price * item.qty)}</span>
                        </div>
                    `).join('')}
                </div>

                <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1.15rem; margin-top: 14px; padding-top: 10px; border-top: 2px solid var(--border-color);">
                    <span>Total Amount Paid</span>
                    <span style="color: var(--orange-primary);">${formatPrice(order.summary.total)}</span>
                </div>
            </div>

            <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
                <button class="btn-classic-orange" onclick="switchPage('order-detail', '${order.id}')">
                    <i class="fa-solid fa-location-crosshairs"></i> Track Order Status
                </button>
                <button class="btn-outline-classic" onclick="switchPage('products')">
                    <i class="fa-solid fa-bag-shopping"></i> Continue Shopping
                </button>
            </div>
        </div>
    `;
}

// MY ORDERS LIST & ORDER DETAIL RENDERERS
async function renderOrdersListPage() {
    const container = document.getElementById('ordersListContainer');
    if (!container) return;

    if (!AuthStore.isLoggedIn()) {
        showToast("Please log in to view your order history.", "orange");
        window.pendingRedirectPage = 'orders';
        const modal = document.getElementById('loginModal');
        const backdrop = document.getElementById('loginBackdrop');
        if (modal) modal.classList.add('active');
        if (backdrop) backdrop.classList.add('active');
        return;
    }

    const user = AuthStore.user;
    const orders = await orderService.getUserOrders(user.email);

    if (orders.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 80px 20px; background: #FFF; border: 2px solid var(--border-color); border-radius: var(--radius-lg);">
                <i class="fa-solid fa-box-open" style="font-size: 4rem; color: var(--text-light); margin-bottom: 20px;"></i>
                <h2 style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; margin-bottom: 10px;">No Orders Placed Yet</h2>
                <p style="color: var(--text-muted); margin-bottom: 24px;">Looks like you haven't placed any orders yet. Start exploring our classic collections today!</p>
                <button class="btn-classic-orange" onclick="switchPage('products')">
                    <i class="fa-solid fa-compass"></i> Explore Products Catalogue
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="orders-list-wrapper">
            ${orders.map(order => {
                const statusClass = order.status.toLowerCase().replace(/ /g, '-');
                return `
                    <div class="order-card-item">
                        <div class="order-card-header">
                            <div>
                                <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700;">ORDER ID: </span>
                                <strong style="color: var(--orange-primary); font-size: 1.05rem;">${order.id}</strong>
                                <span style="margin: 0 8px; color: var(--text-light);">•</span>
                                <span style="font-size: 0.88rem; color: var(--text-secondary);">${order.formattedDate}</span>
                            </div>
                            <div class="order-status-badge ${statusClass}">
                                <i class="fa-solid fa-circle-dot"></i> ${order.status}
                            </div>
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                                ${order.items.slice(0, 4).map(item => `
                                    <img src="${item.image}" alt="${item.title}" style="width: 54px; height: 54px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-color);" onerror="handleImgError(this)" title="${item.title}">
                                `).join('')}
                                ${order.items.length > 4 ? `
                                    <span style="background: var(--bg-secondary); padding: 8px 12px; border-radius: 8px; font-weight: 700; font-size: 0.85rem; color: var(--text-muted);">
                                        +${order.items.length - 4} more
                                    </span>
                                ` : ''}
                            </div>

                            <div style="text-align: right;">
                                <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700;">TOTAL AMOUNT</div>
                                <div style="font-weight: 900; font-size: 1.2rem; color: var(--text-primary);">${formatPrice(order.summary.total)}</div>
                                <button class="btn-classic-orange" style="padding: 8px 18px; font-size: 0.85rem; margin-top: 8px;" onclick="switchPage('order-detail', '${order.id}')">
                                    View Details <i class="fa-solid fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

async function renderOrderDetailPage(orderId) {
    const container = document.getElementById('orderDetailContainer');
    if (!container) return;

    const order = await orderService.getOrderById(orderId);
    if (!order) {
        container.innerHTML = `
            <div style="text-align: center; padding: 80px 20px;">
                <h2 style="font-family: var(--font-heading); font-size: 2rem;">Order Not Found</h2>
                <p style="color: var(--text-muted); margin: 12px 0 20px;">Could not find details for Order ID "${orderId}".</p>
                <button class="btn-classic-orange" onclick="switchPage('orders')">Back to My Orders</button>
            </div>
        `;
        return;
    }

    const isCancelled = order.status === "Cancelled";
    const canCancel = order.status === "Placed" || order.status === "Confirmed";

    const steps = [
        { key: "Placed", label: "Order Placed", icon: "fa-receipt" },
        { key: "Confirmed", label: "Confirmed", icon: "fa-check-double" },
        { key: "Shipped", label: "Shipped", icon: "fa-box" },
        { key: "Out for Delivery", label: "Out for Delivery", icon: "fa-truck-ramp-box" },
        { key: "Delivered", label: "Delivered", icon: "fa-house-circle-check" }
    ];

    let currentStepIdx = steps.findIndex(s => s.key === order.status);
    if (currentStepIdx === -1) currentStepIdx = 0;

    container.innerHTML = `
        <div class="detail-breadcrumb">
            <a href="#home-page" onclick="switchPage('home')">Home</a>
            <i class="fa-solid fa-chevron-right"></i>
            <a href="#orders-page" onclick="switchPage('orders')">My Orders</a>
            <i class="fa-solid fa-chevron-right"></i>
            <span>Order #${order.id}</span>
        </div>

        <div style="background: #FFF; border: 2px solid var(--border-color); border-radius: var(--radius-lg); padding: 32px; box-shadow: var(--shadow-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; padding-bottom: 20px; border-bottom: 2px solid var(--border-color);">
                <div>
                    <h1 style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 800;">Order Details</h1>
                    <div style="color: var(--text-muted); font-size: 0.9rem;">Placed on ${order.formattedDate} • ID: <strong class="text-orange">${order.id}</strong></div>
                </div>

                <div style="display: flex; align-items: center; gap: 14px;">
                    <div class="order-status-badge ${order.status.toLowerCase().replace(/ /g, '-')}">
                        <i class="fa-solid fa-circle-dot"></i> ${order.status}
                    </div>
                    ${canCancel ? `
                        <button class="btn-outline-classic" style="color: #DC2626; border-color: #FCA5A5;" onclick="handleCancelOrder('${order.id}')">
                            <i class="fa-solid fa-ban"></i> Cancel Order
                        </button>
                    ` : ''}
                </div>
            </div>

            ${!isCancelled ? `
                <div class="status-stepper-wrapper">
                    <div class="stepper-progress-line" style="width: ${(currentStepIdx / (steps.length - 1)) * 100}%;"></div>
                    ${steps.map((step, idx) => {
                        const isDone = idx <= currentStepIdx;
                        const isActive = idx === currentStepIdx;
                        return `
                            <div class="step-node ${isDone ? 'completed' : ''} ${isActive ? 'active' : ''}">
                                <div class="step-circle">
                                    <i class="fa-solid ${isDone ? 'fa-check' : step.icon}"></i>
                                </div>
                                <div class="step-label">${step.label}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : `
                <div style="background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 12px; padding: 16px; margin: 24px 0; color: #991B1B; font-weight: 700; display: flex; align-items: center; gap: 12px;">
                    <i class="fa-solid fa-circle-xmark" style="font-size: 1.5rem;"></i>
                    <div>
                        <div>This order was cancelled.</div>
                        <div style="font-weight: 400; font-size: 0.88rem;">Item inventory stock has been restored to catalogue.</div>
                    </div>
                </div>
            `}

            <div style="display: grid; grid-template-columns: 1fr 340px; gap: 32px; margin-top: 28px;">
                <div>
                    <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800; margin-bottom: 14px;">Purchased Items (${order.items.length})</h3>
                    <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden;">
                        ${order.items.map(item => `
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid var(--border-color);">
                                <div style="display: flex; align-items: center; gap: 14px;">
                                    <img src="${item.image}" alt="${item.title}" style="width: 56px; height: 56px; border-radius: 8px; object-fit: cover;" onerror="handleImgError(this)">
                                    <div>
                                        <div style="font-weight: 700; cursor: pointer;" onclick="navigateToProductDetail(${item.id})">${item.title}</div>
                                        <div style="color: var(--text-muted); font-size: 0.85rem;">Price: ${formatPrice(item.price)} × ${item.qty}</div>
                                    </div>
                                </div>
                                <div style="font-weight: 800; color: var(--text-primary);">${formatPrice(item.price * item.qty)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div>
                    <div class="summary-card-box" style="margin-bottom: 20px;">
                        <div class="summary-title" style="font-size: 1.1rem; margin-bottom: 12px;">Payment Summary</div>
                        <div class="summary-row"><span>Items Subtotal</span><span>${formatPrice(order.summary.subtotal)}</span></div>
                        ${order.summary.couponDiscount > 0 ? `<div class="summary-row" style="color: var(--green-primary); font-weight:700;"><span>Coupon Discount</span><span>-${formatPrice(order.summary.couponDiscount)}</span></div>` : ''}
                        <div class="summary-row"><span>GST (18%)</span><span>${formatPrice(order.summary.gst)}</span></div>
                        <div class="summary-row"><span>Delivery Fee</span><span>${order.summary.deliveryFee === 0 ? 'FREE' : formatPrice(order.summary.deliveryFee)}</span></div>
                        <div class="summary-row total-grand" style="font-size: 1.15rem;">
                            <span>Total Paid</span>
                            <span style="color: var(--orange-primary);">${formatPrice(order.summary.total)}</span>
                        </div>
                    </div>

                    <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px;">
                        <div style="font-weight: 800; font-size: 0.95rem; margin-bottom: 8px;"><i class="fa-solid fa-location-dot text-orange"></i> Shipping Address</div>
                        <div style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">
                            <strong>${order.shippingAddress.fullName}</strong><br>
                            ${order.shippingAddress.line1}<br>
                            ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
                            Phone: ${order.shippingAddress.phone}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

window.handleCancelOrder = async function(orderId) {
    if (!confirm(`Are you sure you want to cancel Order #${orderId}?`)) return;

    try {
        const res = await orderService.cancelOrder(orderId);
        showToast(res.message, "success");
        await renderOrderDetailPage(orderId);
        renderCatalogProducts();
    } catch (e) {
        showToast(e.message || "Failed to cancel order.", "orange");
    }
};

// 11. WISHLIST MANAGEMENT
async function toggleWishlist(productId, btnEl) {
    const index = wishlistItems.findIndex(w => w.id === productId);
    let product = wishlistItems.find(w => w.id === productId);
    
    if (!product) {
        product = await productService.getProductById(productId);
    }
    
    if (!product) return;

    if (index > -1) {
        wishlistItems.splice(index, 1);
        if (btnEl) btnEl.classList.remove('active');
        showToast(`Removed from Wishlist`, 'orange');
    } else {
        wishlistItems.push(product);
        if (btnEl) btnEl.classList.add('active');
        showToast(`Saved to Wishlist!`, 'success');
    }

    const countEl = document.getElementById('wishlistCount');
    if (countEl) countEl.textContent = wishlistItems.length;
    localStorage.setItem('shopsphere_wishlist', JSON.stringify(wishlistItems));
}

function renderWishlistPage() {
    const container = document.getElementById('wishlistPageContainer');
    if (!container) return;

    if (wishlistItems.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #FFF; border: 2px solid var(--border-color); border-radius: var(--radius-lg);">
                <i class="fa-solid fa-heart" style="font-size: 4rem; color: var(--text-light); margin-bottom: 20px;"></i>
                <h2 style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; margin-bottom: 12px;">Your Wishlist is Empty</h2>
                <p style="color: var(--text-muted); margin-bottom: 24px;">Browse our catalog and save your favorite items here.</p>
                <button class="btn-classic-orange" onclick="switchPage('products')">
                    <i class="fa-solid fa-compass"></i> Explore Products
                </button>
            </div>
        `;
    } else {
        container.innerHTML = `
        <div class="full-cart-grid" style="grid-template-columns: 1fr; margin: 0 auto; max-width: 1000px;">
            <div class="cart-items-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 2px solid var(--border-color);">
                    <h3 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800;">
                        Saved Items (${wishlistItems.length})
                    </h3>
                </div>
                <div class="cart-table-header">
                    <span>Product Details</span>
                    <span>Price</span>
                    <span style="text-align: center;">Action</span>
                    <span></span>
                    <span></span>
                </div>
                <div class="cart-table-body">
                    ${wishlistItems.map(item => {
                        const oldPrice = item.oldPrice || Math.round(item.price * 1.25);
                        return `
                        <div class="cart-table-row">
                            <div class="cart-product-info">
                                <img src="${item.image}" alt="${item.title || item.name}" class="cart-product-img" onerror="handleImgError(this)">
                                <div>
                                    <div class="cart-product-title" onclick="navigateToProductDetail(${item.id})">${item.title || item.name}</div>
                                    <div class="cart-product-cat">${item.categoryName || 'General'}</div>
                                    <span style="font-size: 0.8rem; color: var(--green-primary); font-weight: 700;">In Stock</span>
                                </div>
                            </div>
                            <div style="font-weight: 700;">
                                ${formatPrice(item.price)}
                                ${oldPrice ? `<br><span style="text-decoration:line-through; font-size:0.8rem; color:var(--text-muted);">${formatPrice(oldPrice)}</span>` : ''}
                            </div>
                            <div style="display: flex; justify-content: center;">
                                <button class="btn-classic-orange btn-sm" onclick="cartService.addToCart(${item.id}); showToast('Added to cart!', 'success');">
                                    <i class="fa-solid fa-cart-plus"></i> Move to Cart
                                </button>
                            </div>
                            <div></div>
                            <div style="text-align: right;">
                                <button type="button" style="color: var(--text-muted);" onclick="toggleWishlist(${item.id}).then(() => renderWishlistPage())">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        </div>
                    `}).join('')}
                </div>
            </div>
        </div>`;
    }
}

// 12. CONTACT FORM BACKEND INTEGRATION
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('contactName')?.value.trim();
            const email = document.getElementById('contactEmail')?.value.trim();
            const subject = document.getElementById('contactSubject')?.value.trim();
            const message = document.getElementById('contactMessage')?.value.trim();
            const submitBtn = form.querySelector('button[type="submit"]');

            if (!name || !email || !message) {
                showToast("Please fill in all required fields (Name, Email, Message).", "orange");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showToast("Please enter a valid email address.", "orange");
                return;
            }

            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sending Message...`;
                }

                await apiFetch('/contact', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, subject, message })
                });

                showToast("Thank you! Your message has been sent successfully to ShopSphere support.", "success");
                form.reset();
            } catch (err) {
                showToast(err.message || "Failed to send message", "orange");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Send Message`;
                }
            }
        });
    }
}

// 13. NEWSLETTER FORM
function initNewsletterForm() {
    const form = document.getElementById('newsletterForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            const email = emailInput ? emailInput.value.trim() : '';

            if (!email) {
                showToast("Please enter your email address.", "orange");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showToast("Please enter a valid email address.", "orange");
                return;
            }

            showToast("Subscribed! Check your inbox for your 20% discount coupon.", "success");
            form.reset();
        });
    }
}

// 14. TOAST NOTIFICATION ENGINE
function showToast(message, type = "success") {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="${type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-bell'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

/* ==========================================================================
   27. ADMIN DASHBOARD ENGINE (ALL 7 MODULES IMPLEMENTATION)
   ========================================================================== */

let currentProductPhotos = [];

function renderProductPhotoSlots() {
    const grid = document.getElementById('adminProdPhotosGrid');
    const countBadge = document.getElementById('prodPhotoCountBadge');
    const hiddenImageInput = document.getElementById('adminProdImage');
    if (!grid) return;

    if (countBadge) {
        countBadge.textContent = `${currentProductPhotos.length} / 7 Added`;
        countBadge.style.color = currentProductPhotos.length > 0 ? 'var(--green-primary)' : 'var(--orange-primary)';
    }

    if (hiddenImageInput) {
        hiddenImageInput.value = currentProductPhotos.length > 0 ? currentProductPhotos[0] : '';
    }

    let slotsHtml = '';
    for (let i = 0; i < 7; i++) {
        const isCover = (i === 0);
        const hasPhoto = i < currentProductPhotos.length;
        const photoUrl = hasPhoto ? currentProductPhotos[i] : null;

        if (hasPhoto) {
            slotsHtml += `
                <div class="product-photo-slot has-image ${isCover ? 'slot-cover' : ''}" data-slot-index="${i}">
                    <span class="slot-badge">${isCover ? '★ Cover *' : `Photo ${i + 1}`}</span>
                    <img src="${photoUrl}" alt="Product Photo ${i + 1}">
                    <button type="button" class="slot-delete-btn" onclick="removeProductPhotoSlot(${i})" title="Remove photo">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            `;
        } else {
            slotsHtml += `
                <div class="product-photo-slot empty-slot ${isCover ? 'slot-cover' : ''}" data-slot-index="${i}" onclick="triggerProductPhotoUpload(${i})" title="${isCover ? 'Click to add Cover Photo (Compulsory)' : 'Click to add photo'}">
                    <span class="slot-badge">${isCover ? '★ Cover *' : `Slot ${i + 1}`}</span>
                    <div class="slot-empty-label">
                        <i class="fa-solid ${isCover ? 'fa-star' : 'fa-plus'}" style="font-size: 1.1rem; color: ${isCover ? 'var(--orange-primary)' : 'var(--text-muted)'};"></i>
                        <span>${isCover ? 'Cover *' : `Add ${i + 1}`}</span>
                    </div>
                </div>
            `;
        }
    }
    grid.innerHTML = slotsHtml;
}

window.removeProductPhotoSlot = function(index) {
    if (index >= 0 && index < currentProductPhotos.length) {
        currentProductPhotos.splice(index, 1);
        renderProductPhotoSlots();
    }
};

window.triggerProductPhotoUpload = function(slotIndex) {
    const fileInput = document.getElementById('adminProdPhotoFileInput');
    if (fileInput) fileInput.click();
};

function handleProductPhotoFiles(filesList) {
    const files = Array.from(filesList);
    if (!files || files.length === 0) return;

    const availableSlots = 7 - currentProductPhotos.length;
    if (availableSlots <= 0) {
        showToast("Maximum 7 photos allowed. Please remove a photo first.", "orange");
        return;
    }

    const filesToRead = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
        showToast(`Only ${availableSlots} more photo(s) added (limit: 7).`, "orange");
    }

    let processed = 0;
    filesToRead.forEach(file => {
        if (!file.type.startsWith('image/')) {
            showToast(`"${file.name}" is not an image.`, "orange");
            processed++;
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (currentProductPhotos.length < 7) {
                currentProductPhotos.push(e.target.result);
            }
            processed++;
            if (processed === filesToRead.length) {
                renderProductPhotoSlots();
                const fileInput = document.getElementById('adminProdPhotoFileInput');
                if (fileInput) fileInput.value = '';
                showToast(`${filesToRead.length} photo(s) uploaded successfully!`, "success");
            }
        };
        reader.readAsDataURL(file);
    });
}

function initProductPhotoUploader() {
    const dropzone = document.getElementById('prodPhotoDropzone');
    const fileInput = document.getElementById('adminProdPhotoFileInput');
    const btnToggleUrl = document.getElementById('btnToggleImageUrl');
    const urlBox = document.getElementById('imageUrlBox');
    const btnAddUrl = document.getElementById('btnAddImageUrlBtn');
    const urlInput = document.getElementById('adminProdUrlInput');

    if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            handleProductPhotoFiles(e.target.files);
        });

        // Drag & drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.style.background = '#ffe8dc';
            dropzone.style.borderColor = 'var(--orange-primary)';
        });
        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropzone.style.background = 'var(--bg-warm-cream)';
            dropzone.style.borderColor = 'var(--orange-primary)';
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.style.background = 'var(--bg-warm-cream)';
            dropzone.style.borderColor = 'var(--orange-primary)';
            if (e.dataTransfer && e.dataTransfer.files) {
                handleProductPhotoFiles(e.dataTransfer.files);
            }
        });
    }

    if (btnToggleUrl && urlBox) {
        btnToggleUrl.addEventListener('click', () => {
            urlBox.style.display = (urlBox.style.display === 'none' || urlBox.style.display === '') ? 'block' : 'none';
        });
    }

    if (btnAddUrl && urlInput) {
        btnAddUrl.addEventListener('click', () => {
            const url = urlInput.value.trim();
            if (!url) {
                showToast("Please enter an image URL.", "orange");
                return;
            }
            if (currentProductPhotos.length >= 7) {
                showToast("Maximum 7 photos allowed.", "orange");
                return;
            }
            currentProductPhotos.push(url);
            renderProductPhotoSlots();
            urlInput.value = '';
            showToast("Photo URL added successfully!", "success");
        });
    }

    renderProductPhotoSlots();
}

function initAdminEngine() {
    initProductPhotoUploader();

    // Admin Tab Navigation Switcher
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetContent = document.getElementById(`adminTab${capitalize(targetTab)}`);
            if (targetContent) targetContent.classList.add('active');

            renderAdminPanel();
        });
    });

    // View All Orders button in Overview
    const viewOrdersBtn = document.getElementById('btnViewAllOrdersTab');
    if (viewOrdersBtn) {
        viewOrdersBtn.addEventListener('click', () => {
            const ordersTab = document.querySelector('.admin-tab-btn[data-tab="orders"]');
            if (ordersTab) ordersTab.click();
        });
    }

    // Filters and Search Events
    const userSearch = document.getElementById('adminUserSearchInput');
    const userFilter = document.getElementById('adminUserRoleFilter');
    if (userSearch) userSearch.addEventListener('input', debounce(renderAdminUsers, 300));
    if (userFilter) userFilter.addEventListener('change', renderAdminUsers);

    const sellerSearch = document.getElementById('adminSellerSearchInput');
    const sellerFilter = document.getElementById('adminSellerStatusFilter');
    if (sellerSearch) sellerSearch.addEventListener('input', debounce(renderAdminSellers, 300));
    if (sellerFilter) sellerFilter.addEventListener('change', renderAdminSellers);

    const prodSearch = document.getElementById('adminProductSearchInput');
    const prodFilter = document.getElementById('adminProductCategoryFilter');
    if (prodSearch) prodSearch.addEventListener('input', debounce(renderAdminProducts, 300));
    if (prodFilter) prodFilter.addEventListener('change', renderAdminProducts);

    const orderSearch = document.getElementById('adminOrderSearchInput');
    const orderFilter = document.getElementById('adminOrderStatusFilter');
    if (orderSearch) orderSearch.addEventListener('input', debounce(renderAdminOrders, 300));
    if (orderFilter) orderFilter.addEventListener('change', renderAdminOrders);

    const logFilter = document.getElementById('adminLogTypeFilter');
    if (logFilter) logFilter.addEventListener('change', renderAdminActivityLogs);

    // Modal Trigger Buttons
    const btnHeaderAddUser = document.getElementById('btnAdminHeaderAddUser');
    const btnOpenAddUser = document.getElementById('btnOpenAddUserModal');
    if (btnHeaderAddUser) btnHeaderAddUser.addEventListener('click', () => openAdminUserModal());
    if (btnOpenAddUser) btnOpenAddUser.addEventListener('click', () => openAdminUserModal());

    const btnHeaderAddProd = document.getElementById('btnAdminHeaderAddProduct');
    const btnOpenAddProd = document.getElementById('btnOpenAddProductModal');
    if (btnHeaderAddProd) btnHeaderAddProd.addEventListener('click', () => openAdminProductModal());
    if (btnOpenAddProd) btnOpenAddProd.addEventListener('click', () => openAdminProductModal());

    // Modal Close Buttons
    const closeUserModal = document.getElementById('adminUserModalClose');
    const userBackdrop = document.getElementById('adminUserBackdrop');
    if (closeUserModal) closeUserModal.addEventListener('click', closeAdminUserModal);
    if (userBackdrop) userBackdrop.addEventListener('click', closeAdminUserModal);

    const closeProdModal = document.getElementById('adminProductModalClose');
    const prodBackdrop = document.getElementById('adminProductBackdrop');
    if (closeProdModal) closeProdModal.addEventListener('click', closeAdminProductModal);
    if (prodBackdrop) prodBackdrop.addEventListener('click', closeAdminProductModal);

    // Form Submissions
    const userForm = document.getElementById('adminUserForm');
    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('adminUserId').value;
            const userData = {
                name: document.getElementById('adminUserName').value.trim(),
                email: document.getElementById('adminUserEmail').value.trim(),
                phone: document.getElementById('adminUserPhone').value.trim(),
                role: document.getElementById('adminUserRole').value,
                active: document.getElementById('adminUserActive').value === 'true'
            };

            try {
                if (id) {
                    await adminService.updateUser(id, userData);
                    showToast("User profile updated successfully!", "success");
                } else {
                    await adminService.addUser(userData);
                    showToast("New user added successfully!", "success");
                }
                closeAdminUserModal();
                renderAdminPanel();
            } catch (err) {
                showToast(err.message, "orange");
            }
        });
    }

    const prodForm = document.getElementById('adminProductForm');
    if (prodForm) {
        prodForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('adminProductId').value;

            if (!currentProductPhotos || currentProductPhotos.length === 0) {
                showToast("Please upload at least 1 product photo (Cover photo is compulsory).", "orange");
                return;
            }

            const prodData = {
                name: document.getElementById('adminProdName').value.trim(),
                category: document.getElementById('adminProdCategory').value,
                categoryName: document.getElementById('adminProdCategory').value,
                stock: parseInt(document.getElementById('adminProdStock').value) || 0,
                price: parseFloat(document.getElementById('adminProdPrice').value) || 0,
                oldPrice: parseFloat(document.getElementById('adminProdOldPrice').value) || null,
                image: currentProductPhotos[0],
                images: [...currentProductPhotos],
                description: document.getElementById('adminProdDescription').value.trim(),
                sellerId: AuthStore.user?.id || null,
                sellerName: AuthStore.user?.storeName || AuthStore.user?.name || 'Sphere Official'
            };

            try {
                if (id) {
                    await productService.updateProduct(id, prodData);
                    if (AuthStore.user?.role === 'ADMIN') await adminService.logActivity('Product Updated', `Admin updated product "${prodData.name}".`, 'product');
                    showToast("Product updated successfully!", "success");
                } else {
                    await productService.addProduct(prodData);
                    if (AuthStore.user?.role === 'ADMIN') await adminService.logActivity('Product Added', `Admin listed new product "${prodData.name}".`, 'product');
                    showToast("New product added successfully!", "success");
                }
                closeAdminProductModal();
                if (AuthStore.user?.role === 'SELLER') await renderSellerDashboard();
                else await renderAdminPanel();
            } catch (err) {
                showToast(err.message, "orange");
            }
        });
    }
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function renderAdminPanel() {
    if (typeof adminService === 'undefined') return;
    await renderAdminOverview();
    await renderAdminUsers();
    await renderAdminSellers();
    await renderAdminProducts();
    await renderAdminOrders();
    await renderAdminActivityLogs();
    await renderAdminReports();
}

// ----------------------------------------------------------------------------
// 1. OVERVIEW MODULE
// ----------------------------------------------------------------------------
async function renderAdminOverview() {
    const metrics = await adminService.getDashboardMetrics();

    const elUsers = document.getElementById('statTotalUsers');
    const elUserBreakdown = document.getElementById('statUserBreakdown');
    const elSellers = document.getElementById('statActiveSellers');
    const elProds = document.getElementById('statTotalProducts');
    const elSales = document.getElementById('statTotalSales');
    const elOrdersCount = document.getElementById('statTotalOrders');

    if (elUsers) elUsers.textContent = metrics.totalUsers;
    if (elUserBreakdown) elUserBreakdown.textContent = `${metrics.buyersCount} Buyers, ${metrics.sellersCount} Sellers`;
    if (elSellers) elSellers.textContent = metrics.sellersCount;
    if (elProds) elProds.textContent = metrics.totalProducts;
    if (elSales) elSales.textContent = formatPrice(metrics.totalSales);
    if (elOrdersCount) elOrdersCount.textContent = `${metrics.totalOrders} Orders Placed`;

    // Overview Recent Orders Table
    const tbody = document.getElementById('overviewRecentOrdersBody');
    if (tbody) {
        if (!metrics.recentOrders || metrics.recentOrders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">No orders placed yet.</td></tr>`;
        } else {
            tbody.innerHTML = metrics.recentOrders.map(o => `
                <tr>
                    <td><strong>#${o.orderNumber || o.id}</strong></td>
                    <td>${o.userName || o.userEmail || 'Customer'}</td>
                    <td><strong>${formatPrice(o.summary ? o.summary.total : 0)}</strong></td>
                    <td><span class="badge-status ${getBadgeClass(o.status)}">${o.status}</span></td>
                    <td style="font-size:0.8rem; color:var(--text-muted);">${o.formattedDate || 'Recent'}</td>
                </tr>
            `).join('');
        }
    }

    // Overview Recent Activity Feed
    const feed = document.getElementById('overviewRecentActivityList');
    if (feed) {
        const logs = await adminService.getLogs();
        const recentLogs = logs.slice(0, 5);
        if (recentLogs.length === 0) {
            feed.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">No recent activities logged.</p>`;
        } else {
            feed.innerHTML = recentLogs.map(l => `
                <div class="activity-item">
                    <div class="act-icon ${l.type}">
                        <i class="fa-solid ${getActIcon(l.type)}"></i>
                    </div>
                    <div class="act-details">
                        <h4>${l.action}</h4>
                        <p>${l.details}</p>
                        <span class="act-time">${l.timestamp}</span>
                    </div>
                </div>
            `).join('');
        }
    }
}

function getBadgeClass(status) {
    if (!status) return 'pending';
    const s = status.toLowerCase();
    if (s.includes('deliver')) return 'delivered';
    if (s.includes('ship')) return 'shipped';
    if (s.includes('cancel')) return 'cancelled';
    if (s.includes('confirm')) return 'confirmed';
    return 'placed';
}

function getActIcon(type) {
    if (type === 'user') return 'fa-user';
    if (type === 'order') return 'fa-bag-shopping';
    if (type === 'product') return 'fa-box';
    return 'fa-shield-halved';
}

// ----------------------------------------------------------------------------
// 2. USER MANAGEMENT MODULE
// ----------------------------------------------------------------------------
async function renderAdminUsers() {
    const tbody = document.getElementById('adminUsersTableBody');
    if (!tbody) return;

    let users = await adminService.getUsers();
    const searchVal = (document.getElementById('adminUserSearchInput')?.value || '').toLowerCase();
    const roleVal = document.getElementById('adminUserRoleFilter')?.value || 'ALL';

    if (roleVal !== 'ALL') {
        users = users.filter(u => u.role === roleVal);
    }
    if (searchVal) {
        users = users.filter(u =>
            (u.name && u.name.toLowerCase().includes(searchVal)) ||
            (u.email && u.email.toLowerCase().includes(searchVal)) ||
            (u.phone && u.phone.includes(searchVal))
        );
    }

    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color:var(--text-muted);">No users found matching filter.</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map(u => `
        <tr>
            <td>#${u.id}</td>
            <td><strong>${u.name}</strong></td>
            <td>${u.email}</td>
            <td>${u.phone || 'N/A'}</td>
            <td><span class="badge-role ${u.role ? u.role.toLowerCase() : 'buyer'}">${u.role}</span></td>
            <td><span class="badge-status ${u.active ? 'active' : 'inactive'}">${u.active ? 'Active' : 'Blocked'}</span></td>
            <td>
                <button class="tbl-btn tbl-btn-edit" onclick="editAdminUser(${u.id})"><i class="fa-solid fa-pen"></i> Edit</button>
                <button class="tbl-btn tbl-btn-delete" onclick="deleteAdminUser(${u.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

window.editAdminUser = async function(id) {
    const users = await adminService.getUsers();
    const u = users.find(x => x.id === id);
    if (!u) return;
    openAdminUserModal(u);
};

window.deleteAdminUser = async function(id) {
    if (confirm("Are you sure you want to delete this user?")) {
        await adminService.deleteUser(id);
        showToast("User deleted successfully.", "success");
        renderAdminPanel();
    }
};

function openAdminUserModal(user = null) {
    const modal = document.getElementById('adminUserModal');
    const backdrop = document.getElementById('adminUserBackdrop');
    const title = document.getElementById('adminUserModalTitle');

    if (!modal) return;

    if (user) {
        title.innerHTML = `<i class="fa-solid fa-user-pen text-orange"></i> Edit User Account`;
        document.getElementById('adminUserId').value = user.id;
        document.getElementById('adminUserName').value = user.name;
        document.getElementById('adminUserEmail').value = user.email;
        document.getElementById('adminUserPhone').value = user.phone || '';
        document.getElementById('adminUserRole').value = user.role || 'BUYER';
        document.getElementById('adminUserActive').value = user.active !== false ? 'true' : 'false';
    } else {
        title.innerHTML = `<i class="fa-solid fa-user-plus text-orange"></i> Add New User`;
        document.getElementById('adminUserForm').reset();
        document.getElementById('adminUserId').value = '';
    }

    modal.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
}

function closeAdminUserModal() {
    const modal = document.getElementById('adminUserModal');
    const backdrop = document.getElementById('adminUserBackdrop');
    if (modal) modal.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
}

// ----------------------------------------------------------------------------
// 3. SELLER MANAGEMENT MODULE
// ----------------------------------------------------------------------------
async function renderAdminSellers() {
    const tbody = document.getElementById('adminSellersTableBody');
    if (!tbody) return;

    let sellers = await adminService.getSellers();
    const searchVal = (document.getElementById('adminSellerSearchInput')?.value || '').toLowerCase();
    const statusVal = document.getElementById('adminSellerStatusFilter')?.value || 'ALL';

    if (statusVal !== 'ALL') {
        sellers = sellers.filter(s => s.status === statusVal);
    }
    if (searchVal) {
        sellers = sellers.filter(s =>
            (s.storeName && s.storeName.toLowerCase().includes(searchVal)) ||
            (s.email && s.email.toLowerCase().includes(searchVal))
        );
    }

    if (sellers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-muted);">No sellers found matching filter.</td></tr>`;
        return;
    }

    tbody.innerHTML = sellers.map(s => `
        <tr>
            <td><strong>${s.storeName}</strong></td>
            <td>${s.email}</td>
            <td>${s.category || 'General'}</td>
            <td><strong>${s.productsCount || 0} Products</strong></td>
            <td><strong>${formatPrice(s.totalSales || 0)}</strong></td>
            <td><span class="badge-status ${s.status ? s.status.toLowerCase() : 'pending'}">${s.status}</span></td>
            <td><span class="badge-status ${s.active ? 'active' : 'inactive'}">${s.active ? 'Active' : 'Disabled'}</span></td>
            <td>
                ${s.status === 'PENDING' ? `
                    <button class="tbl-btn tbl-btn-approve" onclick="updateSellerApprove(${s.id}, 'APPROVED')"><i class="fa-solid fa-check"></i> Approve</button>
                    <button class="tbl-btn tbl-btn-reject" onclick="updateSellerApprove(${s.id}, 'REJECTED')"><i class="fa-solid fa-xmark"></i> Reject</button>
                ` : `
                    <button class="tbl-btn ${s.active ? 'tbl-btn-reject' : 'tbl-btn-approve'}" onclick="toggleSellerStatus(${s.id})">
                        ${s.active ? 'Deactivate' : 'Activate'}
                    </button>
                `}
            </td>
        </tr>
    `).join('');
}

window.updateSellerApprove = async function(sellerId, status) {
    await adminService.updateSellerStatus(sellerId, status);
    showToast(`Seller status set to ${status}!`, "success");
    renderAdminPanel();
};

window.toggleSellerStatus = async function(sellerId) {
    await adminService.toggleSellerActive(sellerId);
    showToast("Seller account status updated!", "success");
    renderAdminPanel();
};

// ----------------------------------------------------------------------------
// 4. PRODUCT MANAGEMENT MODULE
// ----------------------------------------------------------------------------
async function renderAdminProducts() {
    const tbody = document.getElementById('adminProductsTableBody');
    if (!tbody) return;

    let products = await productService.getProducts();
    const searchVal = (document.getElementById('adminProductSearchInput')?.value || '').toLowerCase();
    const catVal = document.getElementById('adminProductCategoryFilter')?.value || 'ALL';

    if (catVal !== 'ALL') {
        products = products.filter(p => p.category === catVal);
    }
    if (searchVal) {
        products = products.filter(p =>
            (p.name && p.name.toLowerCase().includes(searchVal)) ||
            (p.category && p.category.toLowerCase().includes(searchVal))
        );
    }

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">No products found.</td></tr>`;
        return;
    }

    tbody.innerHTML = products.map(p => `
        <tr>
            <td style="display:flex; align-items:center; gap:10px;">
                <img src="${p.image}" alt="${p.name}" style="width:40px; height:40px; object-fit:cover; border-radius:6px;" onerror="handleImgError(this)">
                <div>
                    <strong>${p.name}</strong>
                    <div style="font-size:0.75rem; color:var(--text-muted);">ID: #${p.id}</div>
                </div>
            </td>
            <td><span class="badge-role buyer">${p.category}</span></td>
            <td><strong>${formatPrice(p.price)}</strong></td>
            <td>${p.oldPrice ? `<span style="text-decoration:line-through; color:var(--text-muted);">${formatPrice(p.oldPrice)}</span>` : 'N/A'}</td>
            <td>
                <span style="font-weight:700; color:${(p.stock || 0) <= 5 ? 'var(--orange-primary)' : 'var(--text-main)'};">
                    ${p.stock || 0} in stock
                </span>
            </td>
            <td>⭐ ${p.rating || 4.5}</td>
            <td>
                <button class="tbl-btn tbl-btn-edit" onclick="editAdminProduct(${p.id})"><i class="fa-solid fa-pen"></i> Edit</button>
                <button class="tbl-btn tbl-btn-delete" onclick="deleteAdminProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

window.editAdminProduct = async function(id) {
    const products = await productService.getProducts();
    const p = products.find(x => x.id === id);
    if (!p) return;
    openAdminProductModal(p);
};

window.deleteAdminProduct = async function(id) {
    if (confirm("Are you sure you want to delete this product?")) {
        try {
            await productService.deleteProduct(id);
            if (AuthStore.user?.role === 'ADMIN') await adminService.logActivity('Product Deleted', `Admin deleted product ID #${id}.`, 'product');
            showToast("Product deleted successfully!", "success");
            if (AuthStore.user?.role === 'SELLER') await renderSellerDashboard();
            else await renderAdminPanel();
        } catch (err) {
            showToast(err.message || "Failed to delete product", "orange");
        }
    }
};

function openAdminProductModal(prod = null) {
    const modal = document.getElementById('adminProductModal');
    const backdrop = document.getElementById('adminProductBackdrop');
    const title = document.getElementById('adminProductModalTitle');

    if (!modal) return;

    if (prod) {
        title.innerHTML = `<i class="fa-solid fa-pen text-orange"></i> Edit Product Listing`;
        document.getElementById('adminProductId').value = prod.id;
        document.getElementById('adminProdName').value = prod.name || '';
        document.getElementById('adminProdCategory').value = prod.category || prod.categoryName || 'Tech & Gadgets';
        document.getElementById('adminProdStock').value = prod.stock !== undefined ? prod.stock : 15;
        document.getElementById('adminProdPrice').value = prod.price || '';
        document.getElementById('adminProdOldPrice').value = prod.oldPrice || '';
        document.getElementById('adminProdImage').value = prod.image || '';
        document.getElementById('adminProdDescription').value = prod.description || '';

        if (Array.isArray(prod.images) && prod.images.length > 0) {
            currentProductPhotos = [...prod.images];
        } else if (prod.image) {
            currentProductPhotos = [prod.image];
        } else {
            currentProductPhotos = [];
        }
    } else {
        title.innerHTML = `<i class="fa-solid fa-box-open text-orange"></i> Add New Product`;
        document.getElementById('adminProductForm').reset();
        document.getElementById('adminProductId').value = '';
        currentProductPhotos = [];
    }

    renderProductPhotoSlots();
    modal.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
}

function closeAdminProductModal() {
    const modal = document.getElementById('adminProductModal');
    const backdrop = document.getElementById('adminProductBackdrop');
    if (modal) modal.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
}

// ----------------------------------------------------------------------------
// 5. ORDER MANAGEMENT MODULE
// ----------------------------------------------------------------------------
async function renderAdminOrders() {
    const tbody = document.getElementById('adminOrdersTableBody');
    if (!tbody) return;

    let orders = await orderService.getAllOrders();
    const searchVal = (document.getElementById('adminOrderSearchInput')?.value || '').toLowerCase();
    const statusVal = document.getElementById('adminOrderStatusFilter')?.value || 'ALL';

    if (statusVal !== 'ALL') {
        orders = orders.filter(o => o.status === statusVal);
    }
    if (searchVal) {
        orders = orders.filter(o =>
            (o.id && o.id.toLowerCase().includes(searchVal)) ||
            (o.userEmail && o.userEmail.toLowerCase().includes(searchVal)) ||
            (o.userName && o.userName.toLowerCase().includes(searchVal))
        );
    }

    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-muted);">No orders found matching filter.</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(o => `
        <tr>
            <td><strong>#${o.orderNumber || o.id}</strong></td>
            <td>
                <div><strong>${o.userName || 'Customer'}</strong></div>
                <div style="font-size:0.78rem; color:var(--text-muted);">${o.userEmail || ''}</div>
            </td>
            <td style="font-size:0.8rem; color:var(--text-muted);">${o.formattedDate || 'Recent'}</td>
            <td>${o.items ? o.items.length : 0} Items</td>
            <td><strong>${formatPrice(o.summary ? o.summary.total : 0)}</strong></td>
            <td><span class="badge-role buyer">${o.paymentMethod || 'COD'}</span></td>
            <td><span class="badge-status ${getBadgeClass(o.status)}">${o.status}</span></td>
            <td>
                <select style="padding:4px 8px; border-radius:6px; font-size:0.8rem;" onchange="updateOrderStatusAdmin('${o.id}', this.value)">
                    <option value="Placed" ${o.status === 'Placed' ? 'selected' : ''}>Placed</option>
                    <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="Out for Delivery" ${o.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                    <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
        </tr>
    `).join('');
}

window.updateOrderStatusAdmin = async function(orderId, newStatus) {
    const orders = await orderService.getAllOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
        orders[idx].status = newStatus;
        localStorage.setItem('shopsphere_orders', JSON.stringify(orders));
        await adminService.logActivity('Order Status Change', `Admin updated Order #${orderId} status to ${newStatus}.`, 'order');
        showToast(`Order #${orderId} set to ${newStatus}!`, "success");
        renderAdminPanel();
    }
};

// ----------------------------------------------------------------------------
// 6. SYSTEM ACTIVITY MONITORING MODULE
// ----------------------------------------------------------------------------
async function renderAdminActivityLogs() {
    const container = document.getElementById('adminActivityLogTimeline');
    if (!container) return;

    let logs = await adminService.getLogs();
    const filterType = document.getElementById('adminLogTypeFilter')?.value || 'ALL';

    if (filterType !== 'ALL') {
        logs = logs.filter(l => l.type === filterType);
    }

    if (logs.length === 0) {
        container.innerHTML = `<p style="padding:20px; text-align:center; color:var(--text-muted);">No activity logs found.</p>`;
        return;
    }

    container.innerHTML = logs.map(l => `
        <div class="activity-item" style="padding: 14px 0;">
            <div class="act-icon ${l.type}">
                <i class="fa-solid ${getActIcon(l.type)}"></i>
            </div>
            <div class="act-details" style="flex:1;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h4>${l.action}</h4>
                    <span class="act-time">${l.timestamp}</span>
                </div>
                <p style="margin-top:4px;">${l.details}</p>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Triggered by: <strong>${l.user}</strong></div>
            </div>
        </div>
    `).join('');
}

// ----------------------------------------------------------------------------
// 7. REPORTS & ANALYTICS MODULE
// ----------------------------------------------------------------------------
async function renderAdminReports() {
    // Monthly Sales Visual Bar Chart
    const chart = document.getElementById('adminMonthlySalesChart');
    if (chart) {
        const monthlyData = [
            { month: 'Jan', sales: 45000 },
            { month: 'Feb', sales: 62000 },
            { month: 'Mar', sales: 88000 },
            { month: 'Apr', sales: 75000 },
            { month: 'May', sales: 110000 },
            { month: 'Jun', sales: 95000 },
            { month: 'Jul', sales: 135000 },
            { month: 'Aug', sales: 160000 },
            { month: 'Sep', sales: 185000 },
            { month: 'Oct', sales: 220000 }
        ];

        const maxSales = Math.max(...monthlyData.map(d => d.sales));
        chart.innerHTML = monthlyData.map(d => {
            const pct = Math.round((d.sales / maxSales) * 100);
            return `
                <div class="chart-bar-wrapper">
                    <div class="chart-bar" style="height: ${pct}%;">
                        <span class="chart-bar-val">₹${Math.round(d.sales / 1000)}k</span>
                    </div>
                    <span class="chart-lbl">${d.month}</span>
                </div>
            `;
        }).join('');
    }

    // Top Products List
    const topList = document.getElementById('adminTopProductsList');
    if (topList) {
        const products = await productService.getProducts();
        const top5 = products.slice(0, 5);

        topList.innerHTML = top5.map((p, i) => `
            <div class="top-prod-item">
                <div class="top-prod-rank">#${i + 1}</div>
                <img src="${p.image}" alt="${p.name}" class="top-prod-img" onerror="handleImgError(this)">
                <div class="top-prod-info">
                    <h4>${p.name}</h4>
                    <p>${p.category} • ⭐ ${p.rating || 4.8}</p>
                </div>
                <div style="text-align:right;">
                    <strong>${formatPrice(p.price)}</strong>
                    <div style="font-size:0.75rem; color:var(--green-primary); font-weight:700;">Top Rated</div>
                </div>
            </div>
        `).join('');
    }

    // Seller Performance Table
    const sellerTbody = document.getElementById('adminSellerPerformanceTableBody');
    if (sellerTbody) {
        const sellers = await adminService.getSellers();
        sellerTbody.innerHTML = sellers.map(s => {
            const revenue = s.totalSales || 0;
            const platformShare = Math.round(revenue * 0.10);
            return `
                <tr>
                    <td><strong>${s.storeName}</strong></td>
                    <td>${s.category || 'General'}</td>
                    <td>${s.productsCount || 0} Listed</td>
                    <td>⭐ ${s.rating || 4.8}</td>
                    <td><strong>${formatPrice(revenue)}</strong></td>
                    <td><strong style="color:var(--green-primary);">${formatPrice(platformShare)}</strong></td>
                </tr>
            `;
        }).join('');
    }
}

// Hook Admin Engine initialization on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initAdminEngine();
});

/* ==========================================================================
   28. SELLER DASHBOARD & SELLER REGISTRATION ENGINE
   ========================================================================== */

function initSellerRegistrationListeners() {
    const roleRadios = document.querySelectorAll('input[name="registerRole"]');
    roleRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const extraFields = document.getElementById('sellerExtraFields');
            const storeName = document.getElementById('regStoreName');
            const gstNum = document.getElementById('regGstNumber');
            const details = document.getElementById('regProductDetails');

            if (e.target.value === 'SELLER') {
                if (extraFields) extraFields.style.display = 'block';
                if (storeName) storeName.required = true;
                if (gstNum) gstNum.required = true;
                if (details) details.required = true;
            } else {
                if (extraFields) extraFields.style.display = 'none';
                if (storeName) { storeName.required = false; storeName.value = ''; }
                if (gstNum) { gstNum.required = false; gstNum.value = ''; }
                if (details) { details.required = false; details.value = ''; }
            }
        });
    });

    const sellerAddProdBtn = document.getElementById('btnSellerOpenAddProductModal');
    const sellerAddProdBtn2 = document.getElementById('btnSellerAddProduct');
    if (sellerAddProdBtn) sellerAddProdBtn.addEventListener('click', () => openAdminProductModal());
    if (sellerAddProdBtn2) sellerAddProdBtn2.addEventListener('click', () => openAdminProductModal());
}

async function renderSellerDashboard() {
    if (!AuthStore.isLoggedIn()) return;
    const user = AuthStore.user;

    const elStoreTitle = document.getElementById('sellerStoreTitle');
    const elStoreSubtext = document.getElementById('sellerStoreSubtext');
    const elBannerName = document.getElementById('sellerBannerStoreName');
    const elBannerGst = document.getElementById('sellerBannerGst');
    const elBannerCat = document.getElementById('sellerBannerCategory');
    const elBannerEmail = document.getElementById('sellerBannerEmail');

    const storeName = user.storeName || `${user.name}'s Store`;
    const gstNo = user.gstNumber || '22AAAAA0000A1Z5';
    const cat = user.sellingCategory || 'Tech & Gadgets';

    if (elStoreTitle) elStoreTitle.textContent = `${storeName} - Merchant Dashboard`;
    if (elStoreSubtext) elStoreSubtext.textContent = `GSTIN: ${gstNo} • Primary Category: ${cat}`;
    if (elBannerName) elBannerName.innerHTML = `<i class="fa-solid fa-store text-yellow"></i> ${storeName}`;
    if (elBannerGst) elBannerGst.textContent = gstNo;
    if (elBannerCat) elBannerCat.textContent = cat;
    if (elBannerEmail) elBannerEmail.textContent = user.email;

    // Fetch seller listed products
    const products = await productService.getProducts();
    const sellerProducts = products.filter(p => {
        if (user.id && (p.sellerId === user.id || p.seller_id === user.id)) return true;
        if (p.sellerName && (p.sellerName === storeName || p.sellerName === user.name)) return true;
        const pCat = (p.category || p.categoryName || '').toLowerCase();
        const sCat = (cat || '').toLowerCase();
        if ((!p.sellerId && !p.seller_id) && (pCat === sCat || (sCat.includes('tech') && pCat.includes('tech')) || (sCat.includes('fashion') && pCat.includes('fashion')))) {
            return true;
        }
        return false;
    });

    const elStatProds = document.getElementById('sellerStatProducts');
    const elStatSales = document.getElementById('sellerStatSales');
    const elStatRating = document.getElementById('sellerStatRating');

    if (elStatProds) elStatProds.textContent = sellerProducts.length;
    if (elStatSales) elStatSales.textContent = formatPrice(sellerProducts.reduce((sum, p) => sum + (p.price * 10), 0));
    if (elStatRating) elStatRating.textContent = '4.8 ★';

    const tbody = document.getElementById('sellerProductsTableBody');
    if (tbody) {
        if (sellerProducts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">No products listed yet. Click "+ Add Product" to add your first product.</td></tr>`;
        } else {
            tbody.innerHTML = sellerProducts.map(p => `
                <tr>
                    <td style="display:flex; align-items:center; gap:10px;">
                        <img src="${p.image}" alt="${p.name}" style="width:40px; height:40px; object-fit:cover; border-radius:6px;" onerror="handleImgError(this)">
                        <div>
                            <strong>${p.name}</strong>
                            <div style="font-size:0.75rem; color:var(--text-muted);">ID: #${p.id}</div>
                        </div>
                    </td>
                    <td><span class="badge-role buyer">${p.categoryName || p.category || cat}</span></td>
                    <td><strong>${formatPrice(p.price)}</strong></td>
                    <td><strong>${p.stock || 15} in stock</strong></td>
                    <td><span class="badge-status active">Active</span></td>
                    <td>
                        <button class="tbl-btn tbl-btn-edit" onclick="editAdminProduct(${p.id})"><i class="fa-solid fa-pen"></i> Edit</button>
                        <button class="tbl-btn tbl-btn-delete" onclick="deleteAdminProduct(${p.id})"><i class="fa-solid fa-trash"></i> Delete</button>
                    </td>
                </tr>
            `).join('');
        }
    }

    renderSellerSalesPerformance();
}

document.addEventListener('DOMContentLoaded', () => {
    initSellerRegistrationListeners();
    initSellerTabListeners();
});

/* ==========================================================================
   29. BUYER DASHBOARD & BROWSING HISTORY ENGINE
   ========================================================================== */

function trackProductView(product) {
    if (!product || !product.id) return;
    let history = JSON.parse(localStorage.getItem('shopsphere_browsing_history') || '[]');
    history = history.filter(p => p.id !== product.id);
    history.unshift({
        id: product.id,
        title: product.title || product.name,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice || product.old_price || Math.round(product.price * 1.25),
        image: product.image,
        category: product.category || 'General',
        rating: product.rating || 4.8,
        viewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    if (history.length > 20) history = history.slice(0, 20);
    localStorage.setItem('shopsphere_browsing_history', JSON.stringify(history));
}

window.clearBrowsingHistory = function() {
    localStorage.removeItem('shopsphere_browsing_history');
    showToast("Browsing history cleared.", "success");
    renderBuyerDashboard();
};

async function renderBuyerDashboard() {
    if (!AuthStore.isLoggedIn()) {
        switchPage('login');
        return;
    }

    initBuyerTabListeners();
    await renderBuyerOverview();
    await renderBuyerOrders();
    await renderBuyerWishlist();
    renderBuyerHistory();
}

function initBuyerTabListeners() {
    const tabs = document.querySelectorAll('#buyerHeaderTabs .admin-tab-btn');
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabTarget = btn.getAttribute('data-tab');
            
            if (tabTarget === 'orders') {
                switchPage('orders');
                return;
            } else if (tabTarget === 'wishlist') {
                switchPage('wishlist');
                return;
            }
            
            tabs.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.buyer-tab-content').forEach(c => c.style.display = 'none');
            
            if (tabTarget === 'overview') document.getElementById('buyerTabOverview').style.display = 'block';
            else if (tabTarget === 'history') document.getElementById('buyerTabHistory').style.display = 'block';
        });
    });
}

async function renderBuyerOverview() {
    const user = AuthStore.user;
    if (!user) return;

    // Profile summary
    const profBox = document.getElementById('buyerProfileSummary');
    if (profBox) {
        profBox.innerHTML = `
            <div style="display: grid; gap: 12px; font-size: 0.95rem;">
                <div><span style="color:var(--text-muted);">Full Name:</span> <strong>${user.name}</strong></div>
                <div><span style="color:var(--text-muted);">Email:</span> <strong>${user.email}</strong></div>
                <div><span style="color:var(--text-muted);">Phone:</span> <strong>${user.phone || 'Not provided'}</strong></div>
                <div><span style="color:var(--text-muted);">Account Type:</span> <span class="badge-role buyer">${user.role || 'BUYER'}</span></div>
            </div>
        `;
    }

    // Saved Addresses
    const addrContainer = document.getElementById('buyerAddressBookContainer');
    const addresses = JSON.parse(localStorage.getItem('shopsphere_addresses') || '[]');
    const addressCountEl = document.getElementById('buyerAddressCount');
    if (addressCountEl) addressCountEl.textContent = addresses.length;

    if (addrContainer) {
        if (addresses.length === 0) {
            addrContainer.innerHTML = `<p style="color:var(--text-muted); padding:10px;">No saved addresses yet. Click "+ Add New Address" to save one for quick checkout.</p>`;
        } else {
            addrContainer.innerHTML = `
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:16px;">
                    ${addresses.map((a, i) => `
                        <div style="border: 2px solid ${a.isDefault ? 'var(--green-primary)' : 'var(--border-color)'}; padding: 16px; border-radius: var(--radius-md); background: #FFF; position: relative;">
                            ${a.isDefault ? `<span style="background:var(--green-primary); color:#FFF; font-size:0.75rem; font-weight:700; padding:2px 8px; border-radius:4px; position:absolute; top:12px; right:12px;">DEFAULT</span>` : ''}
                            <h4 style="font-weight:700; margin-bottom:4px;"><i class="fa-solid fa-user text-orange"></i> ${a.fullName}</h4>
                            <p style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:4px;">${a.line1}, ${a.city}, ${a.state} - ${a.pincode}</p>
                            <p style="font-size:0.85rem; color:var(--text-muted);"><i class="fa-solid fa-phone"></i> ${a.phone}</p>
                            <div style="margin-top: 12px; display:flex; gap:8px;">
                                <button class="tbl-btn tbl-btn-delete" onclick="deleteAddress(${i})"><i class="fa-solid fa-trash"></i> Remove</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    // Saved Payment Methods
    const payContainer = document.getElementById('buyerPaymentMethodsContainer');
    const payMethods = JSON.parse(localStorage.getItem('shopsphere_payment_methods') || '[]');
    if (payContainer) {
        if (payMethods.length === 0) {
            payContainer.innerHTML = `<p style="color:var(--text-muted);">No payment methods saved. Click "+ Add New" to save card or UPI details.</p>`;
        } else {
            payContainer.innerHTML = `
                <div style="display:grid; gap:10px;">
                    ${payMethods.map((pm, i) => `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid var(--border-color); border-radius:var(--radius-md); background:var(--bg-secondary);">
                            <div>
                                <strong><i class="fa-solid ${pm.type === 'CARD' ? 'fa-credit-card text-orange' : 'fa-mobile-screen text-green'}"></i> ${pm.holderName}</strong>
                                <div style="font-size:0.8rem; color:var(--text-muted);">${pm.number} (${pm.type})</div>
                            </div>
                            <button class="tbl-btn tbl-btn-delete" onclick="deletePaymentMethod(${i})"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }
}

// Address Book Modal Handlers
window.openAddressModal = function() {
    const modal = document.getElementById('buyerAddressModal');
    const backdrop = document.getElementById('buyerAddressBackdrop');
    if (modal) modal.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
};

window.closeAddressModal = function() {
    const modal = document.getElementById('buyerAddressModal');
    const backdrop = document.getElementById('buyerAddressBackdrop');
    if (modal) modal.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
};

document.getElementById('buyerAddressForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = document.getElementById('addrFullName').value.trim();
    const phone = document.getElementById('addrPhone').value.trim();
    const line1 = document.getElementById('addrLine1').value.trim();
    const city = document.getElementById('addrCity').value.trim();
    const state = document.getElementById('addrState').value.trim();
    const pincode = document.getElementById('addrPincode').value.trim();
    const isDefault = document.getElementById('addrDefault').checked;

    let addresses = JSON.parse(localStorage.getItem('shopsphere_addresses') || '[]');
    if (isDefault) {
        addresses.forEach(a => a.isDefault = false);
    }

    addresses.push({ fullName, phone, line1, city, state, pincode, isDefault: isDefault || addresses.length === 0 });
    localStorage.setItem('shopsphere_addresses', JSON.stringify(addresses));

    closeAddressModal();
    document.getElementById('buyerAddressForm').reset();
    showToast("Address saved successfully!", "success");
    renderBuyerOverview();
});

window.deleteAddress = function(index) {
    let addresses = JSON.parse(localStorage.getItem('shopsphere_addresses') || '[]');
    addresses.splice(index, 1);
    localStorage.setItem('shopsphere_addresses', JSON.stringify(addresses));
    showToast("Address removed.", "success");
    renderBuyerOverview();
};

// Payment Method Modal Handlers
window.openPaymentModal = function() {
    const modal = document.getElementById('buyerPaymentModal');
    const backdrop = document.getElementById('buyerPaymentBackdrop');
    if (modal) modal.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
};

window.closePaymentModal = function() {
    const modal = document.getElementById('buyerPaymentModal');
    const backdrop = document.getElementById('buyerPaymentBackdrop');
    if (modal) modal.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
};

document.getElementById('buyerPaymentForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = document.getElementById('payMethodType').value;
    const holderName = document.getElementById('payHolderName').value.trim();
    const number = document.getElementById('payNumber').value.trim();

    let payMethods = JSON.parse(localStorage.getItem('shopsphere_payment_methods') || '[]');
    payMethods.push({ type, holderName, number });
    localStorage.setItem('shopsphere_payment_methods', JSON.stringify(payMethods));

    closePaymentModal();
    document.getElementById('buyerPaymentForm').reset();
    showToast("Payment method saved!", "success");
    renderBuyerOverview();
});

window.deletePaymentMethod = function(index) {
    let payMethods = JSON.parse(localStorage.getItem('shopsphere_payment_methods') || '[]');
    payMethods.splice(index, 1);
    localStorage.setItem('shopsphere_payment_methods', JSON.stringify(payMethods));
    showToast("Payment method removed.", "success");
    renderBuyerOverview();
};

// Buyer Orders Render
async function renderBuyerOrders() {
    const tbody = document.getElementById('buyerOrdersTableBody');
    if (!tbody) return;

    const orders = await orderService.getAllOrders();
    const user = AuthStore.user;
    const buyerOrders = orders.filter(o => o.user_id === user.id || o.email === user.email);

    const ordersCountEl = document.getElementById('buyerTotalOrdersCount');
    if (ordersCountEl) ordersCountEl.textContent = buyerOrders.length;

    if (buyerOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">No orders found. Explore our catalog and make your first purchase!</td></tr>`;
        return;
    }

    tbody.innerHTML = buyerOrders.map(o => `
        <tr>
            <td><strong>#${o.id}</strong></td>
            <td>${o.date || new Date().toLocaleDateString()}</td>
            <td>${o.items ? o.items.length : 1} Items</td>
            <td><strong>${formatPrice(o.total || o.subtotal || 0)}</strong></td>
            <td><span class="badge-status ${getBadgeClass(o.status)}">${o.status}</span></td>
            <td>
                <button class="tbl-btn tbl-btn-edit" onclick="switchPage('order-detail', '${o.id}')"><i class="fa-solid fa-eye"></i> Track Order</button>
            </td>
        </tr>
    `).join('');
}

// Buyer Wishlist & Price Drops Render
async function renderBuyerWishlist() {
    const container = document.getElementById('buyerWishlistGridContainer');
    const wishlistCountEl = document.getElementById('buyerWishlistCount');
    if (wishlistCountEl) wishlistCountEl.textContent = wishlistItems.length;

    if (!container) return;

    if (wishlistItems.length === 0) {
        container.innerHTML = `<p style="padding:20px; text-align:center; color:var(--text-muted); grid-column: 1 / -1;">Your wishlist is currently empty.</p>`;
        return;
    }

    container.innerHTML = wishlistItems.map(p => {
        const oldPrice = p.oldPrice || p.old_price || Math.round(p.price * 1.25);
        const dropPct = Math.round(((oldPrice - p.price) / oldPrice) * 100);
        return `
            <div class="product-card">
                <div class="product-img-wrapper" onclick="switchPage('product-detail', ${p.id})">
                    <img src="${p.image}" alt="${p.name}" class="product-img" onerror="handleImgError(this)">
                    ${dropPct > 0 ? `<span class="badge-discount" style="background:var(--rose-accent);">PRICE DROPPED ${dropPct}% OFF</span>` : ''}
                </div>
                <div class="product-details">
                    <h3 class="product-title">${p.title || p.name}</h3>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                        <div>
                            <span class="product-card-price">${formatPrice(p.price)}</span>
                            ${oldPrice ? `<span style="text-decoration:line-through; font-size:0.8rem; color:var(--text-muted); margin-left:6px;">${formatPrice(oldPrice)}</span>` : ''}
                        </div>
                        <button class="btn-classic-orange btn-sm" onclick="cartService.addToCart(${p.id}); showToast('Added to cart!', 'success');">
                            <i class="fa-solid fa-cart-plus"></i> Buy Now
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Buyer Browsing History Render
function renderBuyerHistory() {
    const container = document.getElementById('buyerHistoryGridContainer');
    const history = JSON.parse(localStorage.getItem('shopsphere_browsing_history') || '[]');
    const historyCountEl = document.getElementById('buyerHistoryCount');
    if (historyCountEl) historyCountEl.textContent = history.length;

    if (!container) return;

    if (history.length === 0) {
        container.innerHTML = `<p style="padding:20px; text-align:center; color:var(--text-muted); grid-column: 1 / -1;">No recently viewed products yet. Click any product to explore.</p>`;
        return;
    }

    container.innerHTML = history.map(p => `
        <div class="product-card">
            <div class="product-img-wrapper" onclick="switchPage('product-detail', ${p.id})">
                <img src="${p.image}" alt="${p.name}" class="product-img" onerror="handleImgError(this)">
                <span class="badge-discount" style="background:var(--navy-dark);">Viewed ${p.viewedAt}</span>
            </div>
            <div class="product-details">
                <h3 class="product-title">${p.title || p.name}</h3>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                    <span class="product-card-price">${formatPrice(p.price)}</span>
                    <button class="btn-classic-yellow btn-sm" onclick="switchPage('product-detail', ${p.id})">
                        <i class="fa-solid fa-eye"></i> Revisit
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ----------------------------------------------------------------------------
// SELLER DASHBOARD TAB SWITCHER & ENHANCEMENTS
// ----------------------------------------------------------------------------
function initSellerTabListeners() {
    const tabs = document.querySelectorAll('#sellerHeaderTabs .admin-tab-btn');
    tabs.forEach(btn => {
        btn.addEventListener('click', async () => {
            tabs.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');

            const tabTarget = btn.getAttribute('data-seller-tab');
            document.querySelectorAll('.seller-tab-content').forEach(c => c.style.display = 'none');
            
            if (tabTarget === 'products') document.getElementById('sellerTabProducts').style.display = 'block';
            else if (tabTarget === 'orders') {
                document.getElementById('sellerTabOrders').style.display = 'block';
                await renderSellerOrders();
            } else if (tabTarget === 'inventory') {
                document.getElementById('sellerTabInventory').style.display = 'block';
                await renderSellerInventoryOverview();
            } else if (tabTarget === 'performance') {
                document.getElementById('sellerTabPerformance').style.display = 'block';
                await renderSellerSalesPerformance();
            }
        });
    });
}

async function renderSellerOrders() {
    const tbody = document.getElementById('sellerOrdersTableBody');
    if (!tbody) return;

    const orders = await orderService.getAllOrders();
    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">No orders received for your products yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(o => `
        <tr>
            <td><strong>#${o.id}</strong></td>
            <td>${o.customerName || 'Customer'} (${o.email})</td>
            <td>${o.date || new Date().toLocaleDateString()}</td>
            <td><strong>${formatPrice(o.total || o.subtotal || 0)}</strong></td>
            <td><span class="badge-status ${getBadgeClass(o.status)}">${o.status}</span></td>
            <td>
                <select style="padding:4px 8px; border-radius:6px; font-size:0.8rem;" onchange="updateOrderStatusAdmin('${o.id}', this.value)">
                    <option value="Placed" ${o.status === 'Placed' ? 'selected' : ''}>Placed</option>
                    <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="Out for Delivery" ${o.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                    <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </td>
        </tr>
    `).join('');
}

async function renderSellerInventoryOverview() {
    const alertBox = document.getElementById('sellerLowStockAlertContainer');
    const graphBox = document.getElementById('sellerInventoryGraphicalContainer');
    if (!graphBox) return;

    const products = await productService.getProducts();
    const lowStockItems = products.filter(p => (p.stock !== undefined ? p.stock : 15) <= 5);

    if (alertBox) {
        if (lowStockItems.length > 0) {
            alertBox.innerHTML = `
                <div style="padding:16px; background:#FFF0F0; border:2px solid var(--rose-accent); border-radius:var(--radius-md); display:flex; align-items:center; gap:12px;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:1.8rem; color:var(--rose-accent);"></i>
                    <div>
                        <h4 style="color:var(--rose-accent); font-weight:700;">LOW STOCK ALERT (${lowStockItems.length} Products Low in Stock)</h4>
                        <p style="font-size:0.88rem; color:var(--text-secondary);">The following products have 5 or fewer items remaining. Please restock immediately to avoid missing orders.</p>
                    </div>
                </div>
            `;
        } else {
            alertBox.innerHTML = `
                <div style="padding:16px; background:var(--bg-warm-cream); border:2px solid var(--green-primary); border-radius:var(--radius-md); display:flex; align-items:center; gap:12px;">
                    <i class="fa-solid fa-circle-check" style="font-size:1.8rem; color:var(--green-primary);"></i>
                    <div>
                        <h4 style="color:var(--green-primary); font-weight:700;">Stock Levels Healthy</h4>
                        <p style="font-size:0.88rem; color:var(--text-secondary);">All listed store items have sufficient inventory stock levels.</p>
                    </div>
                </div>
            `;
        }
    }

    graphBox.innerHTML = products.map(p => {
        const stock = p.stock !== undefined ? p.stock : 15;
        const maxCapacity = 50;
        const pct = Math.min(100, Math.round((stock / maxCapacity) * 100));
        let barColor = 'var(--green-primary)';
        if (stock <= 5) barColor = 'var(--rose-accent)';
        else if (stock <= 15) barColor = 'var(--yellow-primary)';

        return `
            <div style="border:1px solid var(--border-color); padding:14px; border-radius:var(--radius-md); background:#FFF;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <strong>${p.name}</strong>
                    <span style="font-weight:700; color:${barColor};">${stock} in stock (${pct}% Health)</span>
                </div>
                <div style="background:var(--bg-secondary); height:12px; border-radius:6px; overflow:hidden;">
                    <div style="width:${pct}%; background:${barColor}; height:100%; transition:width 0.4s ease;"></div>
                </div>
            </div>
        `;
    }).join('');
}

async function renderSellerSalesPerformance() {
    const chart = document.getElementById('sellerSalesPerformanceChart');
    if (chart) {
        const monthlyData = [
            { month: 'Jan', sales: 12000 },
            { month: 'Feb', sales: 18000 },
            { month: 'Mar', sales: 25000 },
            { month: 'Apr', sales: 22000 },
            { month: 'May', sales: 38000 },
            { month: 'Jun', sales: 31000 },
            { month: 'Jul', sales: 45000 },
            { month: 'Aug', sales: 52000 }
        ];

        const maxSales = Math.max(...monthlyData.map(d => d.sales));
        chart.innerHTML = monthlyData.map(d => {
            const pct = Math.max(12, Math.round((d.sales / maxSales) * 100));
            return `
                <div class="chart-bar-wrapper">
                    <div class="chart-bar" style="height: ${pct}%;">
                        <span class="chart-bar-val">₹${Math.round(d.sales / 1000)}k</span>
                    </div>
                    <span class="chart-lbl">${d.month}</span>
                </div>
            `;
        }).join('');
    }

    const tbody = document.getElementById('sellerTopProductsTableBody');
    if (tbody) {
        const products = await productService.getProducts();
        tbody.innerHTML = products.slice(0, 5).map(p => `
            <tr>
                <td><strong>${p.name}</strong></td>
                <td><span class="badge-role buyer">${p.category}</span></td>
                <td><strong>${formatPrice(p.price)}</strong></td>
                <td><strong>${Math.floor(Math.random() * 40) + 10} Units</strong></td>
                <td><strong style="color:var(--green-primary);">${formatPrice(p.price * 15)}</strong></td>
            </tr>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initSellerRegistrationListeners();
});
