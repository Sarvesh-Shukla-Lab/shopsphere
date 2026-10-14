package com.shopsphere.backend.service.impl;

import com.shopsphere.backend.dto.CategoryDto;
import com.shopsphere.backend.entity.Category;
import com.shopsphere.backend.repository.CategoryRepository;
import com.shopsphere.backend.repository.ProductRepository;
import com.shopsphere.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private CategoryDto convertToDto(Category category) {
        long count = productRepository.countByCategoryIdAndActiveTrue(category.getId());
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .icon(category.getIcon())
                .productCount(count)
                .build();
    }
}
