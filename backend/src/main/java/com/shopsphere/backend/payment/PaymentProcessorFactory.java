package com.shopsphere.backend.payment;

import com.shopsphere.backend.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Payment Processor Factory.
 * Demonstrates:
 * 1. Factory Pattern & Dependency Injection.
 * 2. Java Collections (EnumMap).
 * 3. Runtime Polymorphic Dispatch: Routes request dynamically to the correct PaymentProcessor.
 */
@Component
public class PaymentProcessorFactory {

    private final Map<PaymentMethod, PaymentProcessor> processorMap = new EnumMap<>(PaymentMethod.class);

    public PaymentProcessorFactory(List<PaymentProcessor> processors) {
        for (PaymentProcessor processor : processors) {
            processorMap.put(processor.getSupportedMethod(), processor);
        }
    }

    /**
     * Resolves the polymorphic PaymentProcessor based on payment method.
     *
     * @param method The selected PaymentMethod
     * @return PaymentProcessor implementation
     */
    public PaymentProcessor getProcessor(PaymentMethod method) {
        PaymentProcessor processor = processorMap.get(method);
        if (processor == null) {
            throw new BadRequestException("Unsupported payment method: " + method);
        }
        return processor;
    }
}
