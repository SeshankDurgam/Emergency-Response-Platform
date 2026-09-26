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
@Table(name = "merkle_roots")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MerkleRoot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "batch_start_id")
    private UUID batchStartId;

    @Column(name = "batch_end_id")
    private UUID batchEndId;

    @Column(name = "entry_count", nullable = false)
    private int entryCount;

    @Column(name = "root_hash", nullable = false, length = 64)
    private String rootHash;

    @Column(name = "committed_at", nullable = false)
    @Builder.Default
    private Instant committedAt = Instant.now();
}
