import { useRef, useCallback, useState } from 'react';

export type SnapPoint = 'collapsed' | 'half' | 'full';

const SNAP_HEIGHTS: Record<SnapPoint, () => number> = {
  collapsed: () => 108,
  half: () => window.innerHeight * 0.5,
  full: () => window.innerHeight - 60,
};

function getSnapHeight(snap: SnapPoint): number {
  return SNAP_HEIGHTS[snap]();
}

const SNAP_ORDER: SnapPoint[] = ['collapsed', 'half', 'full'];

export function useDrawer() {
  const [snapPoint, setSnapPoint] = useState<SnapPoint>('collapsed');
  const drawerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const isDragging = useRef(false);

  const applyTransform = useCallback((height: number) => {
    if (drawerRef.current) {
      drawerRef.current.style.transform = `translateY(calc(100% - ${height}px))`;
    }
  }, []);

  const snapTo = useCallback(
    (point: SnapPoint) => {
      setSnapPoint(point);
      if (drawerRef.current) {
        drawerRef.current.style.transition = 'transform 0.3s ease-out';
        applyTransform(getSnapHeight(point));
        // Remove transition after animation completes
        const handler = () => {
          if (drawerRef.current) {
            drawerRef.current.style.transition = '';
          }
        };
        drawerRef.current.addEventListener('transitionend', handler, {
          once: true,
        });
      }
    },
    [applyTransform]
  );

  const cycleSnap = useCallback(() => {
    const idx = SNAP_ORDER.indexOf(snapPoint);
    const next = SNAP_ORDER[(idx + 1) % SNAP_ORDER.length];
    snapTo(next);
  }, [snapPoint, snapTo]);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      isDragging.current = true;
      startY.current = e.touches[0].clientY;
      startHeight.current = getSnapHeight(snapPoint);
      if (drawerRef.current) {
        drawerRef.current.style.transition = '';
      }
    },
    [snapPoint]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current) return;
      const deltaY = startY.current - e.touches[0].clientY;
      const newHeight = Math.max(
        SNAP_HEIGHTS.collapsed(),
        Math.min(SNAP_HEIGHTS.full(), startHeight.current + deltaY)
      );
      applyTransform(newHeight);
    },
    [applyTransform]
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;

      const endY = e.changedTouches[0].clientY;
      const deltaY = startY.current - endY;
      const currentHeight = startHeight.current + deltaY;
      const velocity = deltaY; // positive = swiping up

      // Find nearest snap point, biased by velocity
      let bestSnap: SnapPoint = 'collapsed';
      let bestDist = Infinity;
      for (const sp of SNAP_ORDER) {
        const h = getSnapHeight(sp);
        // Bias distance by velocity: if swiping up, prefer higher snaps
        const biasedDist = Math.abs(currentHeight - h) - velocity * 0.3;
        if (biasedDist < bestDist) {
          bestDist = biasedDist;
          bestSnap = sp;
        }
      }

      snapTo(bestSnap);
    },
    [snapTo]
  );

  return {
    snapPoint,
    drawerRef,
    snapTo,
    cycleSnap,
    handleProps: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}
