/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.dispatch.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.emergencyconnect.dispatch.service.DispatchService;
import com.emergencyconnect.dispatch.service.SmartDispatchEngine;
import com.emergencyconnect.dispatch.client.ResourceServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class IncidentEventConsumer {

    private final DispatchService dispatchService;
    private final SmartDispatchEngine smartDispatchEngine;
    private final ObjectMapper objectMapper;

    private static final UUID AUTO_DISPATCH_USER = UUID.fromString("00000000-0000-0000-0000-000000000001");

    @KafkaListener(topics = "incident.created", groupId = "dispatch-service")
    public void onIncidentCreated(String message) {
        try {
            JsonNode node = objectMapper.readTree(message);
            String severity = node.path("severity").asText();

            if ("CRITICAL".equals(severity)) {
                UUID incidentId = UUID.fromString(node.path("id").asText());
                String emirate = node.path("emirate").asText();
                BigDecimal lat = new BigDecimal(node.path("locationLatitude").asText("25.2048"));
                BigDecimal lon = new BigDecimal(node.path("locationLongitude").asText("55.2708"));

                List<SmartDispatchEngine.UnitRecommendation> recommendations =
                        smartDispatchEngine.recommend(lat, lon, severity, emirate, 1);

                if (!recommendations.isEmpty()) {
                    UUID unitId = recommendations.get(0).getUnit().getId();
                    dispatchService.assignUnit(incidentId, unitId, AUTO_DISPATCH_USER);
                    log.info("Auto-dispatched unit {} to CRITICAL incident {}", unitId, incidentId);
                }
            }
        } catch (Exception e) {
            log.error("Error processing incident.created event", e);
        }
    }
}
