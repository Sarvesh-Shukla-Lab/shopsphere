package com.shopsphere.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String avatar;
    private String role;
    private boolean active;
    private LocalDateTime createdAt;
}
