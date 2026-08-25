"use client";

import { useEffect, useState } from "react";
import { StepId } from "@/lib/wizard-steps";
import {
  createRegistration,
  fetchRegistration,
  patchRegistration,
} from "@/lib/api";
import { WelcomeStep } from "@/components/wizard/steps/welcome-step";
import { RegisterStep, RegisterFormValues } from "@/components/wizard/steps/register-step";
import { UnboxStep } from "@/components/wizard/steps/unbox-step";
import { SimpleStep } from "@/components/wizard/steps/simple-step";
import { TimerStep } from "@/components/wizard/steps/timer-step";
import { WaitingStep } from "@/components/wizard/steps/waiting-step";
import { TestingCompleteStep } from "@/components/wizard/steps/testing-complete-step";
import { ThankYouStep } from "@/components/wizard/steps/thank-you-step";
import { DevPanel } from "@/components/wizard/dev-panel";
import { WizardBackground } from "@/components/wizard/wizard-background";

const STORAGE_KEY = "poseidon_registration_id";

// The displayed countdown always matches the real design duration (6s / 90s).
// TESTING SPEED-UP — only the actual tick speed is accelerated for demo
// purposes. Restore by setting each *_DEMO_DURATION_MS equal to its
// SECONDS counterpart * 1000 (i.e. real-time ticking).
const FILL_TUBE_SECONDS = 6;
const FILL_TUBE_DEMO_DURATION_MS = 3000;
const TESTING_PREP_SECONDS = 90;
const TESTING_PREP_DEMO_DURATION_MS = 6000;

const RESUMABLE_STEPS = new Set<string>([
  "unbox",
  "power-on",
  "pair",
  "initialize",
  "collect-sample",
  "fill-tube",
  "testing",
]);

const TIMER_NEXT_STEP: Partial<Record<StepId, StepId>> = {
  pairing: "paired",
  initializing: "initialized",
  filling: "tube-filled",
  "testing-prep": "testing-progress",
  "testing-progress": "testing-complete",
};

