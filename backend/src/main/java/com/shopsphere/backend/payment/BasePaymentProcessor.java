package com.shopsphere.backend.payment;

import com.shopsphere.backend.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.UUID;

/**
 * Abstract Base Payment Processor.
 * Demonstrates:
 * 1. OOP Inheritance: Child classes inherit common fields, logging, and validations.
 * 2. Encapsulation & Code Reuse.
 */
public abstract class BasePaymentProcessor implements PaymentProcessor {

    protected final Logger logger = LoggerFactory.getLogger(getClass());

    /**
     * Validates that the payment amount is strictly positive.
     * Common inherited validation method.
     */
    protected void validateAmount(double amount) {
        if (amount <= 0.0) {
            throw new BadRequestException("Payment amount must be strictly greater than 0");
        }
    }

    /**
     * Generates a unique secure transaction ID.
     */
    protected String generateTransactionId(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
