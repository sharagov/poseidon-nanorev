"use client";

import { ReactNode, useContext } from "react";
import { createPortal } from "react-dom";
import { WizardCardPortalContext } from "@/components/wizard/wizard-card";
import { WizardHeaderPortalContext } from "@/components/wizard/wizard-header";

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
  const cardPortalNode = useContext(WizardCardPortalContext);
  const headerPortalNode = useContext(WizardHeaderPortalContext);

  const headerContent = header ?? (
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
  );

  return (
    <>
      {headerPortalNode && createPortal(headerContent, headerPortalNode)}

      {card ? (
        cardPortalNode && createPortal(children, cardPortalNode)
      ) : (
        <div className="absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[584px] px-4 sm:px-0">
          <div className="px-5 pb-10 sm:px-14">{children}</div>
        </div>
      )}
    </>
  );
}
