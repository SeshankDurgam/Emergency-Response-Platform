/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.auth.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthEventProducer {

    private static final String TOPIC = "auth.event";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final MeterRegistry meterRegistry;

    public void publishLoginSuccess(String userId, String username, String ipAddress) {
        publish("LOGIN_SUCCESS", userId, Map.of(
                "username", username,
                "ipAddress", ipAddress
        ));
    }

    public void publishLoginFailure(String username, String ipAddress) {
        publish("LOGIN_FAILURE", null, Map.of(
                "username", username,
                "ipAddress", ipAddress
        ));
    }

    public void publishLogout(String userId, String username) {
        publish("LOGOUT", userId, Map.of(
                "username", username
        ));
    }

    public void publishMfaEnabled(String userId, String username) {
        publish("MFA_ENABLED", userId, Map.of(
                "username", username
        ));
    }

    public void publishMfaVerified(String userId, String username) {
        publish("MFA_VERIFIED", userId, Map.of(
                "username", username
        ));
    }

    public void publishIpBlacklisted(String ipAddress, String reason, String actorId) {
        publish("IP_BLACKLISTED", actorId, Map.of(
                "ipAddress", ipAddress,
                "reason", reason
        ));
    }

    private void publish(String eventType, String actorId, Map<String, String> details) {
        meterRegistry.counter("ec_auth_events_total", "event_type", eventType).increment();
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("eventType", eventType);
            event.put("actorId", actorId != null ? actorId : "anonymous");
            event.put("occurredAt", Instant.now().toString());
            event.put("details", details);

            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(TOPIC, actorId != null ? actorId : "anonymous", payload);
            log.debug("Published auth event: type={} actor={}", eventType, actorId);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize auth event: type={}", eventType, e);
        }
    }
}
