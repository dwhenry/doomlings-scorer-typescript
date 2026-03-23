import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState
} from 'react';

const UNPIN_TOP_PX = 6;

type PinBox = { left: number; width: number };

/**
 * Pins the hand row under the viewport top while scrolling (mobile). CSS
 * position:sticky is unreliable here (full-bleed strip, WebKit); fixed +
 * in-flow spacer matches the intended UX.
 */
export function useMobileHandPin(enabled: boolean) {
  const flowSlotRef = useRef<HTMLDivElement | null>(null);
  const handRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef(false);
  const [pinned, setPinned] = useState(false);
  const [spacerHeight, setSpacerHeight] = useState(0);
  const [box, setBox] = useState<PinBox>({ left: 0, width: 0 });

  const syncBoxAndSpacer = useCallback(() => {
    const hand = handRef.current;
    if (!hand) return;
    const r = hand.getBoundingClientRect();
    setBox({ left: r.left, width: r.width });
    setSpacerHeight(hand.offsetHeight);
  }, []);

  const run = useCallback(() => {
    if (!enabled || !flowSlotRef.current || !handRef.current) return;

    const slotTop = flowSlotRef.current.getBoundingClientRect().top;
    const isPinned = pinnedRef.current;

    if (!isPinned && slotTop <= 0) {
      const handEl = handRef.current;
      const r = handEl.getBoundingClientRect();
      pinnedRef.current = true;
      setBox({ left: r.left, width: r.width });
      setSpacerHeight(handEl.offsetHeight);
      setPinned(true);
      return;
    }

    if (isPinned && slotTop > UNPIN_TOP_PX) {
      pinnedRef.current = false;
      setPinned(false);
      setSpacerHeight(0);
      return;
    }

    if (isPinned) {
      syncBoxAndSpacer();
    }
  }, [enabled, syncBoxAndSpacer]);

  useLayoutEffect(() => {
    if (!enabled) {
      pinnedRef.current = false;
      setPinned(false);
      setSpacerHeight(0);
      return;
    }

    run();

    const onScroll = () => {
      run();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', run);
    window.visualViewport?.addEventListener('resize', run);
    window.visualViewport?.addEventListener('scroll', onScroll);

    const hand = handRef.current;
    let ro: ResizeObserver | undefined;
    if (hand && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        if (pinnedRef.current) syncBoxAndSpacer();
        run();
      });
      ro.observe(hand);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', run);
      window.visualViewport?.removeEventListener('resize', run);
      window.visualViewport?.removeEventListener('scroll', onScroll);
      ro?.disconnect();
    };
  }, [enabled, run, syncBoxAndSpacer]);

  const handPinStyle = pinned
    ? ({
        position: 'fixed',
        top: 0,
        left: box.left,
        width: box.width,
        zIndex: 1000,
        margin: 0,
        boxSizing: 'border-box'
      } as const)
    : undefined;

  return {
    flowSlotRef,
    handRef,
    pinned,
    spacerHeight,
    handPinStyle
  };
}
