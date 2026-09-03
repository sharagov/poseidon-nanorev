import { Outcome, Physician, Registration, Result } from "@/lib/types";

export async function fetchPhysicians(): Promise<Physician[]> {
  const res = await fetch("/api/physicians");
  const json = await res.json();
  return json.physicians ?? [];
}

export async function createRegistration(payload: {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  physician_id: string;
}): Promise<Registration> {
  const res = await fetch("/api/registrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to create registration");
  return json.registration;
}

export async function fetchRegistration(id: string): Promise<Registration> {
  const res = await fetch(`/api/registrations/${id}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to load registration");
  return json.registration;
}

export async function fetchResult(id: string): Promise<Result | null> {
  const res = await fetch(`/api/registrations/${id}/result`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to load result");
  return json.result ?? null;
}

// Dev-only demo tool — see testing-complete-step.tsx and the override
// route it calls.
export async function overrideResult(id: string, outcome: Outcome): Promise<void> {
  const res = await fetch(`/api/registrations/${id}/result/override`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ outcome }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? "Failed to override result");
  }
}

export async function patchRegistration(
  id: string,
  payload: Record<string, unknown>
): Promise<Registration> {
  const res = await fetch(`/api/registrations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to update registration");
  return json.registration;
}
