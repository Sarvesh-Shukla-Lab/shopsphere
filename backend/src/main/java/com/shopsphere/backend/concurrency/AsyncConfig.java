package com.shopsphere.backend.concurrency;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Multithreading & Asynchronous Execution Configuration.
 * Demonstrates:
 * 1. Thread Pool Management (CorePoolSize, MaxPoolSize, QueueCapacity)
 * 2. Asynchronous task execution without blocking main HTTP request threads
 * 3. Thread naming for monitoring and debugging
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("ShopSphere-Worker-");
        executor.initialize();
        return executor;
    }
}
