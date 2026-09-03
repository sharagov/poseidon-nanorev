// Mirrors poseidon-admin/src/lib/results/outcomes.ts — keep these two
// copies in sync manually (the consumer app only needs patientSentence
// and label; badge styling and admin-only fields stay admin-side).
export type Outcome = "clear" | "follow_up" | "invalid" | "error";

export type OutcomeConfig = {
  label: string;
  /**
   * The exact sentence the patient saw in the consumer app. "{physician}"
   * is replaced with the registration's assigned physician ("Dr. Sarah
   * Chen · Bayview Family Medicine") where present, per the Figma copy.
   */
  patientSentence: string;
};

export const OUTCOMES: Record<Outcome, OutcomeConfig> = {
  clear: {
    label: "Clear",
    patientSentence:
      "No cancer signal detected. Your result has been shared with {physician}. Keep up with your regular screening schedule.",
  },
  follow_up: {
    label: "Follow up",
    patientSentence:
      "A cancer signal was detected. This is not a diagnosis. It means further testing is needed to find the source. {physician} has been notified and will contact you about next steps.",
  },
  invalid: {
    label: "Invalid",
    patientSentence:
      "We weren't able to process your sample. This can happen if the device didn't finish the test or the file couldn't be read. You'll need a replacement kit.",
  },
  // invalid and error both surface as the same "unavailable" screen to the
  // patient — mirrors poseidon-admin's runDataUnavailable treatment, which
  // groups these two outcomes as one "can't show a chart" case.
  error: {
    label: "Error",
    patientSentence:
      "We weren't able to process your sample. This can happen if the device didn't finish the test or the file couldn't be read. You'll need a replacement kit.",
  },
};
