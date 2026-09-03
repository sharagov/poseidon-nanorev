"use client";

import { useState } from "react";
import { Scene } from "@/components/wizard/scene";
import { StepBody } from "@/components/wizard/step-body";
import { Button } from "@/components/ui/button";
import { SuccessIcon } from "@/components/wizard/success-icon";
import { overrideResult } from "@/lib/api";
import { Outcome } from "@/lib/types";
import { OUTCOMES } from "@/lib/results/outcomes";

const DEMO_OUTCOMES: Outcome[] = ["clear", "follow_up", "error", "invalid"];

export function TestingCompleteStep({
  registrationId,
  onSendResults,
  onViewResults,
  submitting,
}: {
  registrationId: string | null;
  onSendResults: () => void;
  onViewResults: () => void;
  submitting: boolean;
}) {
  return (
    <Scene stepId="testing-complete" title="Testing">
      <StepBody
        scroll={
          <div className="space-y-6 text-center">
            <SuccessIcon />
            <p className="text-lg font-medium">
              Test is completed! Your sample was processed successfully. Data
              was transmitted to your selected care provider.
            </p>
            {process.env.NODE_ENV !== "production" && (
              <OutcomeOverride registrationId={registrationId} />
            )}
          </div>
        }
        footer={
          <div className="space-y-4">
            <Button
              size="lg"
              className="w-full"
              onClick={onSendResults}
              disabled={submitting}
            >
              {submitting ? (
                "Sending..."
              ) : (
                <>
                  <span className="sm:hidden">Send results to physician</span>
                  <span className="hidden sm:inline">
                    Send results to your primary care physician
                  </span>
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="w-full"
              onClick={onViewResults}
            >
              View results
            </Button>
          </div>
        }
      />
    </Scene>
  );
}

// Dev-only demo tool: force this registration's result to a specific
// outcome (one of the four demo device files), so the result step this
// session is about to see — and poseidon-admin, reading the same
// `results` table — both reflect it. Ports poseidon-admin's own
// overrideResultFile action; see src/lib/results/assign.ts.
function OutcomeOverride({ registrationId }: { registrationId: string | null }) {
  const [pending, setPending] = useState<Outcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<Outcome | null>(null);

  const apply = async (outcome: Outcome) => {
    if (!registrationId) return;
    setPending(outcome);
    setError(null);
    try {
      await overrideResult(registrationId, outcome);
      setApplied(outcome);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to override result");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="rounded-lg border border-dashed border-fuchsia-500 bg-fuchsia-950/5 p-3 text-left text-xs">
      <p className="font-semibold text-fuchsia-600">DEV: force result outcome</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {DEMO_OUTCOMES.map((outcome) => (
          <button
            key={outcome}
            type="button"
            onClick={() => apply(outcome)}
            disabled={!registrationId || pending !== null}
            className="rounded bg-fuchsia-600 px-2 py-1 font-medium text-white hover:bg-fuchsia-500 disabled:opacity-50"
          >
            {pending === outcome ? "Applying..." : OUTCOMES[outcome].label}
          </button>
        ))}
      </div>
      {applied && !error && (
        <p className="mt-2 text-muted-foreground">
          Result overridden to &ldquo;{OUTCOMES[applied].label}&rdquo; — the next screen will show it.
        </p>
      )}
      {error && <p className="mt-2 text-destructive">{error}</p>}
    </div>
  );
}
