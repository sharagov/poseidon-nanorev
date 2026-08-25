import { Scene } from "@/components/wizard/scene";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <Scene
      card={false}
      header={
        <div className="space-y-4 text-center">
          <div>
            <p className="text-sm text-neutral-700">Welcome to your</p>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
              Poseidon NanoRev test
            </h1>
          </div>
          <Alert className="mx-auto inline-flex w-auto items-center gap-2 rounded-full border-none bg-white px-4 py-2 shadow-sm">
            <AlertCircle className="size-4" />
            <AlertDescription>Ensure all kit materials are nearby</AlertDescription>
          </Alert>
        </div>
      }
    >
      <Button size="lg" className="w-full" onClick={onNext}>
        Unbox &amp; start account setup
      </Button>
    </Scene>
  );
}
