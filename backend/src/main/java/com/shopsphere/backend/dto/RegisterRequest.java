package com.shopsphere.backend.dto;

import com.shopsphere.backend.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    private String name;

    @NotBlank(message = "Email address is required")
    @Email(message = "Invalid email address format")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d).{8,}$", message = "Password must be at least 8 characters long, with at least 1 uppercase letter and 1 number")
    private String password;

    private String phone;

    @NotNull(message = "Account role is required (BUYER or SELLER)")
    private Role role;
}
