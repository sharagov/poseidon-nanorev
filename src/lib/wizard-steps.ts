export type StepId =
  | "welcome"
  | "register"
  | "unbox"
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
  | "return-kit"
  | "thank-you";

export const STEP_OF: Record<StepId, number> = {
  welcome: 0,
  register: 1,
  unbox: 2,
  "power-on": 3,
  pair: 4,
  pairing: 4,
  paired: 4,
  initialize: 5,
  initializing: 5,
  initialized: 5,
  "collect-sample": 6,
  "fill-tube": 7,
  filling: 7,
  "tube-filled": 7,
  testing: 8,
  "testing-prep": 8,
  "testing-progress": 8,
  "testing-complete": 8,
  "return-kit": 9,
  "thank-you": 9,
};

export const TOTAL_STEPS = 9;

export const STEP_IMAGE: Record<StepId, string> = {
  welcome: "/images/00-welcome.jpg",
  register: "/images/00-welcome.jpg",
  unbox: "/images/02-unbox.jpg",
  "power-on": "/images/03-power-on.jpg",
  pair: "/images/04-pair.jpg",
  pairing: "/images/04-pair.jpg",
  paired: "/images/05-paired.jpg",
  initialize: "/images/05-paired.jpg",
  initializing: "/images/05-paired.jpg",
  initialized: "/images/05-paired.jpg",
  "collect-sample": "/images/06-collect.jpg",
  "fill-tube": "/images/07-fill-tube.jpg",
  filling: "/images/08-tube-filled.jpg",
  "tube-filled": "/images/08-tube-filled.jpg",
  testing: "/images/09-testing.jpg",
  "testing-prep": "/images/10-testing-progress.jpg",
  "testing-progress": "/images/10-testing-progress.jpg",
  "testing-complete": "/images/10-testing-progress.jpg",
  "return-kit": "/images/11-return-kit.jpg",
  "thank-you": "/images/11-return-kit.jpg",
};

export const STEP_IMAGE_POSITION: Partial<Record<StepId, string>> = {
  welcome: "center 58%",
};

export const UNBOX_ITEMS = [
  "Poseidon device",
  "Sealed bag",
  "Urine collection cup",
  "Return box",
  "Sample tube",
  "Return receipt",
  "Auto injector",
];
