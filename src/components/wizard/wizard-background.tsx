"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { StepId, STEP_IMAGE, STEP_IMAGE_POSITION } from "@/lib/wizard-steps";

type Layer = { key: number; src: string; position: string };

export function WizardBackground({ step }: { step: StepId }) {
  const src = STEP_IMAGE[step];
  const position = STEP_IMAGE_POSITION[step] ?? "center";
  const keyRef = useRef(0);

  const [layers, setLayers] = useState<Layer[]>(() => [
    { key: keyRef.current++, src, position },
  ]);
  const [revealedKey, setRevealedKey] = useState(0);

  // Same photo, different crop (e.g. welcome <-> register): update the
  // existing layer in place so the object-position transition handles it.
  // Different photo: stack a new layer on top and fade it in, instead of
  // cutting the <img src> instantly.
  useEffect(() => {
    setLayers((prev) => {
      const top = prev[prev.length - 1];
      if (top.src === src) {
        return top.position === position
          ? prev
          : [...prev.slice(0, -1), { ...top, position }];
      }
      return [...prev, { key: keyRef.current++, src, position }];
    });
  }, [src, position]);

  useEffect(() => {
    const top = layers[layers.length - 1];
    if (top.key === revealedKey) return;
    const raf = requestAnimationFrame(() => setRevealedKey(top.key));
    return () => cancelAnimationFrame(raf);
  }, [layers, revealedKey]);

  // Once the fade-in finishes, drop the covered-up older layers.
  useEffect(() => {
    if (layers.length < 2) return;
    const timeout = setTimeout(() => {
      setLayers((prev) => prev.slice(-1));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [layers]);

  return (
    <div className="fixed inset-0 bg-neutral-200">
      {layers.map((layer, index) => (
        <Image
          key={layer.key}
          src={layer.src}
          alt=""
          fill
          priority={index === layers.length - 1}
          quality={90}
          sizes="100vw"
          className="object-cover transition-[object-position,opacity] duration-1000 ease-out"
          style={{
            objectPosition: layer.position,
            opacity:
              index === layers.length - 1 && layer.key !== revealedKey
                ? 0
                : 1,
          }}
        />
      ))}
    </div>
  );
}
