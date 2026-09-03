import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Matches the Figma spec exactly (node 32564:1383): a solid green-800
// circle with a plain white checkmark, not lucide's outlined CheckCircle2.
export function SuccessIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "mx-auto flex size-20 items-center justify-center rounded-full bg-green-800",
        className
      )}
    >
      <Check className="size-10 text-white" strokeWidth={2.5} />
    </div>
  );
}
