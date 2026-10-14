package com.shopsphere.backend.service.impl;

import com.shopsphere.backend.entity.Cart;
import com.shopsphere.backend.entity.CartItem;
import com.shopsphere.backend.entity.Product;
import com.shopsphere.backend.exception.ResourceNotFoundException;
import com.shopsphere.backend.repository.CartRepository;
import com.shopsphere.backend.repository.ProductRepository;
import com.shopsphere.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    @Override
    public Cart getCartByUserId(Long userId) {
        return cartRepository.findById(userId).orElse(new Cart());
    }

    @Override
    @Transactional
    public Cart addItemToCart(Long userId, Long productId, int quantity) {
        Cart cart = getCartByUserId(userId);
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        CartItem item = new CartItem();
        item.setProduct(product);
        item.setQuantity(quantity);
        item.setCart(cart);
        item.setPrice(product.getPrice());
        
        cart.getItems().add(item);
        return cartRepository.save(cart);
    }

    @Override
    @Transactional
    public Cart removeItemFromCart(Long userId, Long productId) {
        Cart cart = getCartByUserId(userId);
        cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));
        return cartRepository.save(cart);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getCartByUserId(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }
}
