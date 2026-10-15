package com.shopsphere.backend.exception;

/**
 * Base custom runtime exception for ShopSphere platform.
 * Demonstrates OOP Inheritance and structured exception hierarchies.
 */
public abstract class ShopSphereException extends RuntimeException {

    private final String errorCode;

    public ShopSphereException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public ShopSphereException(String message, Throwable cause, String errorCode) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
