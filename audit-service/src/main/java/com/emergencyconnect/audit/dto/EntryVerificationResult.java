/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.audit.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class EntryVerificationResult {
    private UUID entryId;
    private boolean verified;
    private String storedHash;
    private String computedHash;
    private String previousHash;
    private String failureReason;
}
