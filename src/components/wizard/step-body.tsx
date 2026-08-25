import { ReactNode } from "react";

// Shared shape for card content: a scrollable region on top, and an
// optional footer (usually the primary button) pinned below it. The
// data-slot attributes are query targets wizard-card.tsx measures
// directly — see the comment there for why.
export function StepBody({
  scroll,
  footer,
}: {
  scroll: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div data-slot="scene-body" className="flex h-full flex-col gap-12">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div data-slot="scene-scroll-content">{scroll}</div>
      </div>
      {footer && (
        <div data-slot="scene-footer" className="shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
}
