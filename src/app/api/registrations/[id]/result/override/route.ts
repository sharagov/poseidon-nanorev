import { NextResponse } from "next/server";
import { RESULT_FILES } from "@/lib/results/file-registry";
import { overrideResultFile } from "@/lib/results/assign";
import { Outcome } from "@/lib/types";

// Dev-only demo tool (see testing-complete-step.tsx): force this
// registration's result to one of the four device files, so the next
// screen (and poseidon-admin, reading the same results table) show a
// specific outcome on command. Scoped by registration id, matching the
// GET result route — this app has no customer login to scope by instead.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const outcome = body.outcome as Outcome;

  const file = RESULT_FILES.find((f) => f.outcome === outcome);
  if (!file) {
    return NextResponse.json({ error: `Unknown outcome "${outcome}"` }, { status: 400 });
  }

  try {
    await overrideResultFile(id, file.fileName);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
