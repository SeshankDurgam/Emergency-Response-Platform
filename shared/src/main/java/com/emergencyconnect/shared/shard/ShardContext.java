/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.shared.shard;

public class ShardContext {

    private static final ThreadLocal<String> CURRENT_SHARD = new ThreadLocal<>();

    public static void setCurrentShard(String shard) {
        CURRENT_SHARD.set(shard);
    }

    public static String getCurrentShard() {
        String shard = CURRENT_SHARD.get();
        return shard != null ? shard : "shard-0";
    }

    public static void clear() {
        CURRENT_SHARD.remove();
    }
}
