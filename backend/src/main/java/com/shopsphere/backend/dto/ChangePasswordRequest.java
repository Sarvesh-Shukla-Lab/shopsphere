package com.shopsphere.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangePasswordRequest {

    @NotBlank(message = "Current password is required")
    private String oldPassword;

    @NotBlank(message = "New password is required")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d).{8,}$", message = "New password must be at least 8 characters long, with at least 1 uppercase letter and 1 number")
    private String newPassword;
}
