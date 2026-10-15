package com.shopsphere.backend.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standard Payment Response DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private boolean success;
    private String transactionId;
    private PaymentMethod paymentMethod;
    private double amount;
    private String status;
    private String message;
    private LocalDateTime timestamp;
}
