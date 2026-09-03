"use client";

import { useEffect } from "react";
import { Scene } from "@/components/wizard/scene";
import { StepBody } from "@/components/wizard/step-body";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { StepId } from "@/lib/wizard-steps";

export function WaitingStep({
  stepId,
  title,
  message,
  warning,
  durationMs,
  onComplete,
}: {
  stepId: StepId;
  title: string;
  message: string;
  warning?: string;
  durationMs: number;
  onComplete: () => void;
}) {
  useEffect(() => {
    const timeout = setTimeout(onComplete, durationMs);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Scene stepId={stepId} title={title}>
      <StepBody
        scroll={
          <div className="space-y-6 text-center">
            <p className="text-lg font-medium">{message}</p>
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
