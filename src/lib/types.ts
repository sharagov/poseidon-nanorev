export type Physician = {
  id: string;
  name: string;
  practice: string;
};

export type Registration = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  email: string | null;
  phone: string | null;
  physician_id: string | null;
  current_step: string;
  unboxed_items: string[];
  unboxed_at: string | null;
  device_paired_at: string | null;
  device_initialized_at: string | null;
  sample_collected_at: string | null;
  tube_filled_at: string | null;
  test_started_at: string | null;
  test_completed_at: string | null;
  results_sent_at: string | null;
  phase2_completed_at: string | null;
  kit_returned_at: string | null;
  completed_at: string | null;
};

export type Outcome = "clear" | "follow_up" | "invalid" | "error";

export type Result = {
  id: string;
  customer_id: string;
  outcome: Outcome;
  completed_at: string | null;
};
