package com.shopsphere.backend.service.impl;

import com.shopsphere.backend.dto.ProductDto;
import com.shopsphere.backend.entity.Category;
import com.shopsphere.backend.entity.Inventory;
import com.shopsphere.backend.entity.Product;
import com.shopsphere.backend.entity.User;
import com.shopsphere.backend.exception.ResourceNotFoundException;
import com.shopsphere.backend.repository.CategoryRepository;
import com.shopsphere.backend.repository.InventoryRepository;
import com.shopsphere.backend.repository.ProductRepository;
import com.shopsphere.backend.repository.UserRepository;
import com.shopsphere.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto> getProducts(String category, String search) {
        List<Product> products;
        boolean hasCategory = StringUtils.hasText(category) && !"all".equalsIgnoreCase(category);
        boolean hasSearch = StringUtils.hasText(search);

        if (hasCategory && hasSearch) {
            products = productRepository.findByCategorySlugAndNameContainingIgnoreCaseAndActiveTrue(category.trim(), search.trim());
        } else if (hasCategory) {
            products = productRepository.findByCategorySlugAndActiveTrue(category.trim());
        } else if (hasSearch) {
            products = productRepository.findByNameContainingIgnoreCaseAndActiveTrue(search.trim());
        } else {
            products = productRepository.findByActiveTrue();
        }

        return products.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return convertToDto(product);
    }

    @Override
    @Transactional
    public ProductDto addProduct(ProductDto dto) {
        String categoryName = StringUtils.hasText(dto.getCategoryName()) ? dto.getCategoryName() : dto.getCategory();
        Category category = getOrCreateCategory(categoryName);

        User seller = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String email = auth.getName();
            seller = userRepository.findByEmail(email).orElse(null);
        }
        if (seller == null && dto.getSellerId() != null) {
            seller = userRepository.findById(dto.getSellerId()).orElse(null);
        }

        String mainImage = dto.getImage();
        if ((mainImage == null || mainImage.isBlank()) && dto.getImages() != null && !dto.getImages().isEmpty()) {
            mainImage = dto.getImages().get(0);
        }

        Product product = Product.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .oldPrice(dto.getOldPrice())
                .image(mainImage)
                .category(category)
                .seller(seller)
                .active(true)
                .rating(dto.getRating() != null ? dto.getRating() : 4.5)
                .reviewCount(dto.getReviewCount() != null ? dto.getReviewCount() : 0)
                .build();
        product = productRepository.save(product);
        
        Inventory inv = Inventory.builder().product(product).quantity(dto.getStock() != null ? dto.getStock() : 10).build();
        inventoryRepository.save(inv);
        return convertToDto(product);
    }

    @Override
    @Transactional
    public ProductDto updateProduct(Long id, ProductDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        if (dto.getName() != null) product.setName(dto.getName());
        if (dto.getDescription() != null) product.setDescription(dto.getDescription());
        if (dto.getPrice() != null) product.setPrice(dto.getPrice());
        if (dto.getOldPrice() != null) product.setOldPrice(dto.getOldPrice());
        if (dto.getImage() != null) product.setImage(dto.getImage());
        else if (dto.getImages() != null && !dto.getImages().isEmpty()) product.setImage(dto.getImages().get(0));
        
        String categoryName = StringUtils.hasText(dto.getCategoryName()) ? dto.getCategoryName() : dto.getCategory();
        if (StringUtils.hasText(categoryName)) {
            product.setCategory(getOrCreateCategory(categoryName));
        }
        product = productRepository.save(product);

        Inventory inv = inventoryRepository.findByProductId(id)
                .orElse(Inventory.builder().product(product).build());
        inv.setQuantity(dto.getStock() != null ? dto.getStock() : 10);
        inventoryRepository.save(inv);

        return convertToDto(product);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product != null) {
            product.setActive(false);
            productRepository.save(product);
        }
    }

    private Category getOrCreateCategory(String name) {
        final String finalName = StringUtils.hasText(name) ? name : "General";
        String slug = finalName.toLowerCase().replace(" ", "-").replace("&", "and");
        return categoryRepository.findBySlug(slug)
                .orElseGet(() -> categoryRepository.save(Category.builder().name(finalName).slug(slug).description(finalName).icon("fa-solid fa-box").build()));
    }

    private ProductDto convertToDto(Product product) {
        Integer stock = inventoryRepository.findByProductId(product.getId())
                .map(Inventory::getQuantity).orElse(0);
        String sellerName = (product.getSeller() != null) ? product.getSeller().getName() : "Sphere Official";
        Long sellerId = (product.getSeller() != null) ? product.getSeller().getId() : null;
        String catName = product.getCategory() != null ? product.getCategory().getName() : null;
        String catSlug = product.getCategory() != null ? product.getCategory().getSlug() : null;
        List<String> images = (product.getImage() != null) ? List.of(product.getImage()) : List.of();

        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .oldPrice(product.getOldPrice())
                .image(product.getImage())
                .images(images)
                .rating(product.getRating())
                .reviewCount(product.getReviewCount())
                .categorySlug(catSlug)
                .categoryName(catName)
                .category(catName)
                .sellerId(sellerId)
                .sellerName(sellerName)
                .stock(stock)
                .active(product.isActive())
                .build();
    }
}
