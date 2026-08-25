import { Scene } from "@/components/wizard/scene";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";

export function SimpleStep({
  eyebrow,
  title,
  message,
  warning,
  buttonLabel,
  onNext,
  loading,
  success,
  disabled,
}: {
  eyebrow: string;
  title: string;
  message: string;
  warning?: string;
  buttonLabel: string;
  onNext?: () => void;
  loading?: boolean;
  success?: boolean;
  disabled?: boolean;
}) {
  return (
    <Scene eyebrow={eyebrow} title={title}>
      <div className="text-center">
        <div className="space-y-6">
          {success && (
            <CheckCircle2 className="mx-auto size-14 text-emerald-600" />
          )}
          <p className="text-base font-medium">{message}</p>
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
        <Button
          size="lg"
          className="mt-12 w-full"
          variant={success ? "secondary" : "default"}
          onClick={onNext}
          disabled={disabled || loading}
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {buttonLabel}
        </Button>
      </div>
    </Scene>
  );
}
