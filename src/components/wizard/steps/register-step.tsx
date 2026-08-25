"use client";

import { useEffect, useState, FormEvent } from "react";
import { Scene } from "@/components/wizard/scene";
import { STEP_IMAGE } from "@/lib/wizard-steps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPhysicians } from "@/lib/api";
import { Physician } from "@/lib/types";

export type RegisterFormValues = {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  physician_id: string;
};

export function RegisterStep({
  onSubmit,
  submitting,
  error,
  fillSignal,
}: {
  onSubmit: (values: RegisterFormValues) => void;
  submitting: boolean;
  error: string | null;
  fillSignal?: number;
}) {
  const [physicians, setPhysicians] = useState<Physician[]>([]);
  const [values, setValues] = useState<RegisterFormValues>({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    email: "",
    phone: "",
    physician_id: "",
  });

  useEffect(() => {
    fetchPhysicians().then(setPhysicians);
  }, []);

  const [lastFillSignal, setLastFillSignal] = useState(fillSignal);
  if (fillSignal !== undefined && fillSignal !== lastFillSignal) {
    setLastFillSignal(fillSignal);
    setValues({
      first_name: "John",
      last_name: "Doe",
      date_of_birth: "1990-01-15",
      email: "john.doe@example.com",
      phone: "555-0100",
      physician_id: physicians[0]?.id ?? "",
    });
  }

  const update = (key: keyof RegisterFormValues, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Scene
      eyebrow="Step 1 out of 9"
      title="Register device from MCED kit & create account"
      image={STEP_IMAGE.register}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">
              Enter your details and select your primary care provider
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your results are encrypted and shared only with the physician
              you choose.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name</Label>
              <Input
                id="first_name"
                required
                value={values.first_name}
                onChange={(e) => update("first_name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input
                id="last_name"
                required
                value={values.last_name}
                onChange={(e) => update("last_name", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              required
              value={values.date_of_birth}
              onChange={(e) => update("date_of_birth", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Add your email"
                required
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Add your phone number"
                required
                value={values.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="physician">Primary care physician</Label>
            <Select
              required
              value={values.physician_id}
              onValueChange={(v) => update("physician_id", v)}
            >
              <SelectTrigger id="physician" className="w-full">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {physicians.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.practice}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <Button size="lg" type="submit" className="mt-12 w-full" disabled={submitting}>
          {submitting ? "Saving..." : "Continue"}
        </Button>
      </form>
    </Scene>
  );
}
