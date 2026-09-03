import { Scene } from "@/components/wizard/scene";
import { StepBody } from "@/components/wizard/step-body";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SuccessIcon } from "@/components/wizard/success-icon";
import { Loader2, TriangleAlert } from "lucide-react";
import { StepId } from "@/lib/wizard-steps";

export function SimpleStep({
  stepId,
  title,
  message,
  list,
  warning,
  buttonLabel,
  onNext,
  loading,
  success,
  disabled,
}: {
  stepId: StepId;
  title: string;
  message: string;
  // Figma renders some cards as a header sentence followed by a numbered
  // list (e.g. "before-you-begin", "return-kit") rather than one paragraph.
  list?: string[];
  warning?: string;
  buttonLabel: string;
  onNext?: () => void;
  loading?: boolean;
  success?: boolean;
  disabled?: boolean;
}) {
  return (
    <Scene stepId={stepId} title={title}>
      <StepBody
        scroll={
          <div className="space-y-6">
            <div className={list ? "space-y-6" : "space-y-6 text-center"}>
              {success && <SuccessIcon />}
              <p className="text-lg font-medium">{message}</p>
              {list && (
                <ol className="list-decimal text-base">
                  {list.map((item, i) => (
                    <li key={i} className="ms-6">
                      {item}
                    </li>
                  ))}
                </ol>
              )}
            </div>
            {warning && (
              <Alert
                variant="destructive"
                className="flex min-h-14 items-center justify-center gap-1.5 border-none bg-destructive/10 px-6 py-3 text-center *:[svg]:translate-y-0"
              >
                <TriangleAlert className="size-4 shrink-0" />
                <AlertDescription className="text-center text-base font-medium text-destructive">
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
