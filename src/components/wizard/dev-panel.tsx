"use client";

import { useState } from "react";
import { StepId } from "@/lib/wizard-steps";

const ALL_STEPS: StepId[] = [
  "welcome",
  "register",
  "unbox",
  "before-you-begin",
  "confirm-device",
  "insert-cartridge",
  "position-mouthpiece",
  "position-injector",
  "unlock-administer",
  "hold-in-place",
  "remove-device",
  "phase2-gate",
  "power-on",
  "pair",
  "pairing",
  "paired",
  "initialize",
  "initializing",
  "initialized",
  "collect-sample",
  "fill-tube",
  "filling",
  "tube-filled",
  "testing",
  "testing-prep",
  "testing-progress",
  "testing-complete",
  "result",
  "return-kit",
  "thank-you",
];

const TIMER_STEPS = new Set<StepId>([
  "pairing",
  "initializing",
  "filling",
  "testing-prep",
  "testing-progress",
  "hold-in-place",
]);

export function DevPanel({
  step,
  onJump,
  onFillForm,
  onSkipTimer,
  onSkipPhase2Gate,
  onRestart,
}: {
  step: StepId;
  onJump: (step: StepId) => void;
  onFillForm: () => void;
  onSkipTimer: () => void;
  onSkipPhase2Gate: () => void;
  onRestart: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-3 right-3 z-50 rounded-full bg-fuchsia-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg"
      >
        DEV
      </button>
    );
  }

  return (
    <div className="fixed bottom-3 right-3 z-50 w-64 rounded-xl border border-fuchsia-500 bg-black/90 p-3 text-xs text-white shadow-xl">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-fuchsia-400">DEV TOOLS (test only)</span>
        <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
          ✕
        </button>
      </div>

      <div className="mb-2 flex flex-wrap gap-1.5">
        {step === "register" && (
          <button
            onClick={onFillForm}
            className="rounded bg-fuchsia-600 px-2 py-1 font-medium hover:bg-fuchsia-500"
          >
            Fill form
          </button>
        )}
        {TIMER_STEPS.has(step) && (
          <button
            onClick={onSkipTimer}
            className="rounded bg-fuchsia-600 px-2 py-1 font-medium hover:bg-fuchsia-500"
          >
            Skip timer
          </button>
        )}
        {step === "phase2-gate" && (
          <button
            onClick={onSkipPhase2Gate}
            className="rounded bg-fuchsia-600 px-2 py-1 font-medium hover:bg-fuchsia-500"
          >
            Skip timer
          </button>
        )}
        <button
          onClick={onRestart}
          className="rounded bg-red-700 px-2 py-1 font-medium hover:bg-red-600"
        >
          Restart flow
        </button>
      </div>

      <label className="mb-1 block text-white/60">Jump to step</label>
      <select
        value={step}
        onChange={(e) => onJump(e.target.value as StepId)}
        className="w-full rounded border border-white/20 bg-black px-2 py-1 text-white"
      >
        {ALL_STEPS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
