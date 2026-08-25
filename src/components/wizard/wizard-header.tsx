"use client";

import { createContext, ReactNode, useState } from "react";

// Scene portals each step's eyebrow/title into this node so the header
// frame stays a stable, normally-flowed sibling above the card — this is
// what gives the card region below a real, capped available height.
export const WizardHeaderPortalContext = createContext<HTMLDivElement | null>(
  null
);

export function WizardHeader({ children }: { children: ReactNode }) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  return (
    <>
      <div
        ref={setNode}
        className="relative z-10 mx-auto w-full max-w-[584px] shrink-0 px-4 pt-16 sm:px-0"
      />
      <WizardHeaderPortalContext.Provider value={node}>
        {children}
      </WizardHeaderPortalContext.Provider>
    </>
  );
}
