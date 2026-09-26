/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.audit.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic incidentCreatedTopic() {
        return TopicBuilder.name("incident.created")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic incidentUpdatedTopic() {
        return TopicBuilder.name("incident.updated")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic resourceAssignedTopic() {
        return TopicBuilder.name("resource.assigned")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic resourceReleasedTopic() {
        return TopicBuilder.name("resource.released")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic authEventTopic() {
        return TopicBuilder.name("auth.event")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }
}