export function Wizard() {
  const [step, setStep] = useState<StepId>("welcome");
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fillSignal, setFillSignal] = useState(0);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    fetchRegistration(stored)
      .then((reg) => {
        setRegistrationId(reg.id);
        if (RESUMABLE_STEPS.has(reg.current_step)) {
          setStep(reg.current_step as StepId);
        }
      })
      .catch(() => window.localStorage.removeItem(STORAGE_KEY));
  }, []);

  const persist = async (payload: Record<string, unknown>) => {
    if (!registrationId) return;
    try {
      await patchRegistration(registrationId, payload);
    } catch {
      // Best-effort: the wizard still advances locally even if the
      // network write fails, so a flaky connection doesn't strand the user.
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const registration = await createRegistration(values);
      setRegistrationId(registration.id);
      window.localStorage.setItem(STORAGE_KEY, registration.id);
      setStep("unbox");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const goTo = (next: StepId, payload?: Record<string, unknown>) => {
    setStep(next);
    if (payload) void persist({ current_step: next, ...payload });
    else void persist({ current_step: next });
  };

  const handleRestart = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setRegistrationId(null);
    setSubmitting(false);
    setError(null);
    setStep("welcome");
  };

  const handleSkipTimer = () => {
    const next = TIMER_NEXT_STEP[step];
    if (next) setStep(next);
  };

  return (
    <>
      <WizardBackground step={step} />
      {renderStep()}
      {process.env.NODE_ENV !== "production" && (
        <DevPanel
          step={step}
          onJump={setStep}
          onFillForm={() => setFillSignal((n) => n + 1)}
          onSkipTimer={handleSkipTimer}
          onRestart={handleRestart}
        />
      )}
    </>
  );

  function renderStep() {
  switch (step) {
    case "welcome":
      return <WelcomeStep onNext={() => setStep("register")} />;

    case "register":
      return (
        <RegisterStep
          onSubmit={handleRegister}
          submitting={submitting}
          error={error}
          fillSignal={fillSignal}
        />
      );

    case "unbox":
      return (
        <UnboxStep
          submitting={submitting}
          onNext={async (items) => {
            setSubmitting(true);
            await persist({
              current_step: "power-on",
              unboxed_items: items,
              unboxed_at: new Date().toISOString(),
            });
            setSubmitting(false);
            setStep("power-on");
          }}
        />
      );

    case "power-on":
      return (
        <SimpleStep
          eyebrow="Step 3 out of 9"
          title="Power on device"
          message="Remove the battery strip and press the power button."
          buttonLabel="Continue"
          onNext={() => goTo("pair")}
        />
      );

    case "pair":
      return (
        <SimpleStep
          eyebrow="Step 4 out of 9"
          title="Pair your device"
          message="Wait for blinking blue light, then pair device."
          buttonLabel="Pair device"
          onNext={() => setStep("pairing")}
        />
      );

    case "pairing":
      return (
        <PairingOrInitializing
          eyebrow="Step 4 out of 9"
          title="Pair your device"
          message="Wait for blinking blue light, then pair device."
          loadingLabel="Pairing..."
          onDone={() => setStep("paired")}
        />
      );

    case "paired":
      return (
        <SimpleStep
          eyebrow="Step 4 out of 9"
          title="Pair your device"
          message="Blue light is solid — your device is paired."
          buttonLabel="Successfully paired"
          success
          onNext={() =>
            goTo("initialize", { device_paired_at: new Date().toISOString() })
          }
        />
      );

    case "initialize":
      return (
        <SimpleStep
          eyebrow="Step 5 out of 9"
          title="Confirm and initialize"
          message="Finalize customer information and prepare for sample addition."
          buttonLabel="Initialize device"
          onNext={() => setStep("initializing")}
        />
      );

    case "initializing":
      return (
        <PairingOrInitializing
          eyebrow="Step 5 out of 9"
          title="Confirm and initialize"
          message="Finalize customer information and prepare for sample addition."
          loadingLabel="Initializing..."
          onDone={() => setStep("initialized")}
        />
      );

    case "initialized":
      return (
        <SimpleStep
          eyebrow="Step 5 out of 9"
          title="Confirm and initialize"
          message="Your device is ready for sample collection."
          buttonLabel="Successfully Initialized"
          success
          onNext={() =>
            goTo("collect-sample", {
              device_initialized_at: new Date().toISOString(),
            })
          }
        />
      );

    case "collect-sample":
      return (
        <SimpleStep
          eyebrow="Step 6 out of 9"
          title="Collect urine sample"
          message="Use the provided cup to collect your urine sample. When finish, securely seal the cup with the lid."
          buttonLabel="I have my sample"
          onNext={() =>
            goTo("fill-tube", {
              sample_collected_at: new Date().toISOString(),
            })
          }
        />
      );

    case "fill-tube":
      return (
        <SimpleStep
          eyebrow="Step 7 out of 9"
          title="Fill tube"
          message="Insert the sample tube into the collection cup at the marked location."
          buttonLabel="Tube is inserted"
          onNext={() => setStep("filling")}
        />
      );

    case "filling":
      return (
        <TimerStep
          key={step}
          eyebrow="Step 7 out of 9"
          title="Fill tube"
          message="Allow tube to fill for 6 seconds."
          warning="Don't remove the tube"
          seconds={FILL_TUBE_SECONDS}
          durationMs={FILL_TUBE_DEMO_DURATION_MS}
          onComplete={() => setStep("tube-filled")}
        />
      );

    case "tube-filled":
      return (
        <SimpleStep
          eyebrow="Step 7 out of 9"
          title="Fill tube"
          message="Tube is filled! Gently remove it."
          success
          buttonLabel="Tube removed"
          onNext={() =>
            goTo("testing", { tube_filled_at: new Date().toISOString() })
          }
        />
      );

    case "testing":
      return (
        <SimpleStep
          eyebrow="Step 8 out of 9"
          title="Testing"
          message="Insert the filled sample tube into the device and start testing."
          buttonLabel="Start testing"
          onNext={() => {
            void persist({ test_started_at: new Date().toISOString() });
            setStep("testing-prep");
          }}
        />
      );

    case "testing-prep":
      return (
        <TimerStep
          key={step}
          eyebrow="Step 8 out of 9"
          title="Testing"
          message="Device is preparing the sample. This will take 90 seconds. The yellow light will blink while testing."
          warning="Don't remove the tube"
          seconds={TESTING_PREP_SECONDS}
          durationMs={TESTING_PREP_DEMO_DURATION_MS}
          onComplete={() => setStep("testing-progress")}
        />
      );

    case "testing-progress":
      return (
        <WaitingStep
          key={step}
          eyebrow="Step 8 out of 9"
          title="Testing"
          message="Test in progress. This will take about 3 minutes. Do not disturb device while running."
          warning="Don't remove the tube"
          durationMs={10000}
          onComplete={() => setStep("testing-complete")}
        />
      );

    case "testing-complete":
      return (
        <TestingCompleteStep
          submitting={submitting}
          onSendResults={async () => {
            setSubmitting(true);
            await persist({
              current_step: "return-kit",
              test_completed_at: new Date().toISOString(),
              results_sent_at: new Date().toISOString(),
            });
            setSubmitting(false);
            setStep("return-kit");
          }}
        />
      );

    case "return-kit":
      return (
        <SimpleStep
          eyebrow="Step 9 out of 9"
          title="Return your kit"
          message="Place all MCED kit components in the bag, seal it, and send using the return prepaid box."
          buttonLabel="Got it"
          onNext={() =>
            goTo("thank-you", {
              kit_returned_at: new Date().toISOString(),
              completed_at: new Date().toISOString(),
            })
          }
        />
      );

    case "thank-you":
      return <ThankYouStep />;

    default:
      return null;
  }
  }
}

function PairingOrInitializing({
  eyebrow,
  title,
  message,
  loadingLabel,
  onDone,
}: {
  eyebrow: string;
  title: string;
  message: string;
  loadingLabel: string;
  onDone: () => void;
}) {
  useEffect(() => {
    const timeout = setTimeout(onDone, 1800);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SimpleStep
      eyebrow={eyebrow}
      title={title}
      message={message}
      buttonLabel={loadingLabel}
      loading
      disabled
    />
  );
}
