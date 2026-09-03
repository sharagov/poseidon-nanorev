export type Outcome = "clear" | "follow_up" | "invalid" | "error";

export type ResultFile = {
  fileName: string;
  outcome: Outcome;
};

// Static file → outcome mapping, per the brief: "the file contains no
// verdict — it's raw voltammetry. Sean owes us the mapping ... build it as
// configuration, not logic." These 4 are placeholders (Sean's real files
// will replace them; only the mapping below and the files on disk need to
// change, nothing else).
export const RESULT_FILES: ResultFile[] = [
  { fileName: "SW_2026_08_22_0906.csv", outcome: "clear" },
  { fileName: "SW_2026_08_16_0952.csv", outcome: "follow_up" },
  { fileName: "SW_2026_08_13_0847.csv", outcome: "invalid" },
  { fileName: "SW_2026_08_11_0301.csv", outcome: "error" },
];

export function outcomeForFile(fileName: string): Outcome {
  const match = RESULT_FILES.find((f) => f.fileName === fileName);
  if (!match) {
    throw new Error(`No outcome configured for result file "${fileName}"`);
  }
  return match.outcome;
}
