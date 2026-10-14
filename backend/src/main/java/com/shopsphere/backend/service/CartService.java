package com.shopsphere.backend.service;
import com.shopsphere.backend.entity.Cart;
public interface CartService {
    Cart getCartByUserId(Long userId);
    Cart addItemToCart(Long userId, Long productId, int quantity);
    Cart removeItemFromCart(Long userId, Long productId);
    void clearCart(Long userId);
}
