"use client";

import { useState } from "react";
import { Scene } from "@/components/wizard/scene";
import { STEP_IMAGE } from "@/lib/wizard-steps";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function TestingCompleteStep({
  onSendResults,
  submitting,
}: {
  onSendResults: () => void;
  submitting: boolean;
}) {
  const [resultsOpen, setResultsOpen] = useState(false);

  return (
    <Scene
      eyebrow="Step 8 out of 9"
      title="Testing"
      image={STEP_IMAGE["testing-complete"]}
    >
      <div className="text-center">
        <div className="space-y-6">
          <CheckCircle2 className="mx-auto size-14 text-emerald-600" />
          <p className="text-base font-medium">
            Test is completed! Your sample was processed successfully. Data
            was transmitted to your selected care provider.
          </p>
        </div>
        <div className="mt-12 space-y-4">
          <Button
            size="lg"
            className="w-full"
            onClick={onSendResults}
            disabled={submitting}
          >
            {submitting ? "Sending..." : "Send results to your primary care physician"}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="w-full"
            onClick={() => setResultsOpen(true)}
          >
            View results
          </Button>
        </div>
      </div>

      <Dialog open={resultsOpen} onOpenChange={setResultsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your NanoRev results</DialogTitle>
            <DialogDescription>
              This is a demo summary — real results are reviewed by your
              physician before being shared.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border p-4 text-sm">
            <p className="font-medium">Sample status: Processed</p>
            <p className="mt-1 text-muted-foreground">
              No abnormal biomarkers detected in this demo sample.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Scene>
  );
}
