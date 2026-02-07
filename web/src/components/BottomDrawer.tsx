import type { ReactNode } from 'react';

interface BottomDrawerProps {
  children: ReactNode;
  topOffset: number;
}

export default function BottomDrawer({ children, topOffset }: BottomDrawerProps) {
  return (
    <div className="bottom-drawer" style={{ top: `${topOffset}px` }}>
      <div className="drawer-content">
        {children}
      </div>
    </div>
  );
}
