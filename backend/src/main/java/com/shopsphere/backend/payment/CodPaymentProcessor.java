package com.shopsphere.backend.payment;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Cash On Delivery (COD) Payment Processor.
 * Demonstrates:
 * - OOP Inheritance (extends BasePaymentProcessor)
 * - OOP Polymorphism (overrides processPayment specifically for COD flow)
 */
@Component
public class CodPaymentProcessor extends BasePaymentProcessor {

    @Override
    public PaymentResponse processPayment(double amount, String orderReference) {
        validateAmount(amount);
        logger.info("Initializing Cash on Delivery of ₹{} for Order [{}]", amount, orderReference);

        String txnId = generateTransactionId("TXN-COD");

        return PaymentResponse.builder()
                .success(true)
                .transactionId(txnId)
                .paymentMethod(PaymentMethod.CASH_ON_DELIVERY)
                .amount(amount)
                .status("PENDING_COLLECTION")
                .message("Order placed with Cash on Delivery. Payment to be collected upon doorstep delivery.")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public PaymentMethod getSupportedMethod() {
        return PaymentMethod.CASH_ON_DELIVERY;
    }
}
