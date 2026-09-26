/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.audit.service;

import com.emergencyconnect.audit.model.AuditLog;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
@Slf4j
public class ChainHashService {

    public static final String GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

    public String computeEntryHash(AuditLog log) {
        String canonical = String.join("|",
                str(log.getId()),
                str(log.getEventType()),
                str(log.getActorId()),
                str(log.getIncidentId()),
                str(log.getEntityType()),
                str(log.getEntityId()),
                str(log.getPayload()),
                str(log.getOccurredAt()),
                str(log.getPreviousHash())
        );
        return sha256Hex(canonical);
    }

    public String computePairHash(String left, String right) {
        return sha256Hex(left + right);
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(64);
            for (byte b : bytes) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 not available on this JVM", ex);
        }
    }

    private String str(Object o) {
        return o == null ? "" : o.toString();
    }
}
