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
@Table(name = "hospitals")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 50)
    private String emirate;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "total_beds", nullable = false)
    private int totalBeds;

    @Column(name = "available_beds", nullable = false)
    private int availableBeds;

    @Column(name = "icu_beds_total")
    @Builder.Default
    private int icuBedsTotal = 0;

    @Column(name = "icu_beds_available")
    @Builder.Default
    private int icuBedsAvailable = 0;

    @Column(name = "accepts_trauma")
    @Builder.Default
    private boolean acceptsTrauma = true;

    @Column(name = "is_active")
    @Builder.Default
    private boolean active = true;

    @Column(name = "last_updated")
    @Builder.Default
    private Instant lastUpdated = Instant.now();
}
