package com.shopsphere.backend.dao;

import com.shopsphere.backend.config.DatabaseConnection;
import com.shopsphere.backend.entity.Product;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Product Data Access Object (DAO) Implementation.
 *
 * Implements pure JDBC database operations using:
 * - java.sql.Connection
 * - java.sql.PreparedStatement (prevents SQL injection)
 * - java.sql.ResultSet
 * - Resource management via try-with-resources
 */
@Repository
public class ProductDaoImpl implements ProductDao {

    private static final Logger logger = LoggerFactory.getLogger(ProductDaoImpl.class);

    @Override
    public Optional<Product> findById(Long id) {
        String sql = "SELECT id, name, description, price, old_price, image, rating, review_count, active, created_at " +
                     "FROM products WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToProduct(rs));
                }
            }
        } catch (SQLException e) {
            logger.error("JDBC Error in findById for product ID {}: {}", id, e.getMessage());
        }
        return Optional.empty();
    }

    @Override
    public List<Product> findAll() {
        List<Product> products = new ArrayList<>();
        String sql = "SELECT id, name, description, price, old_price, image, rating, review_count, active, created_at " +
                     "FROM products WHERE active = 1 ORDER BY id DESC LIMIT 50";

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                products.add(mapResultSetToProduct(rs));
            }
        } catch (SQLException e) {
            logger.error("JDBC Error in findAll: {}", e.getMessage());
        }
        return products;
    }

    @Override
    public long count() {
        String sql = "SELECT COUNT(*) FROM products";

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            if (rs.next()) {
                return rs.getLong(1);
            }
        } catch (SQLException e) {
            logger.error("JDBC Error in count(): {}", e.getMessage());
        }
        return 0L;
    }

    @Override
    public List<Product> findByPriceRange(double minPrice, double maxPrice) {
        List<Product> products = new ArrayList<>();
        String sql = "SELECT id, name, description, price, old_price, image, rating, review_count, active, created_at " +
                     "FROM products WHERE price BETWEEN ? AND ? AND active = 1 ORDER BY price ASC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setBigDecimal(1, BigDecimal.valueOf(minPrice));
            stmt.setBigDecimal(2, BigDecimal.valueOf(maxPrice));

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    products.add(mapResultSetToProduct(rs));
                }
            }
        } catch (SQLException e) {
            logger.error("JDBC Error in findByPriceRange: {}", e.getMessage());
        }
        return products;
    }

    @Override
    public boolean updateRatingJdbc(Long productId, double newRating, int reviewCount) {
        String sql = "UPDATE products SET rating = ?, review_count = ?, updated_at = NOW() WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setDouble(1, newRating);
            stmt.setInt(2, reviewCount);
            stmt.setLong(3, productId);

            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            logger.error("JDBC Error in updateRatingJdbc: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Maps a single JDBC ResultSet row into a Product entity instance.
     */
    private Product mapResultSetToProduct(ResultSet rs) throws SQLException {
        Product product = new Product();
        product.setId(rs.getLong("id"));
        product.setName(rs.getString("name"));
        product.setDescription(rs.getString("description"));
        product.setPrice(rs.getBigDecimal("price"));
        product.setOldPrice(rs.getBigDecimal("old_price"));
        product.setImage(rs.getString("image"));
        product.setRating(rs.getDouble("rating"));
        product.setReviewCount(rs.getInt("review_count"));
        product.setActive(rs.getBoolean("active"));
        return product;
    }
}
