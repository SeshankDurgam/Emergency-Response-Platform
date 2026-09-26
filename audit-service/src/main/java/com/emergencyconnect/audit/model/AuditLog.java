/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.audit.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_event_type", columnList = "event_type"),
    @Index(name = "idx_audit_incident_id", columnList = "incident_id"),
    @Index(name = "idx_audit_actor_id", columnList = "actor_id"),
    @Index(name = "idx_audit_occurred_at", columnList = "occurred_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    private UUID id;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(name = "incident_id")
    private UUID incidentId;

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(name = "entity_type", length = 50)
    private String entityType;

    @Column(name = "entity_id")
    private UUID entityId;

    @Column(columnDefinition = "TEXT")
    private String payload;

    @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING)
    @Column(name = "occurred_at", nullable = false)
    @Builder.Default
    private Instant occurredAt = Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS);

    @Column(name = "previous_hash", length = 64)
    private String previousHash;

    @Column(name = "entry_hash", length = 64)
    private String entryHash;
}
