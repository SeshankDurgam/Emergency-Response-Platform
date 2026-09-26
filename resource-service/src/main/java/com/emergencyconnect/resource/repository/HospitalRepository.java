/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.resource.repository;

import com.emergencyconnect.resource.model.Hospital;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HospitalRepository extends JpaRepository<Hospital, UUID> {
    Page<Hospital> findByEmirate(String emirate, Pageable pageable);
    List<Hospital> findByEmirateAndActiveTrue(String emirate);
}
