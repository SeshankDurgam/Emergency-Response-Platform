/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_BASE = 'http://localhost:30080/api/v1/audit-ws/ws/dashboard';

export default function useWebSocket(onMessage, enabled = true, onConnect = null) {
  const clientRef    = useRef(null);
  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);

  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { onConnectRef.current = onConnect;  }, [onConnect]);

  useEffect(() => {
    if (!enabled) return;

    const token = localStorage.getItem('accessToken');
    const url   = token ? `${WS_BASE}?token=${token}` : WS_BASE;

    const client = new Client({
      webSocketFactory: () => new SockJS(url),
      reconnectDelay: 5000,
      onConnect: () => {
        onConnectRef.current?.();
        client.subscribe('/topic/dashboard', (frame) => {
          try {
            const data = JSON.parse(frame.body);
            onMessageRef.current?.(data);
          } catch {  }
        });
      },
      onStompError: () => {  },
      onDisconnect: () => {  },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [enabled]);

  const disconnect = useCallback(() => {
    clientRef.current?.deactivate();
  }, []);

  return { disconnect };
}
