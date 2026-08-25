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
  // Different photo: stack a new layer on top; it fades in once its own
  // <img> reports onLoad (below), not immediately — on a slow connection
  // the photo can take a while to actually arrive, and revealing/pruning
  // on a fixed timer regardless would drop the covering older layer
  // while the new one was still blank, flashing the plain background
  // color through.
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

  // Once the newest layer has actually loaded and faded in, drop the
  // older ones it now fully covers. Gated on revealedKey reaching the
  // top layer's key (set by onLoad) rather than just layers changing,
  // so nothing gets pruned before its replacement is actually visible.
  useEffect(() => {
    const top = layers[layers.length - 1];
    if (top.key !== revealedKey || layers.length < 2) return;
    const timeout = setTimeout(() => {
      setLayers((prev) => prev.slice(-1));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [layers, revealedKey]);

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
          onLoad={() =>
            setRevealedKey((prev) => (layer.key > prev ? layer.key : prev))
          }
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
