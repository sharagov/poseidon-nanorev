import { Physician, Registration } from "@/lib/types";

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
