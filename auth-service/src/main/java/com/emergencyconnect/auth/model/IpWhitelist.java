/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.auth.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "ip_whitelist")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IpWhitelist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ip_address", unique = true, nullable = false, length = 50)
    private String ipAddress;

    @Column(length = 255)
    private String description;

    @Column(name = "added_by", length = 100)
    private String addedBy;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();
}
