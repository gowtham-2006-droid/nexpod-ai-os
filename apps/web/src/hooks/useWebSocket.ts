/**
 * useWebSocket — Real-time WebSocket hook for NexPod AI OS
 * =========================================================
 * Connects to the backend telemetry WebSocket, parses incoming JSON messages,
 * and calls the provided onMessage callback on each push.
 *
 * Features:
 * - Automatic reconnection with exponential backoff (1s → 2s → 4s → max 30s)
 * - Connection status: 'connecting' | 'open' | 'closed' | 'error'
 * - Clean cleanup on component unmount (no memory leaks)
 * - Client-side ping/pong keepalive response
 * - Optional `enabled` flag to disable when not needed (e.g., page hidden)
 *
 * Usage:
 *   const { status } = useWebSocket({
 *     onMessage: (data) => { setSensors(data.telemetry); },
 *   });
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export type WsStatus = 'connecting' | 'open' | 'closed' | 'error';

interface UseWebSocketOptions<T = unknown> {
  /** Called with parsed JSON payload on each server message. */
  onMessage: (data: T) => void;
  /**
   * WebSocket URL. Defaults to NEXT_PUBLIC_WS_URL env var,
   * falling back to ws://localhost:8000/ws/telemetry.
   */
  url?: string;
  /** Set to false to skip connecting entirely (e.g. when usePolling is preferred). */
  enabled?: boolean;
  /** Initial backoff in ms. Doubles on each failed attempt up to maxBackoffMs. */
  initialBackoffMs?: number;
  /** Maximum backoff in ms before giving up on exponential growth. */
  maxBackoffMs?: number;
}

export function useWebSocket<T = unknown>({
  onMessage,
  url,
  enabled = true,
  initialBackoffMs = 1000,
  maxBackoffMs = 30000,
}: UseWebSocketOptions<T>): { status: WsStatus } {
  const [status, setStatus] = useState<WsStatus>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const backoffRef = useRef<number>(initialBackoffMs);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef<boolean>(true);
  const onMessageRef = useRef(onMessage);

  // Keep callback ref fresh without triggering reconnects
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const getWsUrl = useCallback((): string => {
    if (url) return url;
    // Read from env var, defaulting to localhost
    const base =
      (typeof process !== 'undefined' &&
        process.env.NEXT_PUBLIC_WS_URL) ||
      'ws://localhost:8000';
    return `${base.replace(/\/$/, '')}/ws/telemetry`;
  }, [url]);

  const connect = useCallback(() => {
    if (!mountedRef.current || !enabled) return;

    const wsUrl = getWsUrl();
    setStatus('connecting');

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
    } catch {
      setStatus('error');
      return;
    }

    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) { ws.close(); return; }
      setStatus('open');
      backoffRef.current = initialBackoffMs; // reset backoff on success
    };

    ws.onmessage = (event: MessageEvent) => {
      if (!mountedRef.current) return;
      try {
        const data = JSON.parse(event.data as string) as { type: string } & T;
        // Respond to server pings immediately
        if ((data as any).type === 'ping') {
          ws.send(JSON.stringify({ type: 'ping' }));
          return;
        }
        onMessageRef.current(data as T);
      } catch {
        // Silently drop malformed messages
      }
    };

    ws.onerror = () => {
      if (!mountedRef.current) return;
      setStatus('error');
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setStatus('closed');
      wsRef.current = null;

      // Schedule reconnect with exponential backoff
      const delay = backoffRef.current;
      backoffRef.current = Math.min(delay * 2, maxBackoffMs);

      reconnectTimerRef.current = setTimeout(() => {
        if (mountedRef.current && enabled) connect();
      }, delay);
    };
  }, [enabled, getWsUrl, initialBackoffMs, maxBackoffMs]);

  useEffect(() => {
    mountedRef.current = true;

    if (enabled) {
      connect();
    } else {
      setStatus('closed');
    }

    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on unmount close
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { status };
}
