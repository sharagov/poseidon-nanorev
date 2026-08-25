"use client";

import {
  createContext,
  ReactNode,
  useLayoutEffect,
  useState,
} from "react";
import { cn } from "@/lib/utils";

// Scene portals each step's card content into this node so the card
// frame below never unmounts between steps — only its content and
// measured height change.
export const WizardCardPortalContext = createContext<HTMLDivElement | null>(
  null
);

// Reads the *natural* height a step's content wants, independent of
// however tall the card is currently rendering. Steps built with
// StepBody expose a scene-scroll-content node (unstretched, so its
// offsetHeight is always the true size) and an optional scene-footer
// node (the pinned button) — summing those, plus node's own padding
// and the gap between them, gives the honest target height even while
// the scroll region is actively clipped/scrolling. Falling back to
// node.scrollHeight (not offsetHeight — node is capped to the card's
// current height, so offsetHeight would just report that back) covers
// any content that isn't built with StepBody.
function measureNaturalHeight(node: HTMLDivElement): number {
  const scrollContent = node.querySelector<HTMLElement>(
    '[data-slot="scene-scroll-content"]'
  );
  const footer = node.querySelector<HTMLElement>('[data-slot="scene-footer"]');
  if (!scrollContent) return node.scrollHeight;

  const style = getComputedStyle(node);
  const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const body = node.querySelector<HTMLElement>('[data-slot="scene-body"]');
  const gap = body ? parseFloat(getComputedStyle(body).rowGap) || 0 : 0;
  const footerHeight = footer?.offsetHeight ?? 0;

  return (
    paddingY + scrollContent.offsetHeight + (footer ? gap : 0) + footerHeight
  );
}

export function WizardCard({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [entered, setEntered] = useState(false);
  const [height, setHeight] = useState<number | null>(null);

  // Slide in once when the card first becomes active; while it stays
  // active across step changes this effect doesn't re-run, so later
  // steps only ever resize — they never replay the entrance.
  useLayoutEffect(() => {
    if (!active) {
      setEntered(false);
      return;
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [active]);

  // Measure synchronously, in the same commit that swaps in a step's
  // content — `children` gets a new identity on every step change, so
  // this runs right after the new content lands in `node`, before paint.
  // Measuring only from the ResizeObserver below is one frame too late:
  // its first callback can fire while `node` is still empty (the old
  // step already portaled out, the new one not yet portaled in), which
  // animates the card down to ~0 before snapping back up.
  useLayoutEffect(() => {
    if (!node) return;
    setHeight(measureNaturalHeight(node));
  }, [node, children]);

  // Safety net for resizes that don't change `children`'s identity —
  // e.g. content reflowing after fonts/images finish loading.
  useLayoutEffect(() => {
    if (!node) return;
    const observer = new ResizeObserver(() => setHeight(measureNaturalHeight(node)));
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return (
    <>
      <div className="absolute inset-0 z-10 mx-auto w-full max-w-[584px] px-4 sm:px-0">
        {/*
          h-full + justify-end: the card no longer drives this box's
          height (it used to, when the box just shrink-wrapped it) —
          now the box always spans the full space available below the
          header, and the card sits at its bottom, capped by max-h-full
          when its natural height would otherwise exceed that space.
        */}
        <div className="flex h-full flex-col justify-end overflow-hidden">
          <div
            className={cn(
              "relative max-h-full shrink-0 rounded-t-3xl bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.08)] transition-[translate,height] duration-500 ease-out",
              entered ? "translate-y-0" : "translate-y-full"
            )}
            style={height !== null ? { height } : undefined}
          >
            {/*
              Fills the card exactly (not natural-height) so a step's
              StepBody can stretch to h-full inside it and let its own
              scroll region absorb any overflow, with the footer button
              pinned below — instead of the whole card overflowing the
              viewport with no way to reach the clipped-off part.
            */}
            <div
              ref={setNode}
              className="absolute inset-0 px-5 pb-10 pt-10 sm:px-14"
            />
          </div>
        </div>
      </div>
      <WizardCardPortalContext.Provider value={node}>
        {children}
      </WizardCardPortalContext.Provider>
    </>
  );
}
