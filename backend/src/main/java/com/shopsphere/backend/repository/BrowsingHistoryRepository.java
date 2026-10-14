package com.shopsphere.backend.repository;

import com.shopsphere.backend.entity.BrowsingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrowsingHistoryRepository extends JpaRepository<BrowsingHistory, Long> {
    List<BrowsingHistory> findByUserIdOrderByViewedAtDesc(Long userId);
}
