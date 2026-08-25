"use client";

import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Scene({
  eyebrow,
  title,
  header,
  card = true,
  children,
}: {
  eyebrow?: string;
  title?: string;
  header?: ReactNode;
  card?: boolean;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setExpanded(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative min-h-dvh w-full">
      <div className="relative z-10 mx-auto w-full max-w-[584px] px-4 pt-16 sm:px-0">
        {header ?? (
          <>
            {eyebrow && (
              <p className="text-sm font-medium text-neutral-700">{eyebrow}</p>
            )}
            {title && (
              <h1 className="mt-1 text-2xl font-semibold text-neutral-900">
                {title}
              </h1>
            )}
          </>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[584px] px-4 sm:px-0">
        {card ? (
          <div
            className={cn(
              "grid items-end overflow-hidden transition-[grid-template-rows] duration-1000 ease-out",
              expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <div className="min-h-0 rounded-t-3xl bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
              <div className="px-5 pb-10 pt-10 sm:px-14">{children}</div>
            </div>
          </div>
        ) : (
          <div className="px-5 pb-10 sm:px-14">{children}</div>
        )}
      </div>
    </div>
  );
}
