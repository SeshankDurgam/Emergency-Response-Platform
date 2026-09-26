/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.resource.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "emergency_units")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "unit_code", unique = true, nullable = false, length = 20)
    private String unitCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private UnitType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private UnitStatus status = UnitStatus.AVAILABLE;

    @Column(name = "home_station", length = 100)
    private String homeStation;

    @Column(name = "current_latitude", precision = 10, scale = 7)
    private BigDecimal currentLatitude;

    @Column(name = "current_longitude", precision = 10, scale = 7)
    private BigDecimal currentLongitude;

    @Column(nullable = false, length = 50)
    private String emirate;

    @Column(name = "crew_count")
    @Builder.Default
    private int crewCount = 2;

    @Column(name = "last_updated")
    @Builder.Default
    private Instant lastUpdated = Instant.now();
}
