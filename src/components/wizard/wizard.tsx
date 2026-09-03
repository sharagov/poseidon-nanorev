"use client";

import { useEffect, useState } from "react";
import { RESULT_IMAGE, StepId } from "@/lib/wizard-steps";
import {
  createRegistration,
  fetchRegistration,
  fetchResult,
  patchRegistration,
} from "@/lib/api";
import { Registration } from "@/lib/types";
import { WelcomeStep } from "@/components/wizard/steps/welcome-step";
import { RegisterStep, RegisterFormValues } from "@/components/wizard/steps/register-step";
import { UnboxStep } from "@/components/wizard/steps/unbox-step";
import { SimpleStep } from "@/components/wizard/steps/simple-step";
import { TimerStep } from "@/components/wizard/steps/timer-step";
import { WaitingStep } from "@/components/wizard/steps/waiting-step";
import { Phase2GateStep } from "@/components/wizard/steps/phase2-gate-step";
import { TestingCompleteStep } from "@/components/wizard/steps/testing-complete-step";
import { ResultStep } from "@/components/wizard/steps/result-step";
import { ThankYouStep } from "@/components/wizard/steps/thank-you-step";
import { DevPanel } from "@/components/wizard/dev-panel";
import { DemoSkipButton } from "@/components/wizard/demo-skip-button";
import { WizardBackground } from "@/components/wizard/wizard-background";
import { WizardHeader } from "@/components/wizard/wizard-header";
import { WizardCard } from "@/components/wizard/wizard-card";

// Defaults to a real 8 hours; set NEXT_PUBLIC_PHASE2_GATE_MS to something
// short (e.g. 30000) for local/demo runs. See .env.local.example.
const PHASE2_GATE_MS = Number(process.env.NEXT_PUBLIC_PHASE2_GATE_MS) || 8 * 60 * 60 * 1000;

const STORAGE_KEY = "poseidon_registration_id";

// The only step whose Scene renders without a card (see welcome-step.tsx).
// Every other step shares one persistent card frame that just resizes
// between steps instead of sliding in again.
const NO_CARD_STEPS = new Set<StepId>(["welcome"]);

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
  "before-you-begin",
  "confirm-device",
  "insert-cartridge",
  "position-mouthpiece",
  "position-injector",
  "unlock-administer",
  "hold-in-place",
  "remove-device",
  "phase2-gate",
  "power-on",
  "pair",
  "initialize",
  "collect-sample",
  "fill-tube",
  "testing",
  "testing-complete",
]);

const TIMER_NEXT_STEP: Partial<Record<StepId, StepId>> = {
  pairing: "paired",
  initializing: "initialized",
  filling: "tube-filled",
  "testing-prep": "testing-progress",
  "testing-progress": "testing-complete",
  "hold-in-place": "remove-device",
};

// Steps with a real or simulated wait the live "skip wait (demo)" button
// (see DemoSkipButton) can shortcut — every TIMER_NEXT_STEP entry, plus
// the timestamp-based phase2-gate handled separately below.
const SKIPPABLE_STEPS = new Set<StepId>([
  ...(Object.keys(TIMER_NEXT_STEP) as StepId[]),
  "phase2-gate",
]);

