/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.dispatch.service;

import com.emergencyconnect.dispatch.client.IncidentServiceClient;
import com.emergencyconnect.dispatch.client.ResourceServiceClient;
import com.emergencyconnect.dispatch.kafka.DispatchEventProducer;
import com.emergencyconnect.dispatch.model.Assignment;
import com.emergencyconnect.dispatch.model.AssignmentStatus;
import com.emergencyconnect.dispatch.repository.AssignmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class DispatchService {

    private final AssignmentRepository assignmentRepository;
    private final ResourceServiceClient resourceServiceClient;
    private final IncidentServiceClient incidentServiceClient;
    private final DispatchEventProducer eventProducer;
    private final StringRedisTemplate redisTemplate;

    private static final String LUA_RELEASE =
            "if redis.call('get',KEYS[1])==ARGV[1] then " +
            "return redis.call('del',KEYS[1]) else return 0 end";

    @Transactional
    public Assignment assignUnit(UUID incidentId, UUID unitId, UUID dispatcherId) {
        String unitLockKey = "lock:unit:" + unitId;
        String unitLockVal = UUID.randomUUID().toString();

        Boolean unitAcquired = redisTemplate.opsForValue()
                .setIfAbsent(unitLockKey, unitLockVal, 10, TimeUnit.SECONDS);
        if (!Boolean.TRUE.equals(unitAcquired)) {
            throw new IllegalStateException("Unit is being assigned. Please retry.");
        }

        try {
            String incidentLockKey = "lock:incident:" + incidentId;
            String incidentLockVal = UUID.randomUUID().toString();

            Boolean incidentAcquired = redisTemplate.opsForValue()
                    .setIfAbsent(incidentLockKey, incidentLockVal, 10, TimeUnit.SECONDS);
            if (!Boolean.TRUE.equals(incidentAcquired)) {
                throw new IllegalStateException("Another dispatch is in progress for this incident. Retry.");
            }

            try {
                ResourceServiceClient.UnitDTO unit = resourceServiceClient.getUnit(unitId);
                if (unit == null || !"AVAILABLE".equals(unit.getStatus())) {
                    throw new IllegalStateException("Unit is not available for dispatch");
                }

                Assignment assignment = assignmentRepository.save(Assignment.builder()
                        .incidentId(incidentId)
                        .unitId(unitId)
                        .dispatcherId(dispatcherId)
                        .status(AssignmentStatus.ASSIGNED)
                        .build());

                resourceServiceClient.updateUnitStatus(unitId, "DISPATCHED");
                incidentServiceClient.markInProgress(incidentId);
                eventProducer.publishAssigned(assignment);
                return assignment;

            } finally {
                releaseLock(incidentLockKey, incidentLockVal);
            }
        } finally {
            releaseLock(unitLockKey, unitLockVal);
        }
    }

    @Transactional
    public Assignment updateStatus(UUID assignmentId, AssignmentStatus newStatus) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found: " + assignmentId));

        assignment.setStatus(newStatus);
        if (newStatus == AssignmentStatus.COMPLETED || newStatus == AssignmentStatus.CANCELLED) {
            assignment.setCompletedAt(Instant.now());
            resourceServiceClient.updateUnitStatus(assignment.getUnitId(), "AVAILABLE");
            eventProducer.publishReleased(assignment);
        }
        return assignmentRepository.save(assignment);
    }

    @Transactional
    public void cancelAssignment(UUID assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found: " + assignmentId));
        assignment.setStatus(AssignmentStatus.CANCELLED);
        assignment.setCompletedAt(Instant.now());
        assignmentRepository.save(assignment);
        resourceServiceClient.updateUnitStatus(assignment.getUnitId(), "AVAILABLE");
        eventProducer.publishReleased(assignment);
    }

    @Transactional(readOnly = true)
    public Page<Assignment> listAssignments(Pageable pageable) {
        return assignmentRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Assignment getAssignment(UUID id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found: " + id));
    }

    @Transactional(readOnly = true)
    public Page<Assignment> listByIncident(UUID incidentId, Pageable pageable) {
        return assignmentRepository.findByIncidentId(incidentId, pageable);
    }

    private void releaseLock(String key, String value) {
        DefaultRedisScript<Long> script = new DefaultRedisScript<>(LUA_RELEASE, Long.class);
        redisTemplate.execute(script, Collections.singletonList(key), value);
    }
}
