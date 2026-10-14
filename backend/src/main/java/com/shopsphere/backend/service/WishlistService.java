package com.shopsphere.backend.service;
import com.shopsphere.backend.entity.Wishlist;
import java.util.List;
public interface WishlistService {
    List<Wishlist> getWishlistByUserId(Long userId);
    Wishlist addProductToWishlist(Long userId, Long productId);
    void removeProductFromWishlist(Long userId, Long productId);
}
