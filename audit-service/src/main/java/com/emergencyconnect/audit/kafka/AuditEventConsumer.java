/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.audit.kafka;

import com.emergencyconnect.audit.model.AuditLog;
import com.emergencyconnect.audit.repository.AuditLogRepository;
import com.emergencyconnect.audit.service.ChainHashService;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuditEventConsumer {

    private final AuditLogRepository auditLogRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ChainHashService chainHashService;
    private final MeterRegistry meterRegistry;

    @KafkaListener(topics = "incident.created", groupId = "audit-service")
    public void onIncidentCreated(String message) {
        persist("INCIDENT_CREATED", message);
        broadcast("INCIDENT_CREATED", message);
    }

    @KafkaListener(topics = "incident.updated", groupId = "audit-service")
    public void onIncidentUpdated(String message) {
        persist("INCIDENT_UPDATED", message);
        broadcast("INCIDENT_UPDATED", message);
    }

    @KafkaListener(topics = "resource.assigned", groupId = "audit-service")
    public void onResourceAssigned(String message) {
        persist("RESOURCE_ASSIGNED", message);
        broadcast("RESOURCE_ASSIGNED", message);
    }

    @KafkaListener(topics = "resource.released", groupId = "audit-service")
    public void onResourceReleased(String message) {
        persist("RESOURCE_RELEASED", message);
        broadcast("RESOURCE_RELEASED", message);
    }

    @KafkaListener(topics = "auth.event", groupId = "audit-service")
    public void onAuthEvent(String message) {
        persist("AUTH_EVENT", message);
    }

    private synchronized void persist(String eventType, String payload) {
        meterRegistry.counter("ec_audit_events_consumed_total", "event_type", eventType).increment();
        try {
            String prevHash = auditLogRepository.findTopByOrderByOccurredAtDesc()
                    .map(AuditLog::getEntryHash)
                    .orElse(ChainHashService.GENESIS_HASH);

            AuditLog entry = AuditLog.builder()
                    .id(java.util.UUID.randomUUID())
                    .eventType(eventType)
                    .payload(payload)
                    .occurredAt(Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS))
                    .previousHash(prevHash)
                    .build();

            String entryHash = chainHashService.computeEntryHash(entry);
            entry.setEntryHash(entryHash);

            auditLogRepository.save(entry);
            log.debug("Audit entry persisted with hash={} prev={}", entryHash.substring(0, 8), prevHash.substring(0, 8));
        } catch (Exception e) {
            log.error("Failed to persist audit log for event type={}", eventType, e);
        }
    }

    private void broadcast(String eventType, String payload) {
        try {
            messagingTemplate.convertAndSend("/topic/dashboard",
                    Map.of("eventType", eventType, "payload", payload));
        } catch (Exception e) {
            log.error("Failed to broadcast WebSocket update for eventType={}", eventType, e);
        }
    }
}
