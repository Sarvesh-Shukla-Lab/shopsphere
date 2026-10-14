package com.shopsphere.backend.service.impl;

import com.shopsphere.backend.dto.ContactMessageRequest;
import com.shopsphere.backend.entity.ContactMessage;
import com.shopsphere.backend.repository.ContactMessageRepository;
import com.shopsphere.backend.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements ContactService {

    private final ContactMessageRepository contactMessageRepository;

    @Override
    @Transactional
    public void saveContactMessage(ContactMessageRequest request) {
        ContactMessage contactMessage = ContactMessage.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .subject(request.getSubject() != null ? request.getSubject().trim() : null)
                .message(request.getMessage().trim())
                .build();

        contactMessageRepository.save(contactMessage);
    }
}
