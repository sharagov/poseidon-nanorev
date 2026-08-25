import { Scene } from "@/components/wizard/scene";
import { STEP_IMAGE } from "@/lib/wizard-steps";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <Scene image={STEP_IMAGE.welcome}>
      <div className="mb-8 space-y-4 text-center">
        <div>
          <p className="text-sm text-muted-foreground">Welcome to your</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Poseidon NanoRev test
          </h1>
        </div>
        <Alert className="inline-flex w-auto items-center gap-2 rounded-full border-none bg-muted px-4 py-2">
          <AlertCircle className="size-4" />
          <AlertDescription>Ensure all kit materials are nearby</AlertDescription>
        </Alert>
      </div>
      <Button size="lg" className="w-full" onClick={onNext}>
        Unbox &amp; start account setup
      </Button>
    </Scene>
  );
}
