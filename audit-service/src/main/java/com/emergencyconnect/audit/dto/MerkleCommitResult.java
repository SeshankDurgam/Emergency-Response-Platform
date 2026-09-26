/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.audit.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class MerkleCommitResult {
    private UUID merkleRootId;
    private String rootHash;
    private int entryCount;
    private int treeDepth;
    private Instant committedAt;
    private UUID batchStartId;
    private UUID batchEndId;
}
