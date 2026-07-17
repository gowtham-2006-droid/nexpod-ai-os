import { useState, useEffect } from 'react';

/**
 * Returns the current time formatted in 24-hour HH:MM:SS format (Indian Standard Time locale).
 * Ticks automatically every second.
 */
export function useLiveClock() {
  const [liveTime, setLiveTime] = useState('--:--:--');

  useEffect(() => {
    const tick = () => {
      setLiveTime(
        new Date().toLocaleTimeString('en-IN', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return liveTime;
}
