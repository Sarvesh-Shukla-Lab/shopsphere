package com.shopsphere.backend.service;

import com.shopsphere.backend.dto.ProductDto;
import java.util.List;

public interface ProductService {
    List<ProductDto> getProducts(String categorySlug, String search);
    ProductDto getProductById(Long id);
    ProductDto addProduct(ProductDto productDto);
    ProductDto updateProduct(Long id, ProductDto productDto);
    void deleteProduct(Long id);
}
