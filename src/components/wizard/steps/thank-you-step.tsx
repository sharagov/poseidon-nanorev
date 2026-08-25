import { Scene } from "@/components/wizard/scene";
import { StepBody } from "@/components/wizard/step-body";
import { SuccessIcon } from "@/components/wizard/success-icon";

export function ThankYouStep() {
  return (
    <Scene
      header={
        <div className="text-center">
          <p className="text-sm text-neutral-700">Thank you for using</p>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Poseidon NanoRev test
          </h1>
        </div>
      }
    >
      <StepBody
        scroll={
          <div className="space-y-6 text-center">
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
