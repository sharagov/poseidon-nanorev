// Strict parser for the device's voltammetry CSV export. The format is
// fixed (see brief): 6 header lines, a Test Name/Test Type pair, a 7-line
// Test Settings block, a 2-line SW Test block, a "Scan Data:" marker, the
// real column header, then exactly 200 sample rows. We parse strictly and
// throw on any deviation — a half-parsed curve is worse than no curve.

export type ParsedSample = {
  sample: number;
  d1Voltage: number;
  d1Current: number;
  d2Voltage: number;
  d2Current: number;
};

export type ParsedSettings = {
  startVoltage: string;
  stopVoltage: string;
  amplitude: string;
  frequency: string;
  startDelay: string;
  switchDelay: string;
  delayControl: string;
  mode: string;
  measurementRange: string;
};

export type ParsedCsv = {
  header: {
    title: string;
    filename: string;
    firmwareVersion: string;
    softwareVersion: string;
    date: string;
    dacZero: string;
    testName: string;
    testType: string;
  };
  settings: ParsedSettings;
  samples: ParsedSample[];
};

const EXPECTED_SAMPLE_COUNT = 200;
const KEY_VALUE_SEPARATOR = ":  ";

export class CsvParseError extends Error {
  constructor(message: string) {
    super(`CSV parse error: ${message}`);
    this.name = "CsvParseError";
  }
}

function splitKeyValue(line: string, expectedKey?: string): [string, string] {
  const sepIndex = line.indexOf(KEY_VALUE_SEPARATOR);
  if (sepIndex === -1) {
    throw new CsvParseError(
      `expected "Key${KEY_VALUE_SEPARATOR}Value" on line: ${JSON.stringify(line)}`
    );
  }
  const key = line.slice(0, sepIndex).trim();
  const value = line.slice(sepIndex + KEY_VALUE_SEPARATOR.length).trim();
  if (expectedKey && key !== expectedKey) {
    throw new CsvParseError(`expected key "${expectedKey}", got "${key}"`);
  }
  return [key, value];
}

function requireLine(lines: string[], index: number, context: string): string {
  const line = lines[index];
  if (line === undefined) {
    throw new CsvParseError(`missing line ${index + 1} (${context})`);
  }
  return line;
}

export function parseResultCsv(raw: string): ParsedCsv {
  const lines = raw.split(/\r\n|\n/).filter((_, i, arr) => {
    // Drop a single trailing empty line from a final newline, keep interior blanks.
    return !(i === arr.length - 1 && arr[i] === "");
  });

  if (lines.length < 22) {
    throw new CsvParseError(
      `file too short (${lines.length} lines) to contain the full header + 200 samples`
    );
  }

  const title = requireLine(lines, 0, "title").trim();
  const [, filename] = splitKeyValue(requireLine(lines, 1, "Filename"), "Filename");
  const [, firmwareVersion] = splitKeyValue(
    requireLine(lines, 2, "Firmware Version"),
    "Firmware Version"
  );
  const [, softwareVersion] = splitKeyValue(
    requireLine(lines, 3, "Software Version"),
    "Software Version"
  );
  const [, date] = splitKeyValue(requireLine(lines, 4, "Date"), "Date");
  const [, dacZero] = splitKeyValue(requireLine(lines, 5, "DAC Zero"), "DAC Zero");

  const [, testName] = splitKeyValue(requireLine(lines, 6, "Test Name"), "Test Name");
  const [, testType] = splitKeyValue(requireLine(lines, 7, "Test Type"), "Test Type");

  const testSettingsHeader = requireLine(lines, 8, "Test Settings header").trim();
  if (testSettingsHeader !== "Test Settings:") {
    throw new CsvParseError(
      `expected "Test Settings:" header on line 9, got ${JSON.stringify(testSettingsHeader)}`
    );
  }

  const settingsBlock: Record<string, string> = {};
  for (let i = 9; i < 16; i++) {
    const [key, value] = splitKeyValue(requireLine(lines, i, "Test Settings block"));
    settingsBlock[key] = value;
  }

  const swTestHeader = requireLine(lines, 16, "SW Test header").trim();
  if (swTestHeader !== "SW Test:") {
    throw new CsvParseError(
      `expected "SW Test:" header on line 17, got ${JSON.stringify(swTestHeader)}`
    );
  }

  const swTestBlock: Record<string, string> = {};
  for (let i = 17; i < 19; i++) {
    const [key, value] = splitKeyValue(requireLine(lines, i, "SW Test block"));
    swTestBlock[key] = value;
  }

  const scanDataMarker = requireLine(lines, 19, "Scan Data marker").trim();
  if (scanDataMarker !== "Scan Data:,Difference 1,,Difference 2,,") {
    throw new CsvParseError(
      `expected the Scan Data marker line, got ${JSON.stringify(scanDataMarker)}`
    );
  }

  const sampleHeader = requireLine(lines, 20, "sample header").trim();
  if (sampleHeader !== "Sample,Voltage (V),Current (uA),Voltage (V),Current (uA)") {
    throw new CsvParseError(
      `expected the sample column header, got ${JSON.stringify(sampleHeader)}`
    );
  }

  const sampleLines = lines.slice(21).filter((l) => l.trim() !== "");
  if (sampleLines.length !== EXPECTED_SAMPLE_COUNT) {
    throw new CsvParseError(
      `expected exactly ${EXPECTED_SAMPLE_COUNT} sample rows, found ${sampleLines.length}`
    );
  }

  const samples: ParsedSample[] = sampleLines.map((line, i) => {
    const cols = line.split(",");
    if (cols.length !== 5) {
      throw new CsvParseError(
        `sample row ${i + 1} has ${cols.length} columns, expected 5: ${JSON.stringify(line)}`
      );
    }
    const [sample, d1v, d1i, d2v, d2i] = cols.map((c) => Number(c.trim()));
    if ([sample, d1v, d1i, d2v, d2i].some((n) => Number.isNaN(n))) {
      throw new CsvParseError(`sample row ${i + 1} has a non-numeric value: ${line}`);
    }
    return { sample, d1Voltage: d1v, d1Current: d1i, d2Voltage: d2v, d2Current: d2i };
  });

  const requiredSettings = [
    "Start Voltage",
    "Stop Voltage",
    "Amplitude",
    "Frequency",
    "Start Delay",
    "Switch Delay",
    "Delay Control",
  ];
  for (const key of requiredSettings) {
    if (!(key in settingsBlock)) {
      throw new CsvParseError(`missing "${key}" in Test Settings block`);
    }
  }
  for (const key of ["Mode", "Measurement Range"]) {
    if (!(key in swTestBlock)) {
      throw new CsvParseError(`missing "${key}" in SW Test block`);
    }
  }

  return {
    header: {
      title,
      filename,
      firmwareVersion,
      softwareVersion,
      date,
      dacZero,
      testName,
      testType,
    },
    settings: {
      startVoltage: settingsBlock["Start Voltage"],
      stopVoltage: settingsBlock["Stop Voltage"],
      amplitude: settingsBlock["Amplitude"],
      frequency: settingsBlock["Frequency"],
      startDelay: settingsBlock["Start Delay"],
      switchDelay: settingsBlock["Switch Delay"],
      delayControl: settingsBlock["Delay Control"],
      mode: swTestBlock["Mode"],
      measurementRange: swTestBlock["Measurement Range"],
    },
    samples,
  };
}
