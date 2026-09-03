"use client";

// TEMPORARY, for live demo/testing purposes only — lets testers skip a
// real wait (the phase-2 gate, or any in-app timer) without sitting
// through it. Deliberately not gated behind NODE_ENV, unlike DevPanel,
// because it needs to work in the build testers actually use. Remove
// once real-hardware timing lands and this kind of testing is no longer
// needed.
export function DemoSkipButton({ onSkip }: { onSkip: () => void }) {
  return (
    <button
      type="button"
      onClick={onSkip}
      className="fixed bottom-3 left-3 z-50 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white shadow-lg"
    >
      Skip wait (demo)
    </button>
  );
}
