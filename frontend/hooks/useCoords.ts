import { useCallback, useEffect, useState } from 'react';
import { getCurrentCoords, Coords } from '../utils/location';

export type CoordsState =
  | { status: 'loading'; coords: null }
  | { status: 'ready'; coords: Coords }
  | { status: 'denied'; coords: null }
  | { status: 'error'; coords: null };

const CACHE_MS = 5 * 60 * 1000;
let cache: { coords: Coords; at: number } | null = null;
let pending: Promise<Coords | null> | null = null;

/** One location request shared by every screen, reused for a few minutes. */
function fetchCoords(force: boolean): Promise<Coords | null> {
  if (!force && cache && Date.now() - cache.at < CACHE_MS) return Promise.resolve(cache.coords);
  if (!pending) {
    pending = getCurrentCoords()
      .then((coords) => {
        if (coords) cache = { coords, at: Date.now() };
        return coords;
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}

/** Device coordinates with loading / denied / error states and a retry function. */
export function useCoords() {
  const [state, setState] = useState<CoordsState>(() =>
    cache ? { status: 'ready', coords: cache.coords } : { status: 'loading', coords: null }
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchCoords(attempt > 0)
      .then((coords) => {
        if (cancelled) return;
        setState(coords ? { status: 'ready', coords } : { status: 'denied', coords: null });
      })
      .catch((error) => {
        console.error('Error getting location:', error);
        if (!cancelled) setState({ status: 'error', coords: null });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState((s) => (s.status === 'ready' ? s : { status: 'loading', coords: null }));
    setAttempt((a) => a + 1);
  }, []);

  return { ...state, retry };
}
