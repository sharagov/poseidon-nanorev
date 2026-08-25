import Image from "next/image";
import { StepId, STEP_IMAGE, STEP_IMAGE_POSITION } from "@/lib/wizard-steps";

export function WizardBackground({ step }: { step: StepId }) {
  return (
    <div className="fixed inset-0 bg-neutral-200">
      <Image
        src={STEP_IMAGE[step]}
        alt=""
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-cover transition-[object-position] duration-1000 ease-out"
        style={{ objectPosition: STEP_IMAGE_POSITION[step] ?? "center" }}
      />
    </div>
  );
}
