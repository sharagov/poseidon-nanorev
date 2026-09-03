import { PHASE_OF, StepId, TOTAL_PHASES } from "@/lib/wizard-steps";

// Figma "Stepper n Title": phase name + "Step N out of M" above a
// 6-segment progress bar (one segment per phase), with the step's title
// below. Completed phases render fully filled, future phases empty, and
// the current phase fills proportionally to progress through its steps.
export function Stepper({ stepId, title }: { stepId: StepId; title: string }) {
  const info = PHASE_OF[stepId];

  if (!info) {
    return <h1 className="text-3xl text-neutral-900">{title}</h1>;
  }

  const { phase, phaseName, stepIndexInPhase, totalStepsInPhase } = info;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xl font-medium text-neutral-700">{phaseName}</p>
        <p className="text-base text-neutral-700">
          Step {stepIndexInPhase} out of {totalStepsInPhase}
        </p>
      </div>
      <div className="mt-3 flex gap-1">
        {Array.from({ length: TOTAL_PHASES }, (_, i) => i + 1).map((segmentPhase) => (
          <div key={segmentPhase} className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${segmentFill(segmentPhase, phase, stepIndexInPhase, totalStepsInPhase) * 100}%`,
              }}
            />
          </div>
        ))}
      </div>
      <h1 className="mt-3 text-3xl text-neutral-900">{title}</h1>
    </div>
  );
}

function segmentFill(
  segmentPhase: number,
  currentPhase: number,
  stepIndexInPhase: number,
  totalStepsInPhase: number
): number {
  if (segmentPhase < currentPhase) return 1;
  if (segmentPhase > currentPhase) return 0;
  return (stepIndexInPhase - 1) / totalStepsInPhase;
}
