/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.audit.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ChainVerificationResult {
    private boolean chainIntact;
    private int totalChecked;
    private int tampered;
    private int missing;
    private String firstTamperedId;
    private List<EntryVerificationResult> entries;
}
