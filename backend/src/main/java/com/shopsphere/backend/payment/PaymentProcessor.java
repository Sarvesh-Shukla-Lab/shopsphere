package com.shopsphere.backend.payment;

/**
 * Payment Processor Contract (Interface).
 * Demonstrates:
 * 1. Interface definition for behavioral polymorphism.
 * 2. Separation of concerns.
 */
public interface PaymentProcessor {

    /**
     * Process payment polymorphically based on the selected method.
     *
     * @param amount The transaction amount
     * @param orderReference Unique order reference code
     * @return PaymentResponse containing status and transaction ID
     */
    PaymentResponse processPayment(double amount, String orderReference);

    /**
     * Returns the payment method supported by this processor.
     *
     * @return PaymentMethod enum
     */
    PaymentMethod getSupportedMethod();
}
