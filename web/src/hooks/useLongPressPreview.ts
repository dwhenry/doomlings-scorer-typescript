import { useCallback, useRef } from 'react';
import type { TouchEvent } from 'react';

const DEFAULT_MS = 450;
const DEFAULT_MOVE_PX = 14;

/**
 * Long-press to preview on touch devices; suppresses the following click so
 * tap-to-add still works for quick taps.
 */
export function useLongPressPreview(
  onPreview: undefined | (() => void),
  durationMs = DEFAULT_MS,
  moveTolPx = DEFAULT_MOVE_PX
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!onPreview) return;
      const t = e.touches[0];
      if (!t) return;
      startRef.current = { x: t.clientX, y: t.clientY };
      clearTimer();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        suppressClickRef.current = true;
        onPreview();
      }, durationMs);
    },
    [onPreview, clearTimer, durationMs]
  );

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!startRef.current || !timerRef.current) return;
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - startRef.current.x;
      const dy = t.clientY - startRef.current.y;
      if (dx * dx + dy * dy > moveTolPx * moveTolPx) {
        clearTimer();
      }
    },
    [clearTimer, moveTolPx]
  );

  const onTouchEnd = useCallback(() => {
    clearTimer();
    startRef.current = null;
  }, [clearTimer]);

  const touchProps = onPreview
    ? {
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        onTouchCancel: onTouchEnd
      }
    : {};

  const wrapClick = useCallback((fn: () => void) => {
    return () => {
      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        return;
      }
      fn();
    };
  }, []);

  return { touchProps, wrapClick };
}
