import { Scene } from "@/components/wizard/scene";
import { StepBody } from "@/components/wizard/step-body";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SuccessIcon } from "@/components/wizard/success-icon";
import { Loader2, TriangleAlert } from "lucide-react";

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
      <StepBody
        scroll={
          <div className="space-y-6 text-center">
            {success && <SuccessIcon />}
            <p className="text-base font-medium">{message}</p>
            {warning && (
              <Alert
                variant="destructive"
                className="flex h-14 items-center justify-center gap-1.5 border-none bg-destructive/10 px-12 text-center *:[svg]:translate-y-0"
              >
                <TriangleAlert className="size-4" />
                <AlertDescription className="text-center text-destructive">
                  {warning}
                </AlertDescription>
              </Alert>
            )}
          </div>
        }
        footer={
          <Button
            size="lg"
            className="w-full"
            onClick={onNext}
            disabled={disabled || loading}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {buttonLabel}
          </Button>
        }
      />
    </Scene>
  );
}
