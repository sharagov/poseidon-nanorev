import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createClient();

  const { data, error } = await supabase
    .from("registrations")
    .insert({
      first_name: body.first_name,
      last_name: body.last_name,
      date_of_birth: body.date_of_birth,
      email: body.email,
      phone: body.phone,
      physician_id: body.physician_id,
      current_step: "unbox",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ registration: data });
}
