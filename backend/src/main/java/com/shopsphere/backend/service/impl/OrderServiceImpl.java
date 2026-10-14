package com.shopsphere.backend.service.impl;

import com.shopsphere.backend.entity.Order;
import com.shopsphere.backend.entity.OrderStatus;
import com.shopsphere.backend.exception.ResourceNotFoundException;
import com.shopsphere.backend.repository.OrderRepository;
import com.shopsphere.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    @Override
    @Transactional
    public Order createOrder(Long userId, Long addressId, String paymentMethod) {
        // OOP Abstraction & Encapsulation
        Order order = new Order();
        order.setOrderNumber("SS-" + System.currentTimeMillis());
        order.setPaymentMethod(paymentMethod);
        order.setStatus(OrderStatus.PENDING);
        // Additional business logic would go here
        return orderRepository.save(order);
    }

    @Override
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
    }

    @Override
    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findAll(); // Simplified for now
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = getOrderById(orderId);
        order.setStatus(OrderStatus.valueOf(status.toUpperCase()));
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = getOrderById(orderId);
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }
}
