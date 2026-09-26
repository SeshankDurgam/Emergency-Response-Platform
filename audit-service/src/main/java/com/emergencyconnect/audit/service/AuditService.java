/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.audit.service;

import com.emergencyconnect.audit.model.AuditLog;
import com.emergencyconnect.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public Page<AuditLog> getLogs(String eventType, Instant from, Instant to, Pageable pageable) {
        return auditLogRepository.findFiltered(eventType, from, to, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getLogsByIncident(UUID incidentId, Pageable pageable) {
        return auditLogRepository.findByIncidentId(incidentId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getLogsByUser(UUID userId, Pageable pageable) {
        return auditLogRepository.findByActorId(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getDashboardSummary() {
        return Map.of(
                "incidentsCreated", auditLogRepository.countByEventType("INCIDENT_CREATED"),
                "incidentsUpdated", auditLogRepository.countByEventType("INCIDENT_UPDATED"),
                "resourcesAssigned", auditLogRepository.countByEventType("RESOURCE_ASSIGNED"),
                "resourcesReleased", auditLogRepository.countByEventType("RESOURCE_RELEASED"),
                "authEvents", auditLogRepository.countByEventType("AUTH_EVENT")
        );
    }
}
