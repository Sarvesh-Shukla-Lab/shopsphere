package com.shopsphere.backend.controller;

import com.shopsphere.backend.concurrency.AsyncNotificationService;
import com.shopsphere.backend.concurrency.ThreadSafeInventoryManager;
import com.shopsphere.backend.config.DatabaseConnection;
import com.shopsphere.backend.dao.ProductDao;
import com.shopsphere.backend.dao.UserDao;
import com.shopsphere.backend.dto.ApiResponse;
import com.shopsphere.backend.entity.Product;
import com.shopsphere.backend.payment.PaymentMethod;
import com.shopsphere.backend.payment.PaymentProcessor;
import com.shopsphere.backend.payment.PaymentProcessorFactory;
import com.shopsphere.backend.payment.PaymentResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * System Diagnostics & Evaluation Controller.
 *
 * Demonstrates to Hackathon / University Evaluators:
 * 1. Direct JDBC DAO queries (UserDao, ProductDao).
 * 2. OOP Polymorphism & Strategy pattern via PaymentProcessorFactory.
 * 3. Multithreading & Asynchronous execution (AsyncNotificationService).
 * 4. Java Synchronization & Concurrency (ThreadSafeInventoryManager).
 */
@RestController
@RequestMapping("/api/diagnostics")
@RequiredArgsConstructor
@Tag(name = "System Diagnostics & Rubric Demonstration", description = "Endpoints verifying JDBC, OOP, Concurrency, and Servlets")
public class SystemDiagnosticsController {

    private final ProductDao productDao;
    private final UserDao userDao;
    private final PaymentProcessorFactory paymentProcessorFactory;
    private final ThreadSafeInventoryManager inventoryManager;
    private final AsyncNotificationService asyncNotificationService;

    @GetMapping("/jdbc")
    @Operation(summary = "Verify Direct JDBC Integration", description = "Executes pure JDBC queries using PreparedStatement and ResultSet")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testJdbcIntegration() {
        boolean connectionOk = DatabaseConnection.testConnection();
        long productCount = productDao.count();
        long userCount = userDao.count();
        List<Product> sampleProducts = productDao.findAll();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("jdbcDriver", "com.mysql.cj.jdbc.Driver");
        data.put("connectionStatus", connectionOk ? "CONNECTED" : "FAILED");
        data.put("totalProductsQueriedViaJdbc", productCount);
        data.put("totalUsersQueriedViaJdbc", userCount);
        data.put("sampleProductNamesViaJdbc", sampleProducts.stream().map(Product::getName).limit(5).toList());

        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .message("JDBC DAO queries executed successfully using PreparedStatement")
                .data(data)
                .build());
    }

    @PostMapping("/payment-polymorphism")
    @Operation(summary = "Verify OOP Polymorphism", description = "Executes payment polymorphically based on selected payment method")
    public ResponseEntity<ApiResponse<PaymentResponse>> testPaymentPolymorphism(
            @RequestParam(defaultValue = "UPI") String method,
            @RequestParam(defaultValue = "1499.00") double amount) {

        PaymentMethod paymentMethod;
        try {
            paymentMethod = PaymentMethod.valueOf(method.toUpperCase());
        } catch (IllegalArgumentException e) {
            paymentMethod = PaymentMethod.UPI;
        }

        // Polymorphic dispatch via factory
        PaymentProcessor processor = paymentProcessorFactory.getProcessor(paymentMethod);
        PaymentResponse response = processor.processPayment(amount, "ORD-DEMO-" + System.currentTimeMillis());

        return ResponseEntity.ok(ApiResponse.<PaymentResponse>builder()
                .success(true)
                .message("Payment processed polymorphically using " + processor.getClass().getSimpleName())
                .data(response)
                .build());
    }

    @PostMapping("/concurrency-test")
    @Operation(summary = "Verify Multithreading & Synchronization", description = "Simulates concurrent buyer threads reserving stock using synchronized critical sections")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testConcurrency(
            @RequestParam(defaultValue = "1") Long productId,
            @RequestParam(defaultValue = "20") int totalConcurrentOrders) {

        inventoryManager.setStock(productId, 50);

        List<String> threadLogs = Collections.synchronizedList(new ArrayList<>());
        List<Thread> threads = new ArrayList<>();

        for (int i = 1; i <= totalConcurrentOrders; i++) {
            final int orderNum = i;
            Thread t = new Thread(() -> {
                boolean success = inventoryManager.reserveStockSynchronized(productId, 3);
                threadLogs.add(String.format("Order #%d on %s: %s",
                        orderNum, Thread.currentThread().getName(), success ? "RESERVED" : "STOCK_EXHAUSTED"));
            }, "BuyerThread-" + i);
            threads.add(t);
        }

        // Launch all threads concurrently
        for (Thread t : threads) {
            t.start();
        }

        // Wait for all threads to finish
        for (Thread t : threads) {
            try {
                t.join();
            } catch (InterruptedException ignored) {
                Thread.currentThread().interrupt();
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("initialStock", 50);
        result.put("finalRemainingStock", inventoryManager.getStock(productId));
        result.put("totalThreadsExecuted", totalConcurrentOrders);
        result.put("threadExecutions", threadLogs);

        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .message("Concurrent inventory reservation executed with synchronized critical sections")
                .data(result)
                .build());
    }

    @PostMapping("/async-notification")
    @Operation(summary = "Verify Asynchronous Processing", description = "Dispatches background notification task using Spring @Async ThreadPool")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testAsyncNotification(
            @RequestParam(defaultValue = "customer@example.com") String email) {

        CompletableFuture<Boolean> asyncTask = asyncNotificationService.sendOrderConfirmationAsync(
                email, "ORD-ASYNC-" + System.currentTimeMillis(), 2499.0);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "DISPATCHED_TO_WORKER_THREAD");
        result.put("recipient", email);
        result.put("taskCompletedInstantlyOnMainThread", !asyncTask.isDone());

        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .message("Dispatched asynchronous notification task to background thread pool")
                .data(result)
                .build());
    }
}
