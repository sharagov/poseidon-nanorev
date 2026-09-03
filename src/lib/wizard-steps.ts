export type StepId =
  | "welcome"
  | "register"
  | "unbox"
  | "before-you-begin"
  | "confirm-device"
  | "insert-cartridge"
  | "position-mouthpiece"
  | "position-injector"
  | "unlock-administer"
  | "hold-in-place"
  | "remove-device"
  | "phase2-gate"
  | "power-on"
  | "pair"
  | "pairing"
  | "paired"
  | "initialize"
  | "initializing"
  | "initialized"
  | "collect-sample"
  | "fill-tube"
  | "filling"
  | "tube-filled"
  | "testing"
  | "testing-prep"
  | "testing-progress"
  | "testing-complete"
  | "result"
  | "return-kit"
  | "thank-you";

// Six named phases, per the Figma "Stepper n Title" component: a phase
// name + "Step N out of M" header row above a 6-segment progress bar.
// welcome/thank-you have no entry — they render without a stepper.
export type PhaseInfo = {
  phase: number;
  phaseName: string;
  stepIndexInPhase: number;
  totalStepsInPhase: number;
};

export const TOTAL_PHASES = 6;

export const PHASE_OF: Partial<Record<StepId, PhaseInfo>> = {
  register: { phase: 1, phaseName: "Phase 1: Setup", stepIndexInPhase: 1, totalStepsInPhase: 2 },
  unbox: { phase: 1, phaseName: "Phase 1: Setup", stepIndexInPhase: 2, totalStepsInPhase: 2 },

  "before-you-begin": { phase: 2, phaseName: "Phase 2: Treatment", stepIndexInPhase: 1, totalStepsInPhase: 7 },
  "confirm-device": { phase: 2, phaseName: "Phase 2: Treatment", stepIndexInPhase: 2, totalStepsInPhase: 7 },
  "insert-cartridge": { phase: 2, phaseName: "Phase 2: Treatment", stepIndexInPhase: 3, totalStepsInPhase: 7 },
  "position-mouthpiece": { phase: 2, phaseName: "Phase 2: Treatment", stepIndexInPhase: 4, totalStepsInPhase: 7 },
  "position-injector": { phase: 2, phaseName: "Phase 2: Treatment", stepIndexInPhase: 5, totalStepsInPhase: 7 },
  "unlock-administer": { phase: 2, phaseName: "Phase 2: Treatment", stepIndexInPhase: 6, totalStepsInPhase: 7 },
  "hold-in-place": { phase: 2, phaseName: "Phase 2: Treatment", stepIndexInPhase: 6, totalStepsInPhase: 7 },
  "remove-device": { phase: 2, phaseName: "Phase 2: Treatment", stepIndexInPhase: 7, totalStepsInPhase: 7 },
  "phase2-gate": { phase: 2, phaseName: "Phase 2: Treatment", stepIndexInPhase: 7, totalStepsInPhase: 7 },

  "power-on": { phase: 3, phaseName: "Phase 3: Collect", stepIndexInPhase: 1, totalStepsInPhase: 5 },
  pair: { phase: 3, phaseName: "Phase 3: Collect", stepIndexInPhase: 2, totalStepsInPhase: 5 },
  pairing: { phase: 3, phaseName: "Phase 3: Collect", stepIndexInPhase: 2, totalStepsInPhase: 5 },
  paired: { phase: 3, phaseName: "Phase 3: Collect", stepIndexInPhase: 2, totalStepsInPhase: 5 },
  initialize: { phase: 3, phaseName: "Phase 3: Collect", stepIndexInPhase: 3, totalStepsInPhase: 5 },
  initializing: { phase: 3, phaseName: "Phase 3: Collect", stepIndexInPhase: 3, totalStepsInPhase: 5 },
  initialized: { phase: 3, phaseName: "Phase 3: Collect", stepIndexInPhase: 3, totalStepsInPhase: 5 },
  "collect-sample": { phase: 3, phaseName: "Phase 3: Collect", stepIndexInPhase: 4, totalStepsInPhase: 5 },
  "fill-tube": { phase: 3, phaseName: "Phase 3: Collect", stepIndexInPhase: 5, totalStepsInPhase: 5 },
  filling: { phase: 3, phaseName: "Phase 3: Collect", stepIndexInPhase: 5, totalStepsInPhase: 5 },
  "tube-filled": { phase: 3, phaseName: "Phase 3: Collect", stepIndexInPhase: 5, totalStepsInPhase: 5 },

  testing: { phase: 4, phaseName: "Phase 4: Test", stepIndexInPhase: 1, totalStepsInPhase: 1 },
  "testing-prep": { phase: 4, phaseName: "Phase 4: Test", stepIndexInPhase: 1, totalStepsInPhase: 1 },
  "testing-progress": { phase: 4, phaseName: "Phase 4: Test", stepIndexInPhase: 1, totalStepsInPhase: 1 },
  "testing-complete": { phase: 4, phaseName: "Phase 4: Test", stepIndexInPhase: 1, totalStepsInPhase: 1 },

  result: { phase: 5, phaseName: "Phase 5: Result", stepIndexInPhase: 1, totalStepsInPhase: 1 },

  "return-kit": { phase: 6, phaseName: "Phase 6: Return", stepIndexInPhase: 1, totalStepsInPhase: 1 },
};

