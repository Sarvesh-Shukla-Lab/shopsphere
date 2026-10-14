package com.shopsphere.backend.service;

import com.shopsphere.backend.entity.Order;
import java.util.List;

public interface OrderService {
    Order createOrder(Long userId, Long addressId, String paymentMethod);
    Order getOrderById(Long orderId);
    List<Order> getUserOrders(Long userId);
    List<Order> getAllOrders();
    Order updateOrderStatus(Long orderId, String status);
    void cancelOrder(Long orderId);
}
