/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.incident.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "incident_status_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "incident_id", nullable = false)
    private UUID incidentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", length = 20)
    private IncidentStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 20)
    private IncidentStatus newStatus;

    @Column(name = "changed_by", nullable = false)
    private UUID changedBy;

    @Column(name = "change_reason", length = 500)
    private String changeReason;

    @Column(name = "changed_at")
    @Builder.Default
    private Instant changedAt = Instant.now();
}
