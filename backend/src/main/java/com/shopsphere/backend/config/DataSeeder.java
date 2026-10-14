package com.shopsphere.backend.config;

import com.shopsphere.backend.entity.Category;
import com.shopsphere.backend.entity.Product;
import com.shopsphere.backend.repository.CategoryRepository;
import com.shopsphere.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            Category tech = categoryRepository.save(Category.builder()
                    .name("Tech & Gadgets").slug("tech").icon("fa-solid fa-laptop")
                    .description("Headphones, Smartwatches, Audio & Tech Accessories").build());

            Category fashion = categoryRepository.save(Category.builder()
                    .name("Fashion & Apparel").slug("fashion").icon("fa-solid fa-shirt")
                    .description("Clothing, Footwear, Sunglasses & Luxury Watches").build());

            if (productRepository.count() == 0) {
                productRepository.save(Product.builder()
                        .name("Aura Pro Wireless ANC Headphones")
                        .description("Premium active noise cancelling headphones with 40-hour battery life and spatial audio support.")
                        .price(new BigDecimal("14999"))
                        .oldPrice(new BigDecimal("18999"))
                        .image("assets/images/headphone1.jpg")
                        .rating(4.8).reviewCount(1245)
                        .category(tech).active(true).build());

                productRepository.save(Product.builder()
                        .name("Apex Horizon Smartwatch Series X")
                        .description("Next-gen smartwatch with ECG, sleep tracking, and a titanium case. Water resistant up to 50m.")
                        .price(new BigDecimal("17999"))
                        .oldPrice(new BigDecimal("21999"))
                        .image("assets/images/watch1.jpg")
                        .rating(4.7).reviewCount(856)
                        .category(tech).active(true).build());

                productRepository.save(Product.builder()
                        .name("Midnight Stealth Men's Chronograph")
                        .description("Elegant matte black analog watch with precise quartz movement and genuine leather strap.")
                        .price(new BigDecimal("8499"))
                        .oldPrice(new BigDecimal("11999"))
                        .image("assets/images/watch2.jpg")
                        .rating(4.9).reviewCount(420)
                        .category(fashion).active(true).build());

                productRepository.save(Product.builder()
                        .name("Polaris Urban Kicks - White")
                        .description("Classic white sneakers designed for maximum comfort and everyday urban style.")
                        .price(new BigDecimal("3499"))
                        .oldPrice(new BigDecimal("5999"))
                        .image("assets/images/shoes1.jpg")
                        .rating(4.5).reviewCount(680)
                        .category(fashion).active(true).build());
            }
        }
    }
}
