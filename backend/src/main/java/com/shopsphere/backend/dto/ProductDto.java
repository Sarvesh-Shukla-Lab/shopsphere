package com.shopsphere.backend.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal oldPrice;
    private String image;
    private List<String> images;
    private Double rating;
    private Integer reviewCount;
    private String categorySlug;
    private String categoryName;
    private String category;
    private Long sellerId;
    private String sellerName;
    private Integer stock;
    private boolean active;
}