export const STEP_IMAGE: Record<StepId, string> = {
  welcome: "/images/00-welcome.jpg",
  register: "/images/00-welcome.jpg",
  unbox: "/images/02-unbox.jpg",
  "before-you-begin": "/images/13-before-you-begin.jpg",
  "confirm-device": "/images/14-confirm-device.jpg",
  "insert-cartridge": "/images/15-insert-cartridge.jpg",
  "position-mouthpiece": "/images/17-position-mouthpiece.jpg",
  "position-injector": "/images/12-phase2-device.jpg",
  "unlock-administer": "/images/12-phase2-device.jpg",
  "hold-in-place": "/images/12-phase2-device.jpg",
  "remove-device": "/images/12-phase2-device.jpg",
  "phase2-gate": "/images/19-phase2-gate.jpg",
  "power-on": "/images/03-power-on.jpg",
  pair: "/images/04-pair.jpg",
  pairing: "/images/04-pair.jpg",
  paired: "/images/05-paired.jpg",
  initialize: "/images/04-pair.jpg",
  initializing: "/images/04-pair.jpg",
  initialized: "/images/05-paired.jpg",
  "collect-sample": "/images/06-collect.jpg",
  "fill-tube": "/images/07-fill-tube.jpg",
  filling: "/images/20-filling.jpg",
  "tube-filled": "/images/08-tube-filled.jpg",
  testing: "/images/09-testing.jpg",
  "testing-prep": "/images/10-testing-progress.jpg",
  "testing-progress": "/images/10-testing-progress.jpg",
  "testing-complete": "/images/08-tube-filled.jpg",
  result: "/images/16-result-clear.jpg",
  "return-kit": "/images/11-return-kit.jpg",
  "thank-you": "/images/11-return-kit.jpg",
};

export const STEP_IMAGE_POSITION: Partial<Record<StepId, string>> = {
  welcome: "center 58%",
};

// The result step's background depends on the outcome, not the step id
// alone — see WizardBackground's imageOverride prop.
export const RESULT_IMAGE: Record<"clear" | "follow_up" | "unavailable", string> = {
  clear: "/images/16-result-clear.jpg",
  follow_up: "/images/16-result-followup.jpg",
  unavailable: "/images/16-result-unavailable.jpg",
};

export const UNBOX_ITEMS = [
  "POSEIDON device",
  "Sealed bag",
  "Urine collection cup",
  "Sample tube",
  "Return box",
  "Return receipt",
  "Auto-injector",
  "Dose cartridge",
  "Mouthpiece",
];
