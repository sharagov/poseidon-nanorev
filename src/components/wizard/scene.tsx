import Image from "next/image";
import { ReactNode } from "react";

export function Scene({
  eyebrow,
  title,
  image,
  children,
}: {
  eyebrow?: string;
  title?: string;
  image: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-neutral-200">
      <div className="fixed inset-0">
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[584px] flex-1 flex-col px-4 sm:px-8">
        <div className="pt-16">
          {eyebrow && (
            <p className="text-sm font-medium text-neutral-700">{eyebrow}</p>
          )}
          {title && (
            <h1 className="mt-1 text-2xl font-semibold text-neutral-900">
              {title}
            </h1>
          )}
        </div>

        <div className="mt-auto rounded-t-3xl bg-white px-5 pb-10 pt-10 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] sm:px-14">
          {children}
        </div>
      </div>
    </div>
  );
}
