/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.audit.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class DashboardWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastUpdate(String eventType, String payload) {
        try {
            messagingTemplate.convertAndSend("/topic/dashboard",
                    Map.of("eventType", eventType, "payload", payload));
        } catch (Exception e) {
            log.error("Failed to broadcast WebSocket update for eventType={}", eventType, e);
        }
    }
}
