/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.incident.kafka;

import com.emergencyconnect.incident.dto.IncidentResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class IncidentEventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final MeterRegistry meterRegistry;

    public static final String TOPIC_CREATED = "incident.created";
    public static final String TOPIC_UPDATED = "incident.updated";

    public void publishCreated(IncidentResponse incident) {
        meterRegistry.counter("ec_incident_events_total", "event_type", "INCIDENT_CREATED").increment();
        if (incident != null && incident.getSeverity() != null) {
            meterRegistry.counter("ec_incident_created_by_severity_total", "severity", incident.getSeverity().toString()).increment();
        }
        publish(TOPIC_CREATED, incident);
    }

    public void publishUpdated(IncidentResponse incident) {
        meterRegistry.counter("ec_incident_events_total", "event_type", "INCIDENT_UPDATED").increment();
        if (incident != null && incident.getStatus() != null) {
            meterRegistry.counter("ec_incident_status_total", "status", incident.getStatus().toString()).increment();
        }
        publish(TOPIC_UPDATED, incident);
    }

    private void publish(String topic, Object payload) {
        try {
            String message = objectMapper.writeValueAsString(payload);
            kafkaTemplate.send(topic, message);
            log.info("Published to topic={} payload={}", topic, message);
        } catch (Exception e) {
            log.error("Failed to publish to topic={}", topic, e);
        }
    }
}
