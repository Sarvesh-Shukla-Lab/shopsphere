/* ==========================================================================
   SHOPSPHERE - CENTRAL MOCK DATASTORE & INR CURRENCY FORMATTER
   ========================================================================== */

/**
 * Format price in Indian Rupee format (₹)
 * e.g. 14999 -> ₹14,999
 */
const formatPrice = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

const CATEGORIES = [
    {
        id: "tech",
        name: "Tech & Gadgets",
        icon: "fa-solid fa-laptop",
        desc: "Headphones, Smartwatches, Audio & Tech Accessories"
    },
    {
        id: "fashion",
        name: "Fashion & Apparel",
        icon: "fa-solid fa-shirt",
        desc: "Clothing, Footwear, Sunglasses & Luxury Watches"
    },
    {
        id: "home",
        name: "Home & Living",
        icon: "fa-solid fa-couch",
        desc: "Modern Decor, Lighting, Vases & Kitchenware"
    },
    {
        id: "beauty",
        name: "Beauty & Care",
        icon: "fa-solid fa-pump-soap",
        desc: "Botanical Skincare, Serums, Hydration & Wellness"
    },
    {
        id: "sports",
        name: "Sports & Travel",
        icon: "fa-solid fa-dumbbell",
        desc: "Fitness Equipment, Yoga Mats, Backpacks & Gear"
    }
];

