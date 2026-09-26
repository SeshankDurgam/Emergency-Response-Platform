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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.data.redis.core.script.RedisScript;

import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DispatchServiceConcurrencyTest {

    private static final int THREAD_COUNT = 10;

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private ResourceServiceClient resourceServiceClient;

    @Mock
    private IncidentServiceClient incidentServiceClient;

    @Mock
    private DispatchEventProducer eventProducer;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOps;

    private DispatchService dispatchService;

    private final AtomicBoolean unitLockHeld = new AtomicBoolean(false);
    private final AtomicBoolean incidentLockHeld = new AtomicBoolean(false);

    @BeforeEach
    void setUp() {
        dispatchService = new DispatchService(
                assignmentRepository, resourceServiceClient, incidentServiceClient, eventProducer, redisTemplate);

        when(redisTemplate.opsForValue()).thenReturn(valueOps);

        when(valueOps.setIfAbsent(startsWith("lock:unit:"), anyString(), eq(10L), eq(TimeUnit.SECONDS)))
                .thenAnswer(inv -> unitLockHeld.compareAndSet(false, true));

        when(valueOps.setIfAbsent(startsWith("lock:incident:"), anyString(), eq(10L), eq(TimeUnit.SECONDS)))
                .thenAnswer(inv -> incidentLockHeld.compareAndSet(false, true));

        when(redisTemplate.execute(any(RedisScript.class), anyList(), any()))
                .thenAnswer(inv -> {
                    unitLockHeld.set(false);
                    incidentLockHeld.set(false);
                    return 1L;
                });

        ResourceServiceClient.UnitDTO availableUnit = new ResourceServiceClient.UnitDTO();
        availableUnit.setStatus("AVAILABLE");
        when(resourceServiceClient.getUnit(any())).thenReturn(availableUnit);

        when(assignmentRepository.save(any())).thenAnswer(inv -> {
            Assignment a = inv.getArgument(0);
            a.setId(UUID.randomUUID());
            return a;
        });

        doNothing().when(resourceServiceClient).updateUnitStatus(any(), any());
        doNothing().when(incidentServiceClient).markInProgress(any());
        doNothing().when(eventProducer).publishAssigned(any());
    }

    @Test
    void givenTenConcurrentRequests_exactlyOneSucceeds() throws InterruptedException {
        UUID incidentId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        UUID dispatcherId = UUID.randomUUID();

        CountDownLatch startGate = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(THREAD_COUNT);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        ExecutorService pool = Executors.newFixedThreadPool(THREAD_COUNT);

        for (int i = 0; i < THREAD_COUNT; i++) {
            pool.submit(() -> {
                try {
                    startGate.await();
                    dispatchService.assignUnit(incidentId, unitId, dispatcherId);
                    successCount.incrementAndGet();
                } catch (IllegalStateException ex) {
                    failureCount.incrementAndGet();
                } catch (InterruptedException ex) {
                    Thread.currentThread().interrupt();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startGate.countDown();
        boolean finished = doneLatch.await(10, TimeUnit.SECONDS);

        pool.shutdown();

        assertThat(finished).as("All threads must complete within 10 seconds").isTrue();
        assertThat(successCount.get()).as("Exactly one thread should succeed").isEqualTo(1);
        assertThat(failureCount.get()).as("Remaining nine threads should fail with IllegalStateException")
                .isEqualTo(THREAD_COUNT - 1);
    }
}
