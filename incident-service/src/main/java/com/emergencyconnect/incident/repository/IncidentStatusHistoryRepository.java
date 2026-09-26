/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.incident.repository;

import com.emergencyconnect.incident.model.IncidentStatusHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface IncidentStatusHistoryRepository extends JpaRepository<IncidentStatusHistory, Long> {
    Page<IncidentStatusHistory> findByIncidentId(UUID incidentId, Pageable pageable);
}
