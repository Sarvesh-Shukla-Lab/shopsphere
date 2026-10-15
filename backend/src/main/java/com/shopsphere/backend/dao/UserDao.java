package com.shopsphere.backend.dao;

import com.shopsphere.backend.entity.User;
import java.util.Optional;

/**
 * User Data Access Object (DAO) Interface.
 * Defines contract for JDBC-based database operations on the 'users' table.
 */
public interface UserDao extends BaseDao<User, Long> {

    /**
     * Look up a user by email using direct JDBC PreparedStatement query.
     *
     * @param email The user's email address
     * @return Optional containing User if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if an email is already registered via JDBC COUNT query.
     *
     * @param email The email to test
     * @return true if exists, false otherwise
     */
    boolean existsByEmail(String email);
}
