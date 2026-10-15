package com.shopsphere.backend.dao;

import java.util.List;
import java.util.Optional;

/**
 * Generic Base Data Access Object (DAO) Interface.
 * Demonstrates:
 * 1. Interface abstraction
 * 2. Java Generics (<T, ID>)
 * 3. Contract for pure JDBC database operations
 *
 * @param <T>  The domain entity type
 * @param <ID> The primary key identifier type
 */
public interface BaseDao<T, ID> {

    /**
     * Retrieve an entity by its unique identifier via JDBC.
     *
     * @param id The entity ID
     * @return Optional containing the found entity, or empty Optional
     */
    Optional<T> findById(ID id);

    /**
     * Retrieve all entities via JDBC.
     *
     * @return List of entities
     */
    List<T> findAll();

    /**
     * Count total records in the database table via JDBC COUNT(*).
     *
     * @return Total count
     */
    long count();
}
