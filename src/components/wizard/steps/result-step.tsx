"use client";

import { useEffect, useState } from "react";
import { Scene } from "@/components/wizard/scene";
import { StepBody } from "@/components/wizard/step-body";
import { Button } from "@/components/ui/button";
import { fetchResult, fetchPhysicians } from "@/lib/api";
import { Physician, Registration } from "@/lib/types";
import { OUTCOMES } from "@/lib/results/outcomes";

// invalid and error both surface as the "unavailable" screen to the
// patient (Figma 16.2) — mirrors poseidon-admin's runDataUnavailable
// treatment, which groups these two outcomes as one "can't show a chart"
// case. clear/follow_up each get their own screen (16 / 16.1).
const BUTTONS: Record<
  "clear" | "follow_up" | "unavailable",
  { primary: string; secondary: string }
> = {
  clear: { primary: "View full report", secondary: "Done" },
  follow_up: { primary: "See what happens next", secondary: "Contact your physician" },
  unavailable: { primary: "Order a replacement kit", secondary: "Contact support" },
};

export function ResultStep({
  registration,
  onDone,
}: {
  registration: Registration;
  onDone: () => void;
}) {
  const [sentence, setSentence] = useState<string | null>(null);
  const [variant, setVariant] = useState<"clear" | "follow_up" | "unavailable" | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchResult(registration.id), fetchPhysicians()]).then(
      ([result, physicians]) => {
        if (cancelled || !result) return;
        const outcome = OUTCOMES[result.outcome];
        const physician = physicians.find(
          (p: Physician) => p.id === registration.physician_id
        );
        const physicianClause = physician
          ? `${physician.name} · ${physician.practice}`
          : "your physician";
        setSentence(
          outcome.patientSentence.replace("{physician}", physicianClause)
        );
        setVariant(
          result.outcome === "clear"
            ? "clear"
            : result.outcome === "follow_up"
              ? "follow_up"
              : "unavailable"
        );
      }
    );
    return () => {
      cancelled = true;
    };
  }, [registration.id, registration.physician_id]);

  const buttons = variant ? BUTTONS[variant] : null;

  return (
    <Scene stepId="result" title="Your result">
      <StepBody
        scroll={
          <div className="space-y-6 text-center">
            <p className="text-lg font-medium">
              {sentence ?? "Loading your result..."}
            </p>
          </div>
        }
        footer={
          buttons && (
            <div className="space-y-4">
              <Button size="lg" className="w-full" onClick={onDone}>
                {buttons.primary}
              </Button>
              <Button size="lg" variant="secondary" className="w-full" onClick={onDone}>
                {buttons.secondary}
              </Button>
            </div>
          )
        }
      />
    </Scene>
  );
}