export function Wizard() {
  const [step, setStep] = useState<StepId>("welcome");
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [resultImage, setResultImage] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fillSignal, setFillSignal] = useState(0);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    fetchRegistration(stored)
      .then((reg) => {
        setRegistrationId(reg.id);
        setRegistration(reg);
        if (RESUMABLE_STEPS.has(reg.current_step)) {
          setStep(reg.current_step as StepId);
        }
      })
      .catch(() => window.localStorage.removeItem(STORAGE_KEY));
  }, []);

  // The result step's photo depends on the outcome, which lives in a
  // separate table — look it up only once the patient actually reaches
  // that step rather than eagerly for every registration.
  useEffect(() => {
    if (step !== "result" || !registrationId) return;
    fetchResult(registrationId).then((result) => {
      if (!result) return;
      const variant =
        result.outcome === "clear"
          ? "clear"
          : result.outcome === "follow_up"
            ? "follow_up"
            : "unavailable";
      setResultImage(RESULT_IMAGE[variant]);
    });
  }, [step, registrationId]);

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
      setRegistration(registration);
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
    setRegistration(null);
    setResultImage(undefined);
    setSubmitting(false);
    setError(null);
    setStep("welcome");
  };

  const handleSkipTimer = () => {
    const next = TIMER_NEXT_STEP[step];
    if (next) setStep(next);
  };

  // phase2-gate is a real timestamp-based wait (see Phase2GateStep), not
  // an in-memory countdown — skipping it has to satisfy the same elapsed-
  // time check the gate itself uses, so rewrite phase2_completed_at far
  // enough into the past that completedAt + durationMs is already behind
  // us. Continue un-disables the same way it would after a genuine wait.
  const handleSkipPhase2Gate = () => {
    if (!registration) return;
    const pastCompletedAt = new Date(
      Date.now() - PHASE2_GATE_MS - 60_000
    ).toISOString();
    setRegistration((r) => (r ? { ...r, phase2_completed_at: pastCompletedAt } : r));
    void persist({ phase2_completed_at: pastCompletedAt });
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col gap-10">
      <WizardBackground step={step} imageOverride={step === "result" ? resultImage : undefined} />
      {/*
        Header is a normal-height flex item; the card region below is
        flex-1 with min-h-0, so it can never claim more space than what's
        actually left below the header (see WizardCard for how the card
        itself caps to and scrolls within that space).
      */}
      <WizardHeader>
        <div className="relative min-h-0 flex-1">
          <WizardCard active={!NO_CARD_STEPS.has(step)}>
            {renderStep()}
          </WizardCard>
        </div>
      </WizardHeader>
      {process.env.NODE_ENV !== "production" && (
        <DevPanel
          step={step}
          onJump={setStep}
          onFillForm={() => setFillSignal((n) => n + 1)}
          onSkipTimer={handleSkipTimer}
          onSkipPhase2Gate={handleSkipPhase2Gate}
          onRestart={handleRestart}
        />
      )}
      {SKIPPABLE_STEPS.has(step) && (
        <DemoSkipButton
          onSkip={step === "phase2-gate" ? handleSkipPhase2Gate : handleSkipTimer}
        />
      )}
    </div>
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
              current_step: "before-you-begin",
              unboxed_items: items,
              unboxed_at: new Date().toISOString(),
            });
            setSubmitting(false);
            setStep("before-you-begin");
          }}
        />
      );

    case "before-you-begin":
      return (
        <SimpleStep
          stepId="before-you-begin"
          title="Before you begin"
          message="Make sure you have everything ready"
          list={["Clean, dry hands", "A mirror or a helper", "You can stay seated"]}
          warning="This delivers your dose — read each step fully first"
          buttonLabel="Start"
          onNext={() => goTo("confirm-device")}
        />
      );

    case "confirm-device":
      return (
        <SimpleStep
          stepId="confirm-device"
          title="Confirm device"
          message="Check the auto-injector is locked. When it's locked, the firing button can't be pressed."
          warning="Keep it locked until it's against your cheek."
          buttonLabel="Device is locked"
          onNext={() => goTo("insert-cartridge")}
        />
      );

    case "insert-cartridge":
      return (
        <SimpleStep
          stepId="insert-cartridge"
          title="Insert dose cartridge"
          message="Push the cartridge into device until it's fully seated. You'll feel it click."
          warning="Don't open or squeeze the cartridge"
          buttonLabel="Cartridge is fully seated"
          onNext={() => goTo("position-mouthpiece")}
        />
      );

    case "position-mouthpiece":
      return (
        <SimpleStep
          stepId="position-mouthpiece"
          title="Position mouthpiece"
          message="Open the mouthpiece and place it over your cheek — one side inside your mouth, the other outside. Close it so your cheek is held flat and comfortable."
          warning="It should feel supported, not pinched"
          buttonLabel="Mouthpiece is in place"
          onNext={() => goTo("position-injector")}
        />
      );

    case "position-injector":
      return (
        <SimpleStep
          stepId="position-injector"
          title="Position auto-injector"
          message="Push the device tip into the socket on the mouthpiece until it stops. Hold it firmly against your cheek."
          warning="Don't use the device without the mouthpiece"
          buttonLabel="Device seated and pressed"
          onNext={() => goTo("unlock-administer")}
        />
      );

    case "unlock-administer":
      return (
        <SimpleStep
          stepId="unlock-administer"
          title="Unlock and administer"
          message="Keeping the device pressed into the mouthpiece, unlock it, then press the firing button once."
          warning="Don't move the device while it's firing"
          buttonLabel="I've pressed the button"
          onNext={() => setStep("hold-in-place")}
        />
      );

    case "hold-in-place":
      return (
        <TimerStep
          key={step}
          stepId="hold-in-place"
          title="Unlock and administer"
          message="Keep the device pressed in place for 10 seconds."
          warning="Don't move the device while it's firing"
          seconds={10}
          onComplete={() => setStep("remove-device")}
        />
      );

    case "remove-device":
      return (
        <SimpleStep
          stepId="remove-device"
          title="Remove device and mouthpiece"
          message="Dose administered. Take the device out of the mouthpiece first. Then open the mouthpiece and remove it gently."
          success
          buttonLabel="Done"
          onNext={() => {
            const completedAt = new Date().toISOString();
            setRegistration((r) =>
              r ? { ...r, phase2_completed_at: completedAt } : r
            );
            goTo("phase2-gate", { phase2_completed_at: completedAt });
          }}
        />
      );

    case "phase2-gate":
      return (
        <Phase2GateStep
          completedAt={
            registration?.phase2_completed_at ?? new Date().toISOString()
          }
          durationMs={PHASE2_GATE_MS}
          onContinue={() => goTo("power-on")}
        />
      );

    case "power-on":
      return (
        <SimpleStep
          stepId="power-on"
          title="Power on device"
          message="Remove the blue pull tab and press the power button to turn on your device."
          buttonLabel="Continue"
          onNext={() => goTo("pair")}
        />
      );

    case "pair":
      return (
        <SimpleStep
          stepId="pair"
          title="Pair your device"
          message="Wait for blinking yellow light, then pair device."
          buttonLabel="Pair device"
          onNext={() => setStep("pairing")}
        />
      );

    case "pairing":
      return (
        <PairingOrInitializing
          stepId="pairing"
          title="Pair your device"
          message="Wait for blinking yellow light, then pair device."
          loadingLabel="Pairing..."
          onDone={() => setStep("paired")}
        />
      );

    case "paired":
      return (
        <AutoAdvance
          stepId="paired"
          title="Pair your device"
          message="Green light is solid — your device is paired."
          buttonLabel="Successfully paired"
          onDone={() =>
            goTo("initialize", { device_paired_at: new Date().toISOString() })
          }
        />
      );

    case "initialize":
      return (
        <SimpleStep
          stepId="initialize"
          title="Confirm and initialize"
          message="Finalize customer information and prepare for sample addition."
          buttonLabel="Initialize device"
          onNext={() => setStep("initializing")}
        />
      );

    case "initializing":
      return (
        <PairingOrInitializing
          stepId="initializing"
          title="Confirm and initialize"
          message="Finalize customer information and prepare for sample addition."
          loadingLabel="Initializing..."
          onDone={() => setStep("initialized")}
        />
      );

    case "initialized":
      return (
        <AutoAdvance
          stepId="initialized"
          title="Confirm and initialize"
          message="Your device is ready for sample collection."
          buttonLabel="Successfully Initialized"
          onDone={() =>
            goTo("collect-sample", {
              device_initialized_at: new Date().toISOString(),
            })
          }
        />
      );

    case "collect-sample":
      return (
        <SimpleStep
          stepId="collect-sample"
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
          stepId="fill-tube"
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
          stepId="filling"
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
          stepId="tube-filled"
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
          stepId="testing"
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
          stepId="testing-prep"
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
          stepId="testing-progress"
          title="Testing"
          message="Test in progress. This will take about 3 minutes. Do not disturb device while running."
          warning="Don't remove the tube"
          durationMs={3000}
          onComplete={() => setStep("testing-complete")}
        />
      );

    case "testing-complete":
      return (
        <TestingCompleteStep
          registrationId={registrationId}
          submitting={submitting}
          onSendResults={async () => {
            setSubmitting(true);
            await persist({
              current_step: "result",
              test_completed_at: new Date().toISOString(),
              results_sent_at: new Date().toISOString(),
            });
            setSubmitting(false);
            setStep("result");
          }}
          onViewResults={() => setStep("result")}
        />
      );

    case "result":
      return registration ? (
        <ResultStep registration={registration} onDone={() => goTo("return-kit")} />
      ) : null;

    case "return-kit":
      return (
        <SimpleStep
          stepId="return-kit"
          title="Return your MCED kit"
          message="Pack up your kit to send it back to us"
          list={[
            "Used cartridge + mouthpiece + auto-injector into the sealed bag",
            "Bag, sample tube and device into the return box",
            "Close and attach the return receipt",
            "Any post box",
          ]}
          warning="Nothing in this kit goes in household waste"
          buttonLabel="I've packed my kit"
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

// Success confirmations (e.g. "device paired") are informational, not
// something the user needs to act on — they auto-advance after a short
// beat so the checkmark actually registers before moving on.
const AUTO_ADVANCE_DELAY_MS = 2500;

function AutoAdvance({
  stepId,
  title,
  message,
  buttonLabel,
  onDone,
}: {
  stepId: StepId;
  title: string;
  message: string;
  buttonLabel: string;
  onDone: () => void;
}) {
  useEffect(() => {
    const timeout = setTimeout(onDone, AUTO_ADVANCE_DELAY_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SimpleStep
      stepId={stepId}
      title={title}
      message={message}
      buttonLabel={buttonLabel}
      success
      disabled
    />
  );
}

function PairingOrInitializing({
  stepId,
  title,
  message,
  loadingLabel,
  onDone,
}: {
  stepId: StepId;
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
      stepId={stepId}
      title={title}
      message={message}
      buttonLabel={loadingLabel}
      loading
      disabled
    />
  );
}
