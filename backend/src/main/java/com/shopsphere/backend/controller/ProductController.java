package com.shopsphere.backend.controller;

import com.shopsphere.backend.dto.ApiResponse;
import com.shopsphere.backend.dto.ProductDto;
import com.shopsphere.backend.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Product API", description = "Endpoints for ShopSphere products")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get active products")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getProducts(
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "search", required = false) String search) {
        List<ProductDto> products = productService.getProducts(category, search);
        return ResponseEntity.ok(ApiResponse.success(products, "Products retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductDto>> addProduct(@RequestBody ProductDto productDto) {
        return ResponseEntity.ok(ApiResponse.success(productService.addProduct(productDto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(@PathVariable Long id, @RequestBody ProductDto productDto) {
        return ResponseEntity.ok(ApiResponse.success(productService.updateProduct(id, productDto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Product deleted successfully"));
    }
}
