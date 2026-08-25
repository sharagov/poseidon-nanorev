import { Scene } from "@/components/wizard/scene";
import { StepBody } from "@/components/wizard/step-body";
import { SuccessIcon } from "@/components/wizard/success-icon";

export function ThankYouStep() {
  return (
    <Scene>
      <StepBody
        scroll={
          <div className="space-y-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Thank you for using
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">
                Poseidon NanoRev test
              </h1>
            </div>
            <SuccessIcon />
            <p className="text-base font-medium">
              You&apos;re all set! You can close the app now. Please check
              your email or text messages for next steps with your care
              provider.
            </p>
          </div>
        }
      />
    </Scene>
  );
}
