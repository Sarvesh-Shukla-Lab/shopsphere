package com.shopsphere.backend.exception;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
    private boolean success;
    private int status;
    private String error;
    private String message;
    private Map<String, String> details;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
