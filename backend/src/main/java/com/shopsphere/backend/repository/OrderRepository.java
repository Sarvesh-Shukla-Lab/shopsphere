package com.shopsphere.backend.repository;

import com.shopsphere.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByBuyerId(Long buyerId);
    List<Order> findDistinctByItemsProductSellerId(Long sellerId);
}
