/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private static final long SESSION_TTL_MINUTES = 30;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionData {
        private String userId;
        private String username;
        private String role;
        private String ipAddress;
        private boolean mfaVerified;
        private Instant createdAt;
        private Instant lastActivity;
    }

    public void createSession(String userId, String username, String role,
                              String ipAddress, boolean mfaVerified) {
        SessionData data = SessionData.builder()
                .userId(userId)
                .username(username)
                .role(role)
                .ipAddress(ipAddress)
                .mfaVerified(mfaVerified)
                .createdAt(Instant.now())
                .lastActivity(Instant.now())
                .build();
        try {
            String key = "session:" + userId;
            redisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(data),
                    SESSION_TTL_MINUTES, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("Failed to create session for user {}", userId, e);
        }
    }

    public void slideSession(String userId) {
        String key = "session:" + userId;
        redisTemplate.expire(key, SESSION_TTL_MINUTES, TimeUnit.MINUTES);
    }

    public boolean sessionExists(String userId) {
        String key = "session:" + userId;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    public void deleteSession(String userId) {
        redisTemplate.delete("session:" + userId);
    }

    public void markMfaVerified(String userId) {
        String key = "session:" + userId;
        String raw = redisTemplate.opsForValue().get(key);
        if (raw == null) return;
        try {
            SessionData data = objectMapper.readValue(raw, SessionData.class);
            data.setMfaVerified(true);
            data.setLastActivity(Instant.now());
            redisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(data),
                    SESSION_TTL_MINUTES, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("Failed to update MFA status for user {}", userId, e);
        }
    }
}
