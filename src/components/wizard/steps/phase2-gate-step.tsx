"use client";

import { useEffect, useState } from "react";
import { Scene } from "@/components/wizard/scene";
import { StepBody } from "@/components/wizard/step-body";
import { Button } from "@/components/ui/button";

// Real, timestamp-based wait — not a fixed-duration timer like TimerStep.
// completedAt + durationMs is the moment the patient may continue;
// recomputing from that timestamp (rather than counting down from a
// local start) means a page reload mid-wait still shows the correct
// remaining time instead of resetting the clock.
export function Phase2GateStep({
  completedAt,
  durationMs,
  onContinue,
}: {
  completedAt: string;
  durationMs: number;
  onContinue: () => void;
}) {
  const targetMs = new Date(completedAt).getTime() + durationMs;
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, targetMs - Date.now())
  );

  useEffect(() => {
    // Recompute immediately (not just on the next tick) so a dev-tool
    // skip — which rewrites completedAt and re-renders with a new
    // targetMs — un-disables Continue right away instead of a second late.
    setRemainingMs(Math.max(0, targetMs - Date.now()));
    const interval = setInterval(() => {
      setRemainingMs(Math.max(0, targetMs - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetMs]);

  const ready = remainingMs <= 0;

  return (
    <Scene stepId="phase2-gate" title="Come back later">
      <StepBody
        scroll={
          <div className="space-y-6 text-center">
            <p className="text-lg font-medium">
              You&apos;re all set for now. Come back in 8 hours to pair your
              device and complete your test.
            </p>
          </div>
        }
        footer={
          <Button
            size="lg"
            className="w-full"
            disabled={!ready}
            onClick={onContinue}
          >
            Got it
          </Button>
        }
      />
    </Scene>
  );
}
