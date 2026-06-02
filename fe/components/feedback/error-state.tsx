"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ErrorStateProps = {
  title?: string;
  description?: string;
  reset?: () => void;
  className?: string;
};

export function ErrorState({
  title = "Race control interrupted",
  description = "The current view could not be loaded. This mock-first shell keeps actions local and safe.",
  reset,
  className,
}: ErrorStateProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-primary/40 bg-primary/10 p-6 text-center sm:p-8",
        className,
      )}
      role="alert"
    >
      <AlertTriangle
        className="mx-auto size-8 text-primary"
        aria-hidden="true"
      />
      <h2 className="mt-4 text-xl font-black uppercase text-foreground">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {reset ? (
        <Button
          className="mt-5 rounded-full bg-primary font-bold hover:bg-[#B80500]"
          onClick={reset}
        >
          Retry shell
        </Button>
      ) : null}
    </section>
  );
}
