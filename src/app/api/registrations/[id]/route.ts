import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assignResultFile, completeResult } from "@/lib/results/assign";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createClient();

  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ registration: data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const supabase = createClient();

  const { data, error } = await supabase
    .from("registrations")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fire-and-log: a result-assignment hiccup shouldn't block the wizard
  // from advancing (the patient's flow already succeeded above).
  if (body.test_started_at) {
    try {
      await assignResultFile(id);
    } catch (err) {
      console.error("assignResultFile failed", err);
    }
  }
  if (body.test_completed_at) {
    try {
      await completeResult(id);
    } catch (err) {
      console.error("completeResult failed", err);
    }
  }

  return NextResponse.json({ registration: data });
}
