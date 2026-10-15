package com.shopsphere.backend.concurrency;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * Asynchronous Notification Service.
 * Demonstrates:
 * 1. Multithreading in Java Web Applications.
 * 2. Background thread execution using worker threads from ThreadPoolTaskExecutor.
 * 3. CompletableFuture for non-blocking asynchronous results.
 */
@Service
public class AsyncNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(AsyncNotificationService.class);

    /**
     * Sends an order confirmation notification in a separate background worker thread.
     * The client receives an immediate response while this task runs asynchronously.
     *
     * @param recipientEmail The recipient's email address
     * @param orderReference The order reference code
     * @param orderTotal     The total transaction amount
     * @return CompletableFuture representing asynchronous completion
     */
    @Async("taskExecutor")
    public CompletableFuture<Boolean> sendOrderConfirmationAsync(String recipientEmail, String orderReference, Double orderTotal) {
        String threadName = Thread.currentThread().getName();
        long threadId = Thread.currentThread().getId();

        logger.info("[ASYNC WORKER] Starting order email task on Thread [{}] (ID: {}) for Order [{}]",
                threadName, threadId, orderReference);

        try {
            // Simulate brief email transmission latency without blocking main web request
            Thread.sleep(500);
            logger.info("[ASYNC WORKER] Successfully dispatched order notification email to {} for amount ₹{}",
                    recipientEmail, orderTotal);
            return CompletableFuture.completedFuture(true);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.error("[ASYNC WORKER] Notification thread interrupted: {}", e.getMessage());
            return CompletableFuture.completedFuture(false);
        }
    }
}
