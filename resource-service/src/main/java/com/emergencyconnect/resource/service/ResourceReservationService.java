/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.resource.service;

import com.emergencyconnect.resource.model.MedicalResource;
import com.emergencyconnect.resource.repository.MedicalResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
public class ResourceReservationService {

    private final MedicalResourceRepository resourceRepo;
    private final StringRedisTemplate redisTemplate;

    private static final String LUA_RELEASE =
            "if redis.call('get',KEYS[1])==ARGV[1] then " +
            "return redis.call('del',KEYS[1]) else return 0 end";

    @Transactional
    public MedicalResource reserveResource(UUID resourceId, UUID incidentId) {
        String lockKey = "lock:resource:" + resourceId;
        String lockValue = UUID.randomUUID().toString();

        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, lockValue, 10, TimeUnit.SECONDS);

        if (!Boolean.TRUE.equals(acquired)) {
            throw new IllegalStateException("Resource is temporarily locked. Please retry.");
        }

        try {
            MedicalResource resource = resourceRepo.findById(resourceId)
                    .orElseThrow(() -> new IllegalArgumentException("Resource not found: " + resourceId));

            if (resource.getAvailableQuantity() <= 0) {
                throw new IllegalStateException("No available units of this resource");
            }

            resource.setAvailableQuantity(resource.getAvailableQuantity() - 1);
            resource.setLastUpdated(Instant.now());
            return resourceRepo.save(resource);

        } finally {
            releaseLock(lockKey, lockValue);
        }
    }

    @Transactional
    public MedicalResource releaseResource(UUID resourceId) {
        String lockKey = "lock:resource:" + resourceId;
        String lockValue = UUID.randomUUID().toString();

        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, lockValue, 10, TimeUnit.SECONDS);

        if (!Boolean.TRUE.equals(acquired)) {
            throw new IllegalStateException("Resource is temporarily locked. Please retry.");
        }

        try {
            MedicalResource resource = resourceRepo.findById(resourceId)
                    .orElseThrow(() -> new IllegalArgumentException("Resource not found: " + resourceId));

            if (resource.getAvailableQuantity() < resource.getTotalQuantity()) {
                resource.setAvailableQuantity(resource.getAvailableQuantity() + 1);
                resource.setLastUpdated(Instant.now());
                return resourceRepo.save(resource);
            }
            return resource;

        } finally {
            releaseLock(lockKey, lockValue);
        }
    }

    private void releaseLock(String key, String value) {
        DefaultRedisScript<Long> script = new DefaultRedisScript<>(LUA_RELEASE, Long.class);
        redisTemplate.execute(script, Collections.singletonList(key), value);
    }
}
