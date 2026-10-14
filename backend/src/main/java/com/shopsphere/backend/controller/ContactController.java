package com.shopsphere.backend.controller;

import com.shopsphere.backend.dto.ApiResponse;
import com.shopsphere.backend.dto.ContactMessageRequest;
import com.shopsphere.backend.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@Tag(name = "Contact API", description = "Public endpoint for submitting customer contact messages")
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    @Operation(summary = "Submit contact message", description = "Save customer contact message form")
    public ResponseEntity<ApiResponse<String>> submitContactMessage(@Valid @RequestBody ContactMessageRequest request) {
        contactService.saveContactMessage(request);
        return new ResponseEntity<>(ApiResponse.success("Message sent successfully", "Thank you! Your message has been received."), HttpStatus.CREATED);
    }
}
