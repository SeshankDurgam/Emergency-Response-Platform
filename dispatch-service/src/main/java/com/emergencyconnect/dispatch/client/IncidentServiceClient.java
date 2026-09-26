/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */

package com.emergencyconnect.dispatch.client;

import com.emergencyconnect.dispatch.circuitbreaker.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class IncidentServiceClient {

    private final RestTemplate   restTemplate;
    private final CircuitBreaker circuitBreaker;

    private static final String SERVICE       = "incident-service";
    private static final String INCIDENT_BASE = "https://incident-service";

    private HttpHeaders authHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            String auth = attrs.getRequest().getHeader("Authorization");
            if (auth != null) headers.set("Authorization", auth);
        }
        return headers;
    }

    public void markInProgress(UUID incidentId) {
        if (!circuitBreaker.isAllowed(SERVICE)) {
            
            log.warn("Circuit OPEN for incident-service — incident {} will not be marked IN_PROGRESS", incidentId);
            return;
        }
        try {
            String url = INCIDENT_BASE + "/api/v1/incidents/" + incidentId + "/status";
            Map<String, String> body = Map.of("newStatus", "IN_PROGRESS", "reason", "Unit dispatched");
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, authHeaders());
            restTemplate.exchange(url, HttpMethod.PATCH, entity, Void.class);
            circuitBreaker.recordSuccess(SERVICE);
        } catch (Exception ex) {
            circuitBreaker.recordFailure(SERVICE);
            log.warn("Failed to mark incident {} IN_PROGRESS [failures={}]: {}",
                    incidentId, circuitBreaker.getFailureCount(SERVICE), ex.getMessage());
        }
    }
}
