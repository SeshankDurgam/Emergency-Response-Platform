/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.audit.repository;

import com.emergencyconnect.audit.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    Page<AuditLog> findByIncidentId(UUID incidentId, Pageable pageable);

    Page<AuditLog> findByActorId(UUID actorId, Pageable pageable);

    Page<AuditLog> findByEventType(String eventType, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:eventType IS NULL OR a.eventType = :eventType) AND " +
           "(:from IS NULL OR a.occurredAt >= :from) AND " +
           "(:to IS NULL OR a.occurredAt <= :to)")
    Page<AuditLog> findFiltered(String eventType, Instant from, Instant to, Pageable pageable);

    long countByEventType(String eventType);

    Optional<AuditLog> findTopByOrderByOccurredAtDesc();

    Page<AuditLog> findAllByOrderByOccurredAtAsc(Pageable pageable);
}
