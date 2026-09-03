import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Reads back the outcome assignResultFile/completeResult already wrote to
// the results table (see src/lib/results/assign.ts) — no new assignment
// logic here, just exposing it to the result-reveal step.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createClient();

  const { data, error } = await supabase
    .from("results")
    .select("id, customer_id, outcome, completed_at")
    .eq("customer_id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ result: data });
}
