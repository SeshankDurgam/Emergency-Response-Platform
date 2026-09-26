/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */

package com.emergencyconnect.dispatch.client;

import com.emergencyconnect.dispatch.circuitbreaker.CircuitBreaker;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
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
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class ResourceServiceClient {

    private final RestTemplate  restTemplate;
    private final CircuitBreaker circuitBreaker;

    private static final String SERVICE = "resource-service";
    private static final String RESOURCE_BASE = "https://resource-service";

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UnitDTO {
        private UUID id;
        private String unitCode;
        private String type;
        private String status;
        private BigDecimal currentLatitude;
        private BigDecimal currentLongitude;
        private String emirate;
    }

    private HttpEntity<Void> requestWithAuth() {
        HttpHeaders headers = new HttpHeaders();
        ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            String auth = attrs.getRequest().getHeader("Authorization");
            if (auth != null) headers.set("Authorization", auth);
        }
        return new HttpEntity<>(headers);
    }

    public UnitDTO getUnit(UUID unitId) {
        if (!circuitBreaker.isAllowed(SERVICE)) {
            throw new IllegalStateException(
                "Resource service is currently unavailable (circuit OPEN). Please try again shortly.");
        }
        try {
            String url = RESOURCE_BASE + "/api/v1/resources/units/" + unitId;
            UnitDTO result = restTemplate.exchange(url, HttpMethod.GET, requestWithAuth(), UnitDTO.class).getBody();
            circuitBreaker.recordSuccess(SERVICE);
            return result;
        } catch (Exception ex) {
            circuitBreaker.recordFailure(SERVICE);
            log.error("Failed to get unit {} from resource-service [failures={}]: {}",
                    unitId, circuitBreaker.getFailureCount(SERVICE), ex.getMessage());
            throw new IllegalStateException("Resource service call failed: " + ex.getMessage());
        }
    }

    public void updateUnitStatus(UUID unitId, String status) {
        if (!circuitBreaker.isAllowed(SERVICE)) {
            throw new IllegalStateException(
                "Resource service is currently unavailable (circuit OPEN). Please try again shortly.");
        }
        try {
            String url = RESOURCE_BASE + "/api/v1/resources/units/" + unitId + "/status";
            HttpHeaders headers = new HttpHeaders();
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                String auth = attrs.getRequest().getHeader("Authorization");
                if (auth != null) headers.set("Authorization", auth);
            }
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(Map.of("status", status), headers);
            restTemplate.exchange(url, HttpMethod.PUT, entity, Void.class);
            circuitBreaker.recordSuccess(SERVICE);
        } catch (Exception ex) {
            circuitBreaker.recordFailure(SERVICE);
            log.error("Failed to update unit {} status in resource-service [failures={}]: {}",
                    unitId, circuitBreaker.getFailureCount(SERVICE), ex.getMessage());
            throw new IllegalStateException("Resource service call failed: " + ex.getMessage());
        }
    }

    public UnitDTO[] listAvailableUnits(String emirate) {
        if (!circuitBreaker.isAllowed(SERVICE)) {
            log.warn("Circuit OPEN for resource-service — returning empty unit list");
            return new UnitDTO[0];
        }
        try {
            String url = RESOURCE_BASE + "/api/v1/resources/units/available"
                    + (emirate != null ? "?emirate=" + emirate : "");
            UnitDTO[] result = restTemplate.exchange(url, HttpMethod.GET, requestWithAuth(), UnitDTO[].class).getBody();
            circuitBreaker.recordSuccess(SERVICE);
            return result != null ? result : new UnitDTO[0];
        } catch (Exception ex) {
            circuitBreaker.recordFailure(SERVICE);
            log.error("Failed to list units from resource-service [failures={}]: {}",
                    circuitBreaker.getFailureCount(SERVICE), ex.getMessage());
            return new UnitDTO[0];
        }
    }
}
