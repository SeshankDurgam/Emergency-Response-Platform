/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.incident.service;

import com.emergencyconnect.incident.dto.*;
import com.emergencyconnect.incident.kafka.IncidentEventProducer;
import com.emergencyconnect.incident.model.*;
import com.emergencyconnect.incident.repository.IncidentRepository;
import com.emergencyconnect.incident.repository.IncidentStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final IncidentStatusHistoryRepository historyRepository;
    private final IncidentEventProducer eventProducer;

    @Transactional
    @CacheEvict(value = "incidents", allEntries = true)
    public IncidentResponse createIncident(CreateIncidentRequest req, UUID reportedBy) {
        Incident incident = Incident.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .type(req.getType())
                .severity(req.getSeverity())
                .status(IncidentStatus.OPEN)
                .locationLatitude(req.getLocationLatitude())
                .locationLongitude(req.getLocationLongitude())
                .locationAddress(req.getLocationAddress())
                .emirate(req.getEmirate())
                .reportedBy(reportedBy)
                .build();

        incident = incidentRepository.save(incident);
        IncidentResponse response = toResponse(incident);
        eventProducer.publishCreated(response);
        return response;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "incidents", key = "'active'")
    public List<IncidentResponse> getActiveIncidents() {
        return incidentRepository.findActiveIncidents()
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "incidents", key = "#id.toString()")
    public IncidentResponse getIncident(UUID id) {
        return incidentRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found: " + id));
    }

    @Transactional(readOnly = true)
    public Page<IncidentResponse> listIncidents(IncidentStatus status, String emirate,
                                                IncidentSeverity severity, Pageable pageable) {
        if (status != null && emirate != null) {
            return incidentRepository.findByStatusAndEmirate(status, emirate, pageable).map(this::toResponse);
        }
        if (status != null && severity != null) {
            return incidentRepository.findByStatusAndSeverity(status, severity, pageable).map(this::toResponse);
        }
        if (status != null) {
            return incidentRepository.findByStatus(status, pageable).map(this::toResponse);
        }
        if (emirate != null) {
            return incidentRepository.findByEmirate(emirate, pageable).map(this::toResponse);
        }
        return incidentRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    @CacheEvict(value = "incidents", allEntries = true)
    public IncidentResponse updateStatus(UUID id, UpdateStatusRequest req, UUID changedBy) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found: " + id));

        validateStatusTransition(incident.getStatus(), req.getNewStatus());

        IncidentStatus oldStatus = incident.getStatus();
        incident.setStatus(req.getNewStatus());
        incident.setUpdatedAt(Instant.now());

        if (req.getNewStatus() == IncidentStatus.RESOLVED) {
            incident.setResolvedAt(Instant.now());
        }

        incident = incidentRepository.save(incident);

        historyRepository.save(IncidentStatusHistory.builder()
                .incidentId(incident.getId())
                .oldStatus(oldStatus)
                .newStatus(req.getNewStatus())
                .changedBy(changedBy)
                .changeReason(req.getReason())
                .build());

        IncidentResponse response = toResponse(incident);
        eventProducer.publishUpdated(response);
        return response;
    }

    @Transactional
    @CacheEvict(value = "incidents", allEntries = true)
    public void cancelIncident(UUID id, UUID cancelledBy) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found: " + id));

        if (incident.getStatus() == IncidentStatus.RESOLVED) {
            throw new IllegalStateException("Cannot cancel a resolved incident");
        }

        IncidentStatus old = incident.getStatus();
        incident.setStatus(IncidentStatus.CANCELLED);
        incident.setUpdatedAt(Instant.now());
        incidentRepository.save(incident);

        historyRepository.save(IncidentStatusHistory.builder()
                .incidentId(id)
                .oldStatus(old)
                .newStatus(IncidentStatus.CANCELLED)
                .changedBy(cancelledBy)
                .changeReason("Cancelled by user")
                .build());

        eventProducer.publishUpdated(toResponse(incident));
    }

    @Transactional(readOnly = true)
    public Page<IncidentStatusHistory> getHistory(UUID incidentId, Pageable pageable) {
        return historyRepository.findByIncidentId(incidentId, pageable);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "incidents", key = "'dashboard'")
    public DashboardSummaryDTO getDashboardSummary() {
        return DashboardSummaryDTO.builder()
                .totalOpen(incidentRepository.countByStatus(IncidentStatus.OPEN))
                .totalInProgress(incidentRepository.countByStatus(IncidentStatus.IN_PROGRESS))
                .totalResolved(incidentRepository.countByStatus(IncidentStatus.RESOLVED))
                .totalCritical(incidentRepository.findBySeverity(IncidentSeverity.CRITICAL, Pageable.unpaged()).getTotalElements())
                .totalHigh(incidentRepository.findBySeverity(IncidentSeverity.HIGH, Pageable.unpaged()).getTotalElements())
                .totalMedium(incidentRepository.findBySeverity(IncidentSeverity.MEDIUM, Pageable.unpaged()).getTotalElements())
                .totalLow(incidentRepository.findBySeverity(IncidentSeverity.LOW, Pageable.unpaged()).getTotalElements())
                .build();
    }

    private void validateStatusTransition(IncidentStatus current, IncidentStatus next) {
        boolean valid = switch (current) {
            case OPEN -> next == IncidentStatus.IN_PROGRESS || next == IncidentStatus.CANCELLED;
            case IN_PROGRESS -> next == IncidentStatus.RESOLVED || next == IncidentStatus.CANCELLED;
            case RESOLVED, CANCELLED -> false;
        };
        if (!valid) {
            throw new IllegalStateException("Invalid status transition: " + current + " -> " + next);
        }
    }

    private IncidentResponse toResponse(Incident i) {
        return IncidentResponse.builder()
                .id(i.getId())
                .title(i.getTitle())
                .description(i.getDescription())
                .type(i.getType())
                .severity(i.getSeverity())
                .status(i.getStatus())
                .locationLatitude(i.getLocationLatitude())
                .locationLongitude(i.getLocationLongitude())
                .locationAddress(i.getLocationAddress())
                .emirate(i.getEmirate())
                .reportedBy(i.getReportedBy())
                .assignedDispatcher(i.getAssignedDispatcher())
                .createdAt(i.getCreatedAt())
                .updatedAt(i.getUpdatedAt())
                .resolvedAt(i.getResolvedAt())
                .build();
    }
}
