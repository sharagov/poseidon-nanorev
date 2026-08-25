"use client";

import { useEffect, useState } from "react";
import { Scene } from "@/components/wizard/scene";
import { StepBody } from "@/components/wizard/step-body";
import { RadialTimer } from "@/components/wizard/radial-timer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

export function TimerStep({
  eyebrow,
  title,
  message,
  warning,
  seconds,
  durationMs = seconds * 1000,
  onComplete,
}: {
  eyebrow: string;
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
    <Scene eyebrow={eyebrow} title={title}>
      <StepBody
        scroll={
          <div className="space-y-6 text-center">
            <p className="text-base font-medium">{message}</p>
            <div className="flex justify-center">
              <RadialTimer secondsLeft={secondsLeft} secondsTotal={seconds} />
            </div>
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
