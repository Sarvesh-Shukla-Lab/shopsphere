package com.shopsphere.backend.exception;

/**
 * Thrown when attempting to register a resource that already exists (e.g., duplicate email).
 */
public class DuplicateResourceException extends ShopSphereException {

    public DuplicateResourceException(String message) {
        super(message, "DUPLICATE_RESOURCE");
    }
}
