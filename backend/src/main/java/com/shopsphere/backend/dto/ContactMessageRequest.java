package com.shopsphere.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactMessageRequest {

    @NotBlank(message = "Your name is required")
    private String name;

    @NotBlank(message = "Email address is required")
    @Email(message = "Invalid email address format")
    private String email;

    private String subject;

    @NotBlank(message = "Message content is required")
    private String message;
}
