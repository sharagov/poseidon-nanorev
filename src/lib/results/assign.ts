import { readFileSync } from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { RESULT_FILES, outcomeForFile } from "./file-registry";
import { parseResultCsv, CsvParseError } from "./csv-parser";

const FILES_DIR = path.join(process.cwd(), "src", "lib", "results", "files");

function readResultFile(fileName: string): string {
  return readFileSync(path.join(FILES_DIR, fileName), "utf8");
}

/**
 * Assigns one of the four device files to a registration when its test
 * starts. Idempotent — if a result already exists for this customer
 * (e.g. a retried request), it's left untouched rather than re-drawn, so
 * "same customer always sees the same run, every reload" holds even
 * across duplicate calls.
 */
export async function assignResultFile(customerId: string): Promise<void> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("results")
    .select("id")
    .eq("customer_id", customerId)
    .maybeSingle();
  if (existing) return;

  const allFileNames = RESULT_FILES.map((f) => f.fileName);
  const { data: fileName, error: drawError } = await supabase.rpc(
    "draw_next_result_file",
    { all_files: allFileNames }
  );
  if (drawError || !fileName) {
    throw new Error(`Failed to draw a result file: ${drawError?.message}`);
  }

  const outcome = outcomeForFile(fileName);
  const rawCsv = readResultFile(fileName);

  let runDate: string | null = null;
  let parsed: unknown = null;
  let parseError: string | null = null;
  try {
    const result = parseResultCsv(rawCsv);
    parsed = result;
    const d = new Date(result.header.date);
    runDate = Number.isNaN(d.getTime()) ? null : d.toISOString();
  } catch (err) {
    parseError = err instanceof CsvParseError ? err.message : String(err);
  }

  const { error: insertError } = await supabase.from("results").insert({
    customer_id: customerId,
    file_name: fileName,
    outcome,
    run_date: runDate,
    raw_csv: rawCsv,
    parsed,
    parse_error: parseError,
  });
  if (insertError) {
    throw new Error(`Failed to create result row: ${insertError.message}`);
  }
}

/** Marks the customer's result as revealed (called when the test completes). */
export async function completeResult(customerId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("results")
    .update({ completed_at: new Date().toISOString() })
    .eq("customer_id", customerId)
    .is("completed_at", null);
  if (error) {
    throw new Error(`Failed to complete result: ${error.message}`);
  }
}

/**
 * Admin override: force-assign a specific file to a customer, replacing
 * any existing result. Used for demos ("Sean will demo the invalid path
 * on command").
 */
export async function overrideResultFile(
  customerId: string,
  fileName: string
): Promise<void> {
  const supabase = await createClient();

  const outcome = outcomeForFile(fileName);
  const rawCsv = readResultFile(fileName);

  let runDate: string | null = null;
  let parsed: unknown = null;
  let parseError: string | null = null;
  try {
    const result = parseResultCsv(rawCsv);
    parsed = result;
    const d = new Date(result.header.date);
    runDate = Number.isNaN(d.getTime()) ? null : d.toISOString();
  } catch (err) {
    parseError = err instanceof CsvParseError ? err.message : String(err);
  }

  const { data: existing } = await supabase
    .from("results")
    .select("id, completed_at")
    .eq("customer_id", customerId)
    .maybeSingle();

  const { error } = await supabase.from("results").upsert(
    {
      customer_id: customerId,
      file_name: fileName,
      outcome,
      run_date: runDate,
      raw_csv: rawCsv,
      parsed,
      parse_error: parseError,
      // Keep completed_at as-is if the result was already revealed;
      // overriding an unrevealed result keeps it unrevealed.
      completed_at: existing?.completed_at ?? null,
    },
    { onConflict: "customer_id" }
  );
  if (error) {
    throw new Error(`Failed to override result: ${error.message}`);
  }
}
