import { useEffect, useRef } from 'react';

/**
 * Triggers an async or sync callback immediately on mount and then repeatedly at a specified interval.
 * Prevents timer restarts by utilizing a mutable ref for the callback function.
 *
 * @param enabled - Set to false to pause polling (e.g. when a WebSocket connection is active).
 */
export function usePolling(
  callback: () => Promise<void> | void,
  intervalMs: number = 5000,
  deps: any[] = [],
  enabled: boolean = true
) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const run = () => {
      const res = savedCallback.current();
      if (res instanceof Promise) {
        res.catch((err) => {
          console.error("Polling callback execution failed:", err);
        });
      }
    };

    run();

    const id = setInterval(run, intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, enabled, ...deps]);
}
