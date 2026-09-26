/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.shared.shard;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class EmirateShardRouter {

    private static final Map<String, String> SHARD_MAP = Map.of(
            "Abu Dhabi", "shard-0",
            "Al Ain",    "shard-0",
            "Dubai",     "shard-1",
            "Sharjah",   "shard-1",
            "Ajman",     "shard-2",
            "UAQ",       "shard-2",
            "RAK",       "shard-2",
            "Fujairah",  "shard-2"
    );

    public String resolveShardForEmirate(String emirate) {
        return SHARD_MAP.getOrDefault(emirate, "shard-0");
    }

    public void setShardForRequest(String emirate) {
        ShardContext.setCurrentShard(resolveShardForEmirate(emirate));
    }
}