const PRODUCTS = [
    // Tech & Gadgets (4 Products)
    {
        id: 1,
        name: "Aura Pro Wireless ANC Headphones",
        title: "Aura Pro Wireless ANC Headphones",
        category: "tech",
        categoryName: "Tech & Gadgets",
        price: 14999,
        oldPrice: 19999,
        rating: 4.9,
        reviews: 342,
        reviewsCount: 342,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80"
        ],
        description: "Experience studio-grade acoustics with active noise cancellation, 40-hour battery life, and ultra-soft memory foam earcups.",
        stock: 24,
        sellerName: "Sphere Tech Official",
        discount: "25% OFF",
        isFeatured: true
    },
    {
        id: 2,
        name: "Apex Horizon Smartwatch Series X",
        title: "Apex Horizon Smartwatch Series X",
        category: "tech",
        categoryName: "Tech & Gadgets",
        price: 17999,
        oldPrice: 24999,
        rating: 4.8,
        reviews: 218,
        reviewsCount: 218,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80"
        ],
        description: "Stay connected with high-res AMOLED display, ECG monitoring, built-in GPS tracking, and 100+ fitness modes.",
        stock: 15,
        sellerName: "TechZone Store",
        discount: "28% OFF",
        isFeatured: true
    },
    {
        id: 3,
        name: "Quantum Bass Bluetooth Speaker",
        title: "Quantum Bass Bluetooth Speaker",
        category: "tech",
        categoryName: "Tech & Gadgets",
        price: 4999,
        oldPrice: 6999,
        rating: 4.7,
        reviews: 164,
        reviewsCount: 164,
        image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80"
        ],
        description: "360-degree immersive sound with deep bass response, IPX7 waterproof housing, and 20-hour playback time.",
        stock: 30,
        sellerName: "Sphere Tech Official",
        discount: "29% OFF",
        isFeatured: false
    },
    {
        id: 4,
        name: "Ergonomic Wireless Keyboard",
        title: "Ergonomic Wireless Keyboard",
        category: "tech",
        categoryName: "Tech & Gadgets",
        price: 3499,
        oldPrice: 4999,
        rating: 4.6,
        reviews: 98,
        reviewsCount: 98,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80"
        ],
        description: "Whisper-quiet scissor keys with multi-device Bluetooth switching and rechargeable long-life battery.",
        stock: 12,
        sellerName: "TechZone Store",
        discount: "30% OFF",
        isFeatured: false
    },

    // Fashion & Apparel (4 Products)
    {
        id: 5,
        name: "Heritage Leather Chronograph Watch",
        title: "Heritage Leather Chronograph Watch",
        category: "fashion",
        categoryName: "Fashion & Apparel",
        price: 12999,
        oldPrice: 17999,
        rating: 4.9,
        reviews: 154,
        reviewsCount: 154,
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80"
        ],
        description: "Timeless genuine leather strap watch crafted with scratch-resistant sapphire crystal and precision movement.",
        stock: 18,
        sellerName: "Luxe Timepieces",
        discount: "28% OFF",
        isFeatured: true
    },
    {
        id: 6,
        name: "Urban Luxe Polarized Sunglasses",
        title: "Urban Luxe Polarized Sunglasses",
        category: "fashion",
        categoryName: "Fashion & Apparel",
        price: 2499,
        oldPrice: 3999,
        rating: 4.9,
        reviews: 89,
        reviewsCount: 89,
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80"
        ],
        description: "UV400 protection polarized lenses encased in lightweight titanium frames for maximum outdoor comfort.",
        stock: 25,
        sellerName: "Vogue Style",
        discount: "38% OFF",
        isFeatured: true
    },
    {
        id: 7,
        name: "Vintage Genuine Leather Handbag",
        title: "Vintage Genuine Leather Handbag",
        category: "fashion",
        categoryName: "Fashion & Apparel",
        price: 7999,
        oldPrice: 11999,
        rating: 4.8,
        reviews: 210,
        reviewsCount: 210,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80"
        ],
        description: "Handcrafted full-grain leather handbag with brass hardware detailing and multiple interior compartments.",
        stock: 10,
        sellerName: "Luxe Timepieces",
        discount: "33% OFF",
        isFeatured: false
    },
    {
        id: 8,
        name: "Premium Cashmere Knit Scarf",
        title: "Premium Cashmere Knit Scarf",
        category: "fashion",
        categoryName: "Fashion & Apparel",
        price: 1999,
        oldPrice: 2999,
        rating: 4.7,
        reviews: 75,
        reviewsCount: 75,
        image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80"
        ],
        description: "Ultra-soft 100% fine cashmere scarf for elegant warmth during cold seasons.",
        stock: 40,
        sellerName: "Vogue Style",
        discount: "33% OFF",
        isFeatured: false
    },

    // Home & Living (4 Products)
    {
        id: 9,
        name: "Nordic Minimalist Ceramic Vase",
        title: "Nordic Minimalist Ceramic Vase",
        category: "home",
        categoryName: "Home & Living",
        price: 2499,
        oldPrice: 3499,
        rating: 4.7,
        reviews: 76,
        reviewsCount: 76,
        image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&w=600&q=80"
        ],
        description: "Handcrafted matte ceramic vases perfect for pampas grass, dried florals, or contemporary home decor.",
        stock: 22,
        sellerName: "Nordic Living",
        discount: "29% OFF",
        isFeatured: true
    },
    {
        id: 10,
        name: "Smart Ambient Aroma Diffuser",
        title: "Smart Ambient Aroma Diffuser",
        category: "home",
        categoryName: "Home & Living",
        price: 2999,
        oldPrice: 4299,
        rating: 4.8,
        reviews: 167,
        reviewsCount: 167,
        image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=600&q=80"
        ],
        description: "Ultrasonic Essential Oil Diffuser with ambient warm lighting, auto shut-off, and whisper-quiet operation.",
        stock: 14,
        sellerName: "AromaCraft",
        discount: "30% OFF",
        isFeatured: true
    },
    {
        id: 11,
        name: "Luxury Egyptian Cotton Sheet Set",
        title: "Luxury Egyptian Cotton Sheet Set",
        category: "home",
        categoryName: "Home & Living",
        price: 5999,
        oldPrice: 8999,
        rating: 4.9,
        reviews: 320,
        reviewsCount: 320,
        image: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&w=600&q=80"
        ],
        description: "1000 Thread Count long-staple Egyptian cotton sheets providing breathable luxury hotel comfort.",
        stock: 8,
        sellerName: "Nordic Living",
        discount: "33% OFF",
        isFeatured: false
    },
    {
        id: 12,
        name: "Handcrafted Wooden Table Lamp",
        title: "Handcrafted Wooden Table Lamp",
        category: "home",
        categoryName: "Home & Living",
        price: 3999,
        oldPrice: 5999,
        rating: 4.6,
        reviews: 64,
        reviewsCount: 64,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80"
        ],
        description: "Natural solid oak wooden base with linen drum shade for cozy ambient bedroom illumination.",
        stock: 19,
        sellerName: "AromaCraft",
        discount: "33% OFF",
        isFeatured: false
    },

    // Beauty & Care (4 Products)
    {
        id: 13,
        name: "Organic Botanical Facial Elixir",
        title: "Organic Botanical Facial Elixir",
        category: "beauty",
        categoryName: "Beauty & Care",
        price: 1499,
        oldPrice: 1999,
        rating: 4.9,
        reviews: 412,
        reviewsCount: 412,
        image: "https://images.unsplash.com/photo-1608248597261-833258657640?auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1608248597261-833258657640?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80"
        ],
        description: "Nourishing facial elixir enriched with Vitamin C, Hyaluronic Acid, and pure botanical plant extracts.",
        stock: 35,
        sellerName: "Glow Botanicals",
        discount: "25% OFF",
        isFeatured: true
    },
    {
        id: 14,
        name: "Pure Rosewater Hydrating Face Mist",
        title: "Pure Rosewater Hydrating Face Mist",
        category: "beauty",
        categoryName: "Beauty & Care",
        price: 699,
        oldPrice: 999,
        rating: 4.8,
        reviews: 180,
        reviewsCount: 180,
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80"
        ],
        description: "Distilled Damask rose water mist that soothes skin, restores hydration, and tightens pores.",
        stock: 50,
        sellerName: "Glow Botanicals",
        discount: "30% OFF",
        isFeatured: false
    },
    {
        id: 15,
        name: "Revitalizing Hyaluronic Serum",
        title: "Revitalizing Hyaluronic Serum",
        category: "beauty",
        categoryName: "Beauty & Care",
        price: 1299,
        oldPrice: 1799,
        rating: 4.7,
        reviews: 230,
        reviewsCount: 230,
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80"
        ],
        description: "Triple-weight hyaluronic acid serum providing deep multi-layer moisture barrier protection.",
        stock: 28,
        sellerName: "Pure Skin Co.",
        discount: "28% OFF",
        isFeatured: false
    },
    {
        id: 16,
        name: "Jade Roller & Gua Sha Massage Set",
        title: "Jade Roller & Gua Sha Massage Set",
        category: "beauty",
        categoryName: "Beauty & Care",
        price: 899,
        oldPrice: 1299,
        rating: 4.9,
        reviews: 290,
        reviewsCount: 290,
        image: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=600&q=80"
        ],
        description: "100% Authentic Xiuyan Jade facial roller for reducing puffiness and promoting lymphatic drainage.",
        stock: 45,
        sellerName: "Pure Skin Co.",
        discount: "31% OFF",
        isFeatured: false
    },

    // Sports & Travel (4 Products)
    {
        id: 17,
        name: "Retro Canvas Travel Backpack",
        title: "Retro Canvas Travel Backpack",
        category: "sports",
        categoryName: "Sports & Travel",
        price: 3499,
        oldPrice: 4999,
        rating: 4.8,
        reviews: 195,
        reviewsCount: 195,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=600&q=80"
        ],
        description: "Water-resistant vintage canvas backpack with padded laptop compartment and multi-pocket organization.",
        stock: 16,
        sellerName: "Apex Outdoor",
        discount: "30% OFF",
        isFeatured: true
    },
    {
        id: 18,
        name: "Pro Non-Slip Alignment Yoga Mat",
        title: "Pro Non-Slip Alignment Yoga Mat",
        category: "sports",
        categoryName: "Sports & Travel",
        price: 1899,
        oldPrice: 2499,
        rating: 4.9,
        reviews: 310,
        reviewsCount: 310,
        image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80"
        ],
        description: "Eco-friendly natural rubber yoga mat with laser-engraved alignment guides and superior grip.",
        stock: 30,
        sellerName: "FitLife Pro",
        discount: "24% OFF",
        isFeatured: true
    },
    {
        id: 19,
        name: "Insulated Stainless Sports Bottle",
        title: "Insulated Stainless Sports Bottle",
        category: "sports",
        categoryName: "Sports & Travel",
        price: 1199,
        oldPrice: 1699,
        rating: 4.8,
        reviews: 142,
        reviewsCount: 142,
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80"
        ],
        description: "Double-wall vacuum insulated water bottle keeping drinks cold for 24 hours or hot for 12 hours.",
        stock: 60,
        sellerName: "Apex Outdoor",
        discount: "29% OFF",
        isFeatured: false
    },
    {
        id: 20,
        name: "Speed Jump Rope with Bearings",
        title: "Speed Jump Rope with Bearings",
        category: "sports",
        categoryName: "Sports & Travel",
        price: 799,
        oldPrice: 1199,
        rating: 4.7,
        reviews: 88,
        reviewsCount: 88,
        image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80"
        ],
        description: "Adjustable steel wire jump rope with anti-slip aluminum handles for cardio endurance training.",
        stock: 50,
        sellerName: "FitLife Pro",
        discount: "33% OFF",
        isFeatured: false
    }
];

// Helper to calculate product count per category dynamically
function getProductCountByCategory(catId) {
    if (catId === "all") return PRODUCTS.length;
    return PRODUCTS.filter(p => p.category === catId).length;
}

// Global Image Error Fallback Handler
window.handleImgError = function(imgElement) {
    if (!imgElement) return;
    imgElement.onerror = null;
    imgElement.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23F8FAFC'/><rect x='20' y='20' width='360' height='360' rx='16' fill='none' stroke='%23E2E8F0' stroke-width='4' stroke-dasharray='8 8'/><text x='50%25' y='46%25' dominant-baseline='middle' text-anchor='middle' font-size='48'>🛍️</text><text x='50%25' y='62%25' dominant-baseline='middle' text-anchor='middle' font-family='Plus Jakarta Sans, sans-serif' font-size='15' font-weight='bold' fill='%23F97316'>ShopSphere Product</text></svg>";
};
