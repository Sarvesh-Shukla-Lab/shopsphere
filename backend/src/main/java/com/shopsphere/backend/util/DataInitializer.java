package com.shopsphere.backend.util;

import com.shopsphere.backend.entity.*;
import com.shopsphere.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (categoryRepository.count() > 0) {
            log.info("Database already initialized with data. Skipping seeding.");
            return;
        }

        log.info("Seeding initial database data for ShopSphere...");

        // 1. Seed Users
        User admin = userRepository.save(User.builder()
                .name("ShopSphere Admin")
                .email("admin@shopsphere.com")
                .password(passwordEncoder.encode("Admin@123"))
                .phone("+1 800-555-0100")
                .role(Role.ADMIN)
                .active(true)
                .build());

        User seller1 = userRepository.save(User.builder()
                .name("Sphere Tech")
                .email("seller1@shopsphere.com")
                .password(passwordEncoder.encode("Seller@123"))
                .phone("+1 800-555-0101")
                .role(Role.SELLER)
                .active(true)
                .build());

        User seller2 = userRepository.save(User.builder()
                .name("Luxe Style")
                .email("seller2@shopsphere.com")
                .password(passwordEncoder.encode("Seller@123"))
                .phone("+1 800-555-0102")
                .role(Role.SELLER)
                .active(true)
                .build());

        User buyer1 = userRepository.save(User.builder()
                .name("John Doe")
                .email("buyer1@shopsphere.com")
                .password(passwordEncoder.encode("Buyer@123"))
                .phone("+1 800-555-0103")
                .role(Role.BUYER)
                .active(true)
                .build());

        User buyer2 = userRepository.save(User.builder()
                .name("Jane Smith")
                .email("buyer2@shopsphere.com")
                .password(passwordEncoder.encode("Buyer@123"))
                .phone("+1 800-555-0104")
                .role(Role.BUYER)
                .active(true)
                .build());

        // 2. Seed Categories
        Map<String, Category> categories = new HashMap<>();

        categories.put("tech", categoryRepository.save(Category.builder()
                .name("Tech & Gadgets")
                .slug("tech")
                .description("Headphones, Smartwatches, Audio & Tech Accessories")
                .icon("fa-solid fa-laptop")
                .build()));

        categories.put("fashion", categoryRepository.save(Category.builder()
                .name("Fashion & Apparel")
                .slug("fashion")
                .description("Clothing, Footwear, Sunglasses & Luxury Watches")
                .icon("fa-solid fa-shirt")
                .build()));

        categories.put("home", categoryRepository.save(Category.builder()
                .name("Home & Living")
                .slug("home")
                .description("Modern Decor, Lighting, Vases & Kitchenware")
                .icon("fa-solid fa-couch")
                .build()));

        categories.put("beauty", categoryRepository.save(Category.builder()
                .name("Beauty & Care")
                .slug("beauty")
                .description("Botanical Skincare, Serums, Hydration & Wellness")
                .icon("fa-solid fa-pump-soap")
                .build()));

        categories.put("sports", categoryRepository.save(Category.builder()
                .name("Sports & Travel")
                .slug("sports")
                .description("Fitness Equipment, Yoga Mats, Backpacks & Gear")
                .icon("fa-solid fa-dumbbell")
                .build()));

        // 3. Seed 20 Mock Products with Inventory
        createProduct("Aura Pro Wireless ANC Headphones",
                "Experience studio-grade acoustics with active noise cancellation, 40-hour battery life, and ultra-soft memory foam earcups.",
                189.99, 249.99, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
                4.9, 342, categories.get("tech"), seller1, 24);

        createProduct("Apex Horizon Smartwatch Series X",
                "Stay connected with AMOLED display, ECG monitoring, GPS tracking, and 100+ fitness tracking modes.",
                219.00, 299.00, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
                4.8, 218, categories.get("tech"), seller1, 15);

        createProduct("Quantum Bass Bluetooth Speaker",
                "360-degree immersive sound with deep bass response, IPX7 waterproof housing, and 20-hour playback time.",
                79.50, 99.99, "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80",
                4.7, 164, categories.get("tech"), seller1, 30);

        createProduct("Ergonomic Wireless Keyboard",
                "Whisper-quiet scissor keys with multi-device Bluetooth switching and rechargeable lithium battery.",
                59.99, 79.99, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
                4.6, 98, categories.get("tech"), seller1, 12);

        createProduct("Classic Italian Leather Watch",
                "Timeless Italian leather strap watch crafted with scratch-resistant sapphire crystal and Japanese quartz movement.",
                125.50, 160.00, "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80",
                4.9, 154, categories.get("fashion"), seller2, 18);

        createProduct("Urban Luxe Polarized Sunglasses",
                "UV400 protection polarized lenses encased in lightweight titanium frames for maximum outdoor comfort.",
                79.99, 110.00, "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80",
                4.9, 89, categories.get("fashion"), seller2, 25);

        createProduct("Vintage Genuine Leather Handbag",
                "Handcrafted full-grain leather handbag with brass hardware detailing and multiple interior compartments.",
                145.00, 195.00, "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
                4.8, 210, categories.get("fashion"), seller2, 10);

        createProduct("Premium Cashmere Knit Scarf",
                "Ultra-soft 100% Mongolian cashmere scarf for elegant warmth during cold seasons.",
                45.00, 60.00, "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80",
                4.7, 75, categories.get("fashion"), seller2, 40);

        createProduct("Nordic Minimalist Ceramic Vase",
                "Handcrafted matte ceramic vases perfect for pampas grass, dried florals, or contemporary home decor.",
                49.99, 65.00, "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80",
                4.7, 76, categories.get("home"), seller1, 22);

        createProduct("Smart Ambient Aroma Diffuser",
                "Ultrasonic Essential Oil Diffuser with ambient warm lighting, auto shut-off, and whisper-quiet operation.",
                59.50, 85.00, "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=600&q=80",
                4.8, 167, categories.get("home"), seller1, 14);

        createProduct("Luxury Egyptian Cotton Sheet Set",
                "1000 Thread Count long-staple Egyptian cotton sheets providing breathable luxury hotel comfort.",
                119.00, 159.00, "https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&w=600&q=80",
                4.9, 320, categories.get("home"), seller1, 8);

        createProduct("Handcrafted Wooden Table Lamp",
                "Natural solid oak wooden base with linen drum shade for cozy ambient bedroom illumination.",
                85.00, 115.00, "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
                4.6, 64, categories.get("home"), seller1, 19);

        createProduct("Organic Botanical Facial Elixir",
                "Nourishing facial elixir enriched with Vitamin C, Hyaluronic Acid, and pure botanical plant extracts.",
                42.00, 55.00, "https://images.unsplash.com/photo-1608248597261-833258657640?auto=format&fit=crop&w=600&q=80",
                4.9, 412, categories.get("beauty"), seller2, 35);

        createProduct("Pure Rosewater Hydrating Face Mist",
                "Distilled Damask rose water mist that soothes skin, restores hydration, and tightens pores.",
                28.00, 36.00, "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
                4.8, 180, categories.get("beauty"), seller2, 50);

        createProduct("Revitalizing Hyaluronic Serum",
                "Triple-weight hyaluronic acid serum providing deep multi-layer moisture barrier protection.",
                38.50, 50.00, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
                4.7, 230, categories.get("beauty"), seller2, 28);

        createProduct("Jade Roller & Gua Sha Massage Set",
                "100% Authentic Xiuyan Jade facial roller for reducing puffiness and promoting lymphatic drainage.",
                24.99, 35.00, "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=600&q=80",
                4.9, 290, categories.get("beauty"), seller2, 45);

        createProduct("Retro Canvas Travel Backpack",
                "Water-resistant vintage canvas backpack with padded laptop compartment and multi-pocket organization.",
                89.00, 120.00, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
                4.8, 195, categories.get("sports"), seller1, 16);

        createProduct("Pro Non-Slip Alignment Yoga Mat",
                "Eco-friendly natural rubber yoga mat with laser-engraved alignment guides and superior grip.",
                54.00, 72.00, "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80",
                4.9, 310, categories.get("sports"), seller1, 30);

        createProduct("Insulated Stainless Sports Bottle",
                "Double-wall vacuum insulated water bottle keeping drinks cold for 24 hours or hot for 12 hours.",
                29.99, 39.99, "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
                4.8, 142, categories.get("sports"), seller1, 60);

        createProduct("Speed Jump Rope with Bearings",
                "Adjustable steel wire jump rope with anti-slip aluminum handles for cardio endurance training.",
                19.50, 25.00, "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
                4.7, 88, categories.get("sports"), seller1, 50);

        log.info("Database seeding successfully completed!");
    }

    private void createProduct(String name, String desc, double price, double oldPrice, String img,
                               double rating, int reviews, Category category, User seller, int stockQty) {
        Product p = productRepository.save(Product.builder()
                .name(name)
                .description(desc)
                .price(BigDecimal.valueOf(price))
                .oldPrice(BigDecimal.valueOf(oldPrice))
                .image(img)
                .rating(rating)
                .reviewCount(reviews)
                .category(category)
                .seller(seller)
                .active(true)
                .build());

        inventoryRepository.save(Inventory.builder()
                .product(p)
                .quantity(stockQty)
                .lowStockThreshold(5)
                .build());
    }
}
