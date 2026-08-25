"use client";

import { useEffect } from "react";
import { Scene } from "@/components/wizard/scene";
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
      <div className="space-y-6 text-center">
        <p className="text-base font-medium">{message}</p>
        {warning && (
          <Alert
            variant="destructive"
            className="border-none bg-destructive/10 text-center"
          >
            <TriangleAlert className="mx-auto size-4" />
            <AlertDescription className="text-center text-destructive">
              {warning}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Scene>
  );
}
