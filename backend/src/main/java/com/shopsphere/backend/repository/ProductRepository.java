package com.shopsphere.backend.repository;

import com.shopsphere.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrue();
    List<Product> findByCategoryIdAndActiveTrue(Long categoryId);
    List<Product> findByCategorySlugAndActiveTrue(String slug);
    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String name);
    List<Product> findByCategorySlugAndNameContainingIgnoreCaseAndActiveTrue(String slug, String name);
    List<Product> findBySellerId(Long sellerId);
    long countByCategoryIdAndActiveTrue(Long categoryId);
}
