"use client";

import { useEffect, useState } from "react";
import { Scene } from "@/components/wizard/scene";
import { RadialTimer } from "@/components/wizard/radial-timer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

export function TimerStep({
  eyebrow,
  title,
  image,
  message,
  warning,
  seconds,
  onComplete,
}: {
  eyebrow: string;
  title: string;
  image: string;
  message: string;
  warning?: string;
  seconds: number;
  onComplete: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(seconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete();
      return;
    }
    const timeout = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  return (
    <Scene eyebrow={eyebrow} title={title} image={image}>
      <div className="space-y-6 text-center">
        <p className="text-base font-medium">{message}</p>
        <div className="flex justify-center">
          <RadialTimer secondsLeft={secondsLeft} secondsTotal={seconds} />
        </div>
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
