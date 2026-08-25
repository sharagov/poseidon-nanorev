import { Scene } from "@/components/wizard/scene";
import { StepBody } from "@/components/wizard/step-body";
import { Button } from "@/components/ui/button";
import { SuccessIcon } from "@/components/wizard/success-icon";

export function TestingCompleteStep({
  onSendResults,
  submitting,
}: {
  onSendResults: () => void;
  submitting: boolean;
}) {
  return (
    <Scene eyebrow="Step 8 out of 9" title="Testing">
      <StepBody
        scroll={
          <div className="space-y-6 text-center">
            <SuccessIcon />
            <p className="text-base font-medium">
              Test is completed! Your sample was processed successfully. Data
              was transmitted to your selected care provider.
            </p>
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
            <Button size="lg" variant="secondary" className="w-full">
              View results
            </Button>
          </div>
        }
      />
    </Scene>
  );
}
