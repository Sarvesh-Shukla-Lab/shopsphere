package com.shopsphere.backend.exception;

/**
 * Thrown when an invalid argument or malformed business request is received.
 */
public class BadRequestException extends ShopSphereException {

    public BadRequestException(String message) {
        super(message, "BAD_REQUEST");
    }

    public BadRequestException(String message, String errorCode) {
        super(message, errorCode);
    }
}
