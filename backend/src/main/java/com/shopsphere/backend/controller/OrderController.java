package com.shopsphere.backend.controller;

import com.shopsphere.backend.entity.Order;
import com.shopsphere.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // OOP Encapsulation of API endpoints
public class OrderController {
    
    private final OrderService orderService;

    @PostMapping("/create")
    public ResponseEntity<Order> createOrder(@RequestParam Long userId, @RequestParam Long addressId, @RequestParam String paymentMethod) {
        Order newOrder = orderService.createOrder(userId, addressId, paymentMethod);
        return ResponseEntity.ok(newOrder);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getUserOrders(userId));
    }
}
