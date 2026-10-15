package com.shopsphere.backend.concurrency;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Thread-Safe Inventory Manager.
 *
 * Explicitly demonstrates:
 * 1. Java Multithreading & Synchronization.
 * 2. Critical Section protection using the 'synchronized' keyword.
 * 3. Race condition prevention during high-concurrency flash sales.
 * 4. ConcurrentHashMap and ReentrantLock for thread-safe operations.
 */
@Component
public class ThreadSafeInventoryManager {

    private static final Logger logger = LoggerFactory.getLogger(ThreadSafeInventoryManager.class);

    // Thread-safe map storing product stock in memory
    private final ConcurrentHashMap<Long, Integer> stockCache = new ConcurrentHashMap<>();

    // ReentrantLock for fine-grained explicit synchronization
    private final ReentrantLock lock = new ReentrantLock();

    /**
     * Synchronized method to reserve product stock safely across concurrent threads.
     * Prevents race conditions where two simultaneous orders deplete the same inventory.
     *
     * @param productId The product ID
     * @param quantity  The quantity to deduct
     * @return true if stock was successfully reserved; false if stock was insufficient
     */
    public synchronized boolean reserveStockSynchronized(Long productId, int quantity) {
        int currentStock = stockCache.getOrDefault(productId, 100);

        logger.debug("[SYNCHRONIZED] Thread [{}] attempting to reserve {} units for Product [{}] (Current stock: {})",
                Thread.currentThread().getName(), quantity, productId, currentStock);

        if (currentStock >= quantity) {
            stockCache.put(productId, currentStock - quantity);
            logger.info("[SYNCHRONIZED SUCCESS] Reserved {} units of Product [{}]. Remaining stock: {}",
                    quantity, productId, stockCache.get(productId));
            return true;
        } else {
            logger.warn("[SYNCHRONIZED FAILED] Insufficient stock for Product [{}]. Requested: {}, Available: {}",
                    productId, quantity, currentStock);
            return false;
        }
    }

    /**
     * Alternative thread-safe method using explicit ReentrantLock.
     * Demonstrates advanced synchronization techniques in Java.
     *
     * @param productId The product ID
     * @param quantity  The quantity to restore
     */
    public void releaseStockWithLock(Long productId, int quantity) {
        lock.lock();
        try {
            int currentStock = stockCache.getOrDefault(productId, 0);
            stockCache.put(productId, currentStock + quantity);
            logger.info("[LOCK RELEASED] Restored {} units for Product [{}]. New stock: {}",
                    quantity, productId, stockCache.get(productId));
        } finally {
            lock.unlock(); // Ensure lock is always released even if an exception occurs
        }
    }

    /**
     * Retrieve current cached stock in a thread-safe manner.
     */
    public int getStock(Long productId) {
        return stockCache.getOrDefault(productId, 100);
    }

    /**
     * Set stock for a product.
     */
    public void setStock(Long productId, int quantity) {
        stockCache.put(productId, quantity);
    }
}
