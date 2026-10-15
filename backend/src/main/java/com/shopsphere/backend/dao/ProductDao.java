package com.shopsphere.backend.dao;

import com.shopsphere.backend.entity.Product;
import java.util.List;

/**
 * Product Data Access Object (DAO) Interface.
 * Defines contract for JDBC-based database operations on the 'products' table.
 */
public interface ProductDao extends BaseDao<Product, Long> {

    /**
     * Find active products within a price range via direct JDBC query.
     *
     * @param minPrice Minimum price
     * @param maxPrice Maximum price
     * @return List of matching Product entities
     */
    List<Product> findByPriceRange(double minPrice, double maxPrice);

    /**
     * Update product rating and review count directly using JDBC PreparedStatement.
     *
     * @param productId The ID of the product
     * @param newRating The new average rating
     * @param reviewCount The updated review count
     * @return true if updated successfully, false otherwise
     */
    boolean updateRatingJdbc(Long productId, double newRating, int reviewCount);
}
