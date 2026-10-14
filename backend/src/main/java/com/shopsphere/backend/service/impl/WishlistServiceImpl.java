package com.shopsphere.backend.service.impl;

import com.shopsphere.backend.entity.Product;
import com.shopsphere.backend.entity.User;
import com.shopsphere.backend.entity.Wishlist;
import com.shopsphere.backend.exception.ResourceNotFoundException;
import com.shopsphere.backend.repository.ProductRepository;
import com.shopsphere.backend.repository.UserRepository;
import com.shopsphere.backend.repository.WishlistRepository;
import com.shopsphere.backend.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public List<Wishlist> getWishlistByUserId(Long userId) {
        return wishlistRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    public Wishlist addProductToWishlist(Long userId, Long productId) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            return wishlistRepository.findByUserId(userId).stream()
                .filter(w -> w.getProduct().getId().equals(productId))
                .findFirst().orElseThrow();
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setProduct(product);
        return wishlistRepository.save(wishlist);
    }

    @Override
    @Transactional
    public void removeProductFromWishlist(Long userId, Long productId) {
        List<Wishlist> wishlists = wishlistRepository.findByUserId(userId);
        wishlists.stream()
            .filter(w -> w.getProduct().getId().equals(productId))
            .findFirst()
            .ifPresent(wishlistRepository::delete);
    }
}
