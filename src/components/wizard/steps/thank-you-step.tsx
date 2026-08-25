import { Scene } from "@/components/wizard/scene";
import { CheckCircle2 } from "lucide-react";

export function ThankYouStep() {
  return (
    <Scene>
      <div className="space-y-4 text-center">
        <div>
          <p className="text-sm text-muted-foreground">Thank you for using</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Poseidon NanoRev test
          </h1>
        </div>
        <CheckCircle2 className="mx-auto size-14 text-emerald-700" />
        <p className="text-base font-medium">
          You&apos;re all set! You can close the app now. Please check your
          email or text messages for next steps with your care provider.
        </p>
      </div>
    </Scene>
  );
}
