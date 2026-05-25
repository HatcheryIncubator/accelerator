import { useEffect, useState } from 'react';

/**
 * A timestamp (ms) that refreshes on an interval. The clock is only read inside
 * timer callbacks (never during render or synchronously in the effect body), so
 * components stay pure for the React Compiler. Starts at 0 and updates on the
 * next tick right after mount.
 */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = setTimeout(() => setNow(Date.now()), 0);
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => {
      clearTimeout(tick);
      clearInterval(id);
    };
  }, [intervalMs]);
  return now;
}
