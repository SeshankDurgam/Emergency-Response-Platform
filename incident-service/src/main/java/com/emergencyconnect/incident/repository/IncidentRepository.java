/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.incident.repository;

import com.emergencyconnect.incident.model.Incident;
import com.emergencyconnect.incident.model.IncidentSeverity;
import com.emergencyconnect.incident.model.IncidentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface IncidentRepository extends JpaRepository<Incident, UUID> {

    Page<Incident> findByStatus(IncidentStatus status, Pageable pageable);

    Page<Incident> findByEmirate(String emirate, Pageable pageable);

    Page<Incident> findBySeverity(IncidentSeverity severity, Pageable pageable);

    Page<Incident> findByStatusAndEmirate(IncidentStatus status, String emirate, Pageable pageable);

    Page<Incident> findByStatusAndSeverity(IncidentStatus status, IncidentSeverity severity, Pageable pageable);

    @Query("SELECT i FROM Incident i WHERE i.status IN ('OPEN', 'IN_PROGRESS')")
    List<Incident> findActiveIncidents();

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.status = :status")
    long countByStatus(IncidentStatus status);
}
