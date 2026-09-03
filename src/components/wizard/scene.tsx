"use client";

import { ReactNode, useContext } from "react";
import { createPortal } from "react-dom";
import { WizardCardPortalContext } from "@/components/wizard/wizard-card";
import { WizardHeaderPortalContext } from "@/components/wizard/wizard-header";
import { Stepper } from "@/components/wizard/stepper";
import { StepId } from "@/lib/wizard-steps";

export function Scene({
  stepId,
  title,
  header,
  card = true,
  children,
}: {
  stepId?: StepId;
  title?: string;
  header?: ReactNode;
  card?: boolean;
  children: ReactNode;
}) {
  const cardPortalNode = useContext(WizardCardPortalContext);
  const headerPortalNode = useContext(WizardHeaderPortalContext);

  const headerContent =
    header ?? (stepId && title ? <Stepper stepId={stepId} title={title} /> : null);

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
