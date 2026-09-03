"use client";

import { useState } from "react";
import { Scene } from "@/components/wizard/scene";
import { StepBody } from "@/components/wizard/step-body";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UNBOX_ITEMS } from "@/lib/wizard-steps";

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
    <Scene stepId="unbox" title="Unbox your MCED kit">
      <StepBody
        scroll={
          <div className="space-y-6">
            <div className="space-y-0.5">
              <h2 className="text-lg font-medium">
                Unbox your MCED kit and confirm all items are included
              </h2>
              <p className="text-sm text-muted-foreground">
                Select items you found in your box
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  className="flex cursor-pointer items-center justify-between gap-2.5 rounded-lg border border-input px-3.5 py-2.5 text-left text-base font-medium"
                >
                  <span>{item}</span>
                  <Checkbox checked={checked.includes(item)} />
                </div>
              ))}
            </div>
          </div>
        }
        footer={
          <Button
            size="lg"
            className="w-full"
            disabled={!allChecked || submitting}
            onClick={() => onNext(checked)}
          >
            {submitting ? "Saving..." : "Continue"}
          </Button>
        }
      />
    </Scene>
  );
}
