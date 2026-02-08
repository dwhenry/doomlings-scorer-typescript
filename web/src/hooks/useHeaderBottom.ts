import { useState, useEffect } from 'react';

export function useHeaderBottom(): number {
  const [headerBottom, setHeaderBottom] = useState(0);

  useEffect(() => {
    function measure() {
      const header = document.querySelector(
        '.game-header'
      ) as HTMLElement | null;
      if (header) {
        setHeaderBottom(header.getBoundingClientRect().bottom);
      }
    }

    measure();

    const header = document.querySelector('.game-header') as HTMLElement | null;
    let observer: ResizeObserver | undefined;
    if (header) {
      observer = new ResizeObserver(measure);
      observer.observe(header);
    }

    window.addEventListener('resize', measure);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return headerBottom;
}
