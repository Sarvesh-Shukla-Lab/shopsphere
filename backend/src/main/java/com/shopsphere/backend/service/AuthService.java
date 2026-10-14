package com.shopsphere.backend.service;

import com.shopsphere.backend.dto.*;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserProfileDto getCurrentUserProfile(String email);
    UserProfileDto updateProfile(String email, UpdateProfileRequest request);
    void changePassword(String email, ChangePasswordRequest request);
}
