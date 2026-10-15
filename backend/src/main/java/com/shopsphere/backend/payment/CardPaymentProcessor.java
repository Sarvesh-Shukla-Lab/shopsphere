package com.shopsphere.backend.payment;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Card Payment Processor (Credit/Debit Card).
 * Demonstrates:
 * - OOP Inheritance (extends BasePaymentProcessor)
 * - OOP Polymorphism (overrides processPayment specifically for Card gateway)
 */
@Component
public class CardPaymentProcessor extends BasePaymentProcessor {

    @Override
    public PaymentResponse processPayment(double amount, String orderReference) {
        validateAmount(amount);
        logger.info("Processing CARD payment of ₹{} for Order [{}]", amount, orderReference);

        String txnId = generateTransactionId("TXN-CARD");

        return PaymentResponse.builder()
                .success(true)
                .transactionId(txnId)
                .paymentMethod(PaymentMethod.CREDIT_CARD)
                .amount(amount)
                .status("COMPLETED")
                .message("Card payment authorized successfully via 3D Secure")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public PaymentMethod getSupportedMethod() {
        return PaymentMethod.CREDIT_CARD;
    }
}
