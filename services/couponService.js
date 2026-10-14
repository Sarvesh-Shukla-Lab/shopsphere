/* ==========================================================================
   COUPON SERVICE - MANAGING DISCOUNT COUPONS & VALIDATION
   ========================================================================== */

const AVAILABLE_COUPONS = [
    {
        code: "WELCOME20",
        type: "percent",
        value: 20,
        minOrder: 999,
        maxDiscount: 500,
        description: "Get 20% OFF on your first order above ₹999 (Max ₹500 discount)"
    },
    {
        code: "SAVE10",
        type: "percent",
        value: 10,
        minOrder: 499,
        maxDiscount: 300,
        description: "Save 10% OFF on orders above ₹499 (Max ₹300 discount)"
    },
    {
        code: "FLAT200",
        type: "flat",
        value: 200,
        minOrder: 1999,
        maxDiscount: 200,
        description: "Flat ₹200 OFF on orders above ₹1,999"
    },
    {
        code: "FREESHIP",
        type: "freeship",
        value: 0,
        minOrder: 0,
        maxDiscount: 49,
        description: "Free Express Delivery on any order"
    },
    {
        code: "CLASSIC40",
        type: "percent",
        value: 40,
        minOrder: 0,
        maxDiscount: 1500,
        categoryRestriction: ["tech", "fashion"],
        description: "40% OFF on Tech & Fashion accessories (Max ₹1,500 discount)"
    }
];

const couponService = {
    async getAllCoupons() {
        return Promise.resolve([...AVAILABLE_COUPONS]);
    },

    async getCouponByCode(code) {
        if (!code) return null;
        const normalized = code.trim().toUpperCase();
        const found = AVAILABLE_COUPONS.find(c => c.code === normalized);
        return Promise.resolve(found || null);
    },

    async validateAndCalculate(code, subtotal, cartItems = []) {
        if (!code) {
            return { valid: false, message: "Please enter a coupon code." };
        }

        const coupon = await this.getCouponByCode(code);
        if (!coupon) {
            return { valid: false, message: `Invalid coupon code "${code.toUpperCase()}".` };
        }

        if (subtotal < coupon.minOrder) {
            return {
                valid: false,
                coupon,
                message: `Minimum order amount of ${formatPrice(coupon.minOrder)} required for coupon ${coupon.code}.`
            };
        }

        let discountAmount = 0;

        if (coupon.type === "percent") {
            if (coupon.categoryRestriction && coupon.categoryRestriction.length > 0) {
                const eligibleSubtotal = cartItems.reduce((acc, item) => {
                    if (coupon.categoryRestriction.includes(item.category)) {
                        return acc + (item.price * item.qty);
                    }
                    return acc;
                }, 0);

                if (eligibleSubtotal === 0) {
                    return {
                        valid: false,
                        coupon,
                        message: `Coupon ${coupon.code} is valid only for Tech & Fashion products.`
                    };
                }

                discountAmount = Math.min(eligibleSubtotal * (coupon.value / 100), coupon.maxDiscount);
            } else {
                discountAmount = Math.min(subtotal * (coupon.value / 100), coupon.maxDiscount);
            }
        } else if (coupon.type === "flat") {
            discountAmount = Math.min(coupon.value, subtotal);
        } else if (coupon.type === "freeship") {
            discountAmount = 0;
        }

        discountAmount = Math.round(discountAmount);

        return {
            valid: true,
            coupon,
            discountAmount,
            message: `Coupon "${coupon.code}" applied successfully! Saved ${coupon.type === 'freeship' ? 'Delivery Fee' : formatPrice(discountAmount)}.`
        };
    }
};

window.couponService = couponService;
