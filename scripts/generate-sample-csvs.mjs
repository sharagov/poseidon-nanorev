// One-off generator for placeholder device CSVs, in the exact format the
// real device is supposed to emit (see AGENTS brief §7). Sean will replace
// these with real exports; until then these unblock building everything
// downstream (parser, list, detail, chart, assignment).
import { writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "src", "lib", "results", "files");
mkdirSync(outDir, { recursive: true });

const SEP = ":  "; // colon + two spaces, per spec

function header({ filename, date, testType }) {
  return [
    "Squarewave Voltammetry Test Data",
    `Filename${SEP}${filename}`,
    `Firmware Version${SEP}1.4.2`,
    `Software Version${SEP}2.7.0`,
    `Date${SEP}${date}`,
    `DAC Zero${SEP}2048`,
    `Test Name${SEP}Poseidon NanoRev`,
    `Test Type${SEP}${testType}`,
    "Test Settings:",
    `Start Voltage${SEP}-0.800 V`,
    `Stop Voltage${SEP}0.800 V`,
    `Amplitude${SEP}0.050 V`,
    `Frequency${SEP}15 Hz / cycle`,
    `Start Delay${SEP}2.0 s`,
    `Switch Delay${SEP}0.010 s`,
    `Delay Control${SEP}Auto`,
    "SW Test:",
    `Mode${SEP}Square wave`,
    `Measurement Range${SEP}±11.75 uA`,
  ];
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

// Deterministic pseudo-noise so regenerating gives identical files.
function noise(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x) - 0.5;
}

function buildSamples({ bumpHeight, riseHeight, mirrorScale, seedOffset }) {
  const start = -0.8;
  const stop = 0.8;
  const n = 200;
  const rows = [];
  for (let i = 0; i < n; i++) {
    const v = start + ((stop - start) * i) / (n - 1);
    const bump = bumpHeight * Math.exp(-((v - 0.05) ** 2) / (2 * 0.06 ** 2));
    const rise = riseHeight * sigmoid((v - 0.5) / 0.12);
    const d1 = 0.3 + bump + rise + noise(i + seedOffset) * 0.08;
    const d2 = -0.3 * mirrorScale - mirrorScale * (bump + rise) + noise(i + seedOffset + 500) * 0.08;
    rows.push(
      [i + 1, v.toFixed(4), d1.toFixed(4), v.toFixed(4), d2.toFixed(4)].join(",")
    );
  }
  return rows;
}

function buildFile({ filename, date, testType, samples }) {
  const lines = [
    ...header({ filename, date, testType }),
    "Scan Data:,Difference 1,,Difference 2,,",
    "Sample,Voltage (V),Current (uA),Voltage (V),Current (uA)",
    ...samples,
  ];
  return lines.join("\n") + "\n";
}

// clear — matches the brief's reference description almost exactly:
// D1 peaks ~2.0 near +0.05V, rises to ~5.3 above +0.5V; D2 mirrors to ~-4.9.
const clearSamples = buildSamples({
  bumpHeight: 1.7,
  riseHeight: 5.4,
  mirrorScale: 0.93,
  seedOffset: 1,
});
writeFileSync(
  path.join(outDir, "SW_2026_08_22_0906.csv"),
  buildFile({
    filename: "SW_2026_08_22_0906.csv",
    date: "8/22/2026 9:06:00 AM",
    testType: "SW",
    samples: clearSamples,
  })
);

// follow_up — a flatter, noisier run (still fully valid, 200 rows).
const followUpSamples = buildSamples({
  bumpHeight: 0.9,
  riseHeight: 2.6,
  mirrorScale: 0.7,
  seedOffset: 77,
});
writeFileSync(
  path.join(outDir, "SW_2026_08_16_0952.csv"),
  buildFile({
    filename: "SW_2026_08_16_0952.csv",
    date: "8/16/2026 9:52:00 AM",
    testType: "SW",
    samples: followUpSamples,
  })
);

// invalid — device wrote a partial curve (120 of 200 rows). Parser must
// reject this rather than chart half a curve.
const invalidSamples = buildSamples({
  bumpHeight: 1.2,
  riseHeight: 3.5,
  mirrorScale: 0.8,
  seedOffset: 21,
}).slice(0, 120);
writeFileSync(
  path.join(outDir, "SW_2026_08_13_0847.csv"),
  buildFile({
    filename: "SW_2026_08_13_0847.csv",
    date: "8/13/2026 8:47:00 AM",
    testType: "SW",
    samples: invalidSamples,
  })
);

// error — device stopped before writing any scan data at all: header only,
// no Scan Data section.
const errorLines = [
  ...header({
    filename: "SW_2026_08_11_0301.csv",
    date: "8/11/2026 3:01:00 AM",
    testType: "SW",
  }),
];
writeFileSync(path.join(outDir, "SW_2026_08_11_0301.csv"), errorLines.join("\n") + "\n");

console.log("Wrote 4 sample CSVs to", outDir);
