/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.incident.dto;

import com.emergencyconnect.incident.model.IncidentSeverity;
import com.emergencyconnect.incident.model.IncidentStatus;
import com.emergencyconnect.incident.model.IncidentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentResponse implements Serializable {
    private UUID id;
    private String title;
    private String description;
    private IncidentType type;
    private IncidentSeverity severity;
    private IncidentStatus status;
    private BigDecimal locationLatitude;
    private BigDecimal locationLongitude;
    private String locationAddress;
    private String emirate;
    private UUID reportedBy;
    private UUID assignedDispatcher;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant resolvedAt;
}
