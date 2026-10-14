package com.shopsphere.backend.controller;

import com.shopsphere.backend.dto.*;
import com.shopsphere.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication API", description = "Endpoints for User Registration, Login, Profile and Password Management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register new account", description = "Register a new BUYER or SELLER user account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(ApiResponse.success(response, "Account created successfully!"), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "User Login", description = "Authenticate user credentials and generate JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Logged in successfully!"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get Current User Profile", description = "Fetch details of logged in user using JWT token")
    public ResponseEntity<ApiResponse<UserProfileDto>> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        UserProfileDto profile = authService.getCurrentUserProfile(email);
        return ResponseEntity.ok(ApiResponse.success(profile, "User profile retrieved successfully"));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update User Profile", description = "Update full name and phone number of logged in user")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        String email = authentication.getName();
        UserProfileDto updatedProfile = authService.updateProfile(email, request);
        return ResponseEntity.ok(ApiResponse.success(updatedProfile, "Profile updated successfully"));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Change Password", description = "Change password for logged in user")
    public ResponseEntity<ApiResponse<String>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        String email = authentication.getName();
        authService.changePassword(email, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", "Password changed successfully"));
    }
}
