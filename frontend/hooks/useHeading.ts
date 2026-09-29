import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export interface HeadingState {
  /** Degrees from true north (falls back to magnetic north), or null before the first reading. */
  heading: number | null;
  /** Compass calibration: 0 (none) to 3 (high), as reported by the OS. */
  accuracy: number;
  error: boolean;
}

/** Subscribes to the device compass while `enabled` is true. */
export function useHeading(enabled: boolean): HeadingState {
  const [state, setState] = useState<HeadingState>({ heading: null, accuracy: 0, error: false });

  useEffect(() => {
    if (!enabled) return;
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;
    Location.watchHeadingAsync((data) => {
      // True heading already accounts for magnetic declination and device orientation.
      const heading = data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
      setState({ heading, accuracy: data.accuracy, error: false });
    })
      .then((sub) => {
        if (cancelled) sub.remove();
        else subscription = sub;
      })
      .catch((error) => {
        console.error('Compass unavailable:', error);
        if (!cancelled) setState((s) => ({ ...s, error: true }));
      });
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [enabled]);

  return state;
}
