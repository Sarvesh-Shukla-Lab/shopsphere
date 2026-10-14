package com.shopsphere.backend.service;

import com.shopsphere.backend.dto.ContactMessageRequest;

public interface ContactService {
    void saveContactMessage(ContactMessageRequest request);
}
