package com.shopsphere.backend.controller;

import com.shopsphere.backend.entity.Wishlist;
import com.shopsphere.backend.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WishlistController {
    
    private final WishlistService wishlistService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Wishlist>> getWishlist(@PathVariable Long userId) {
        return ResponseEntity.ok(wishlistService.getWishlistByUserId(userId));
    }

    @PostMapping("/{userId}/add/{productId}")
    public ResponseEntity<Wishlist> addToWishlist(@PathVariable Long userId, @PathVariable Long productId) {
        return ResponseEntity.ok(wishlistService.addProductToWishlist(userId, productId));
    }

    @DeleteMapping("/{userId}/remove/{productId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long userId, @PathVariable Long productId) {
        wishlistService.removeProductFromWishlist(userId, productId);
        return ResponseEntity.ok().build();
    }
}
