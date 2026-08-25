"use client";

import { useEffect } from "react";
import { Scene } from "@/components/wizard/scene";
import { StepBody } from "@/components/wizard/step-body";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

export function WaitingStep({
  eyebrow,
  title,
  message,
  warning,
  durationMs,
  onComplete,
}: {
  eyebrow: string;
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
    <Scene eyebrow={eyebrow} title={title}>
      <StepBody
        scroll={
          <div className="space-y-6 text-center">
            <p className="text-base font-medium">{message}</p>
            {warning && (
              <Alert
                variant="destructive"
                className="flex h-14 items-center justify-center gap-1.5 border-none bg-destructive/10 px-12 text-center *:[svg]:translate-y-0"
              >
                <TriangleAlert className="size-4" />
                <AlertDescription className="text-center text-destructive">
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
