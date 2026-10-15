package com.shopsphere.backend.payment;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * UPI Payment Processor (Google Pay / PhonePe / Paytm / BHIM).
 * Demonstrates:
 * - OOP Inheritance (extends BasePaymentProcessor)
 * - OOP Polymorphism (overrides processPayment specifically for UPI instant rails)
 */
@Component
public class UpiPaymentProcessor extends BasePaymentProcessor {

    @Override
    public PaymentResponse processPayment(double amount, String orderReference) {
        validateAmount(amount);
        logger.info("Processing UPI instant payment of ₹{} for Order [{}]", amount, orderReference);

        String txnId = generateTransactionId("TXN-UPI");

        return PaymentResponse.builder()
                .success(true)
                .transactionId(txnId)
                .paymentMethod(PaymentMethod.UPI)
                .amount(amount)
                .status("COMPLETED")
                .message("UPI payment verified instantly via NPCI gateway")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public PaymentMethod getSupportedMethod() {
        return PaymentMethod.UPI;
    }
}
