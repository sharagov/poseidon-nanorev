"use client";

import { useState } from "react";
import { Scene } from "@/components/wizard/scene";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UNBOX_ITEMS, STEP_IMAGE } from "@/lib/wizard-steps";

export function UnboxStep({
  onNext,
  submitting,
}: {
  onNext: (checkedItems: string[]) => void;
  submitting: boolean;
}) {
  const [checked, setChecked] = useState<string[]>([UNBOX_ITEMS[0]]);

  const toggle = (item: string) =>
    setChecked((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );

  const allChecked = checked.length === UNBOX_ITEMS.length;

  return (
    <Scene eyebrow="Step 2 out of 9" title="Unbox your kit" image={STEP_IMAGE.unbox}>
      <div>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">
              Unbox your kit and confirm all items are included
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select items you found in your box
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {UNBOX_ITEMS.map((item) => (
              <div
                key={item}
                role="button"
                tabIndex={0}
                onClick={() => toggle(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(item);
                  }
                }}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-input px-4 py-3 text-left text-sm font-medium"
              >
                <span>{item}</span>
                <Checkbox checked={checked.includes(item)} />
              </div>
            ))}
          </div>
        </div>

        <Button
          size="lg"
          className="mt-12 w-full"
          disabled={!allChecked || submitting}
          onClick={() => onNext(checked)}
        >
          {submitting ? "Saving..." : "Continue"}
        </Button>
      </div>
    </Scene>
  );
}
