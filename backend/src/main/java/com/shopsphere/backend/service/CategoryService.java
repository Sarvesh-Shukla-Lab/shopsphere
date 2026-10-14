package com.shopsphere.backend.service;

import com.shopsphere.backend.dto.CategoryDto;
import java.util.List;

public interface CategoryService {
    List<CategoryDto> getAllCategories();
}
