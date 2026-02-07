import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { useDrawer, type SnapPoint } from '../hooks/useDrawer';

interface BottomDrawerProps {
  children: ReactNode;
  onClose?: () => void;
}

export default function BottomDrawer({ children, onClose }: BottomDrawerProps) {
  const { snapPoint, drawerRef, snapTo, cycleSnap, handleProps } = useDrawer();
  const prevSnapRef = useRef<SnapPoint>('collapsed');

  // Set collapsed position on mount, then animate to half
  useEffect(() => {
    if (!drawerRef.current) return;
    const collapsedHeight = 108;
    drawerRef.current.style.transform = `translateY(calc(100% - ${collapsedHeight}px))`;
    requestAnimationFrame(() => {
      snapTo('half');
    });
  }, [drawerRef, snapTo]);

  // Notify parent when drawer transitions from open → collapsed
  useEffect(() => {
    const wasOpen = prevSnapRef.current === 'half' || prevSnapRef.current === 'full';
    prevSnapRef.current = snapPoint;
    if (wasOpen && snapPoint === 'collapsed' && onClose) {
      onClose();
    }
  }, [snapPoint, onClose]);

  const showOverlay = snapPoint === 'half' || snapPoint === 'full';

  return (
    <>
      {showOverlay && (
        <div
          className="drawer-overlay"
          onClick={() => snapTo('collapsed')}
        />
      )}
      <div
        ref={drawerRef}
        className="bottom-drawer"
      >
        <button
          className="drawer-handle"
          onClick={cycleSnap}
          aria-label="Toggle card drawer"
          {...handleProps}
        >
          <span className="drawer-handle-bar" />
        </button>
        <div className="drawer-content">
          {children}
        </div>
      </div>
    </>
  );
}
