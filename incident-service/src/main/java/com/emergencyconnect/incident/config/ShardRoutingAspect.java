/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.incident.config;

import com.emergencyconnect.shared.shard.EmirateShardRouter;
import com.emergencyconnect.shared.shard.ShardContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;


@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class ShardRoutingAspect {

    private final EmirateShardRouter emirateShardRouter;

    @Around("execution(* com.emergencyconnect.incident.service.*.*(..))")
    public Object routeByEmirate(ProceedingJoinPoint joinPoint) throws Throwable {
        
        for (Object arg : joinPoint.getArgs()) {
            if (arg instanceof String s && s.length() > 0) {
                String shard = emirateShardRouter.resolveShardForEmirate(s);
                ShardContext.setCurrentShard(shard);
                log.debug("Shard routing: emirate={} -> shard={}", s, shard);
                break;
            }
        }
        try {
            return joinPoint.proceed();
        } finally {
            ShardContext.clear();
        }
    }
}
