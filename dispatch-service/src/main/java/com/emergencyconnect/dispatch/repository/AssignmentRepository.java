/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.dispatch.repository;

import com.emergencyconnect.dispatch.model.Assignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {
    Page<Assignment> findByIncidentId(UUID incidentId, Pageable pageable);
    Page<Assignment> findByUnitId(UUID unitId, Pageable pageable);
}
