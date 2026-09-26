/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */

package com.emergencyconnect.dispatch.circuitbreaker;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;


@Slf4j
@Component
public class CircuitBreaker {

    @Value("${circuit.breaker.failure-threshold:5}")
    private int failureThreshold;

    @Value("${circuit.breaker.timeout-ms:10000}")
    private long timeoutMs;

    private final Map<String, CircuitBreakerState> states    = new ConcurrentHashMap<>();
    private final Map<String, AtomicInteger>       failures  = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong>          openedAt  = new ConcurrentHashMap<>();

    
    public boolean isAllowed(String service) {
        CircuitBreakerState state = stateOf(service);

        if (state == CircuitBreakerState.CLOSED) {
            return true;
        }

        if (state == CircuitBreakerState.OPEN) {
            long elapsed = System.currentTimeMillis()
                    - openedAt.getOrDefault(service, new AtomicLong(0)).get();
            if (elapsed >= timeoutMs) {
                states.put(service, CircuitBreakerState.HALF_OPEN);
                log.info("CircuitBreaker HALF_OPEN for '{}' — sending probe request", service);
                return true;
            }
            log.warn("CircuitBreaker OPEN for '{}' — request rejected", service);
            return false;
        }

        
        return true;
    }

    
    public void recordSuccess(String service) {
        CircuitBreakerState state = stateOf(service);
        if (state == CircuitBreakerState.HALF_OPEN || state == CircuitBreakerState.OPEN) {
            states.put(service, CircuitBreakerState.CLOSED);
            failureCounter(service).set(0);
            log.info("CircuitBreaker CLOSED for '{}' — service recovered", service);
        } else {
            failureCounter(service).set(0);
        }
    }

    
    public void recordFailure(String service) {
        int count = failureCounter(service).incrementAndGet();
        CircuitBreakerState state = stateOf(service);

        if (state == CircuitBreakerState.HALF_OPEN) {
            trip(service);
            log.warn("CircuitBreaker back to OPEN for '{}' — probe failed", service);
        } else if (count >= failureThreshold) {
            trip(service);
            log.warn("CircuitBreaker OPEN for '{}' after {} consecutive failures", service, count);
        }
    }

    public CircuitBreakerState getState(String service) {
        return stateOf(service);
    }

    public int getFailureCount(String service) {
        return failureCounter(service).get();
    }

    private CircuitBreakerState stateOf(String service) {
        return states.getOrDefault(service, CircuitBreakerState.CLOSED);
    }

    private AtomicInteger failureCounter(String service) {
        return failures.computeIfAbsent(service, k -> new AtomicInteger(0));
    }

    private void trip(String service) {
        states.put(service, CircuitBreakerState.OPEN);
        openedAt.put(service, new AtomicLong(System.currentTimeMillis()));
    }
}
