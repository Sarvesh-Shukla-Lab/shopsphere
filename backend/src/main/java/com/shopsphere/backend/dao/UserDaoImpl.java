package com.shopsphere.backend.dao;

import com.shopsphere.backend.config.DatabaseConnection;
import com.shopsphere.backend.entity.Role;
import com.shopsphere.backend.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * User Data Access Object (DAO) Implementation.
 *
 * Implements pure JDBC database operations on the 'users' table using:
 * - java.sql.Connection
 * - java.sql.PreparedStatement
 * - java.sql.ResultSet
 */
@Repository
public class UserDaoImpl implements UserDao {

    private static final Logger logger = LoggerFactory.getLogger(UserDaoImpl.class);

    @Override
    public Optional<User> findById(Long id) {
        String sql = "SELECT id, name, email, password, phone, avatar, role, active, created_at FROM users WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToUser(rs));
                }
            }
        } catch (SQLException e) {
            logger.error("JDBC Error in UserDao findById: {}", e.getMessage());
        }
        return Optional.empty();
    }

    @Override
    public List<User> findAll() {
        List<User> users = new ArrayList<>();
        String sql = "SELECT id, name, email, password, phone, avatar, role, active, created_at FROM users ORDER BY id DESC LIMIT 50";

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                users.add(mapResultSetToUser(rs));
            }
        } catch (SQLException e) {
            logger.error("JDBC Error in UserDao findAll: {}", e.getMessage());
        }
        return users;
    }

    @Override
    public long count() {
        String sql = "SELECT COUNT(*) FROM users";

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            if (rs.next()) {
                return rs.getLong(1);
            }
        } catch (SQLException e) {
            logger.error("JDBC Error in UserDao count: {}", e.getMessage());
        }
        return 0L;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        String sql = "SELECT id, name, email, password, phone, avatar, role, active, created_at FROM users WHERE email = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToUser(rs));
                }
            }
        } catch (SQLException e) {
            logger.error("JDBC Error in UserDao findByEmail: {}", e.getMessage());
        }
        return Optional.empty();
    }

    @Override
    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE email = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        } catch (SQLException e) {
            logger.error("JDBC Error in UserDao existsByEmail: {}", e.getMessage());
        }
        return false;
    }

    private User mapResultSetToUser(ResultSet rs) throws SQLException {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setName(rs.getString("name"));
        user.setEmail(rs.getString("email"));
        user.setPassword(rs.getString("password"));
        user.setPhone(rs.getString("phone"));
        user.setAvatar(rs.getString("avatar"));
        String roleStr = rs.getString("role");
        if (roleStr != null) {
            try {
                user.setRole(Role.valueOf(roleStr));
            } catch (IllegalArgumentException ignored) {
                user.setRole(Role.BUYER);
            }
        }
        user.setActive(rs.getBoolean("active"));
        return user;
    }
}
