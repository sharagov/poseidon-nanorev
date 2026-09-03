"use client";

import { useEffect, useState } from "react";
import { Scene } from "@/components/wizard/scene";
import { StepBody } from "@/components/wizard/step-body";
import { RadialTimer } from "@/components/wizard/radial-timer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { StepId } from "@/lib/wizard-steps";

export function TimerStep({
  stepId,
  title,
  message,
  warning,
  seconds,
  durationMs = seconds * 1000,
  onComplete,
}: {
  stepId: StepId;
  title: string;
  message: string;
  warning?: string;
  seconds: number;
  durationMs?: number;
  onComplete: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(seconds);
  const tickMs = durationMs / seconds;

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete();
      return;
    }
    const timeout = setTimeout(() => setSecondsLeft((s) => s - 1), tickMs);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  return (
    <Scene stepId={stepId} title={title}>
      <StepBody
        scroll={
          <div className="space-y-6 text-center">
            <p className="text-lg font-medium">{message}</p>
            <div className="flex justify-center">
              <RadialTimer secondsLeft={secondsLeft} secondsTotal={seconds} />
            </div>
            {warning && (
              <Alert
                variant="destructive"
                className="flex min-h-14 items-center justify-center gap-1.5 border-none bg-destructive/10 px-6 py-3 text-center *:[svg]:translate-y-0"
              >
                <TriangleAlert className="size-4 shrink-0" />
                <AlertDescription className="text-center text-base font-medium text-destructive">
                  {warning}
                </AlertDescription>
              </Alert>
            )}
          </div>
        }
      />
    </Scene>
  );
}
