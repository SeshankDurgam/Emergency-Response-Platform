/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.dispatch.kafka;

import com.emergencyconnect.dispatch.model.Assignment;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DispatchEventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final MeterRegistry meterRegistry;

    public static final String TOPIC_ASSIGNED = "resource.assigned";
    public static final String TOPIC_RELEASED = "resource.released";

    public void publishAssigned(Assignment assignment) {
        meterRegistry.counter("ec_dispatch_events_total", "event_type", "RESOURCE_ASSIGNED").increment();
        publish(TOPIC_ASSIGNED, assignment);
    }

    public void publishReleased(Assignment assignment) {
        meterRegistry.counter("ec_dispatch_events_total", "event_type", "RESOURCE_RELEASED").increment();
        publish(TOPIC_RELEASED, assignment);
    }

    private void publish(String topic, Object payload) {
        try {
            kafkaTemplate.send(topic, objectMapper.writeValueAsString(payload));
        } catch (Exception e) {
            log.error("Failed to publish to topic={}", topic, e);
        }
    }
}
