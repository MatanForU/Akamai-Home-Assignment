import { useLayoutEffect, useRef, useState } from "react";

// Menus render into a portal (document.body) positioned off the trigger's
// measured rect, so they always float above surrounding content instead of
// being clipped or layered underneath sibling elements with their own
// stacking context (e.g. "glass" cards, or a scrollable drawer). Shared by
// every dropdown/menu trigger in the app (filters, window picker, the
// Determination action picker) so they all anchor and reposition the same way.
export function useAnchoredMenu(isOpen: boolean) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Recompute continuously while open, not just once on open. The trigger
  // can sit in a sticky bar or a scrolling drawer, so its viewport position
  // keeps changing — without this, the menu stays pinned to wherever the
  // button happened to be the instant it was clicked, and visibly detaches
  // from it on any subsequent scroll.
  useLayoutEffect(() => {
    if (!isOpen) {
      setRect(null);
      return;
    }
    const update = () => {
      if (anchorRef.current) setRect(anchorRef.current.getBoundingClientRect());
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen]);

  return { anchorRef, rect };
}
