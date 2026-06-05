import { Check, Circle, RadioTower } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RaceTimelineStep } from "@/features/races/mock-races";

export type RaceStatusTimelineProps = {
  steps: RaceTimelineStep[];
};

export function RaceStatusTimeline({ steps }: RaceStatusTimelineProps) {
  return (
    <section className="rounded-2xl border border-border/10 bg-[#15151E]/85 p-4 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
        Status timeline
      </p>
      <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-foreground">
        Race pulse
      </h2>
      <div className="mt-6 space-y-4">
        {steps.map((step, index) => {
          const active = step.status === "current";
          const complete = step.status === "complete";
          const Icon = active ? RadioTower : complete ? Check : Circle;
          return (
            <div key={step.id} className="grid grid-cols-[2rem_1fr] gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full border",
                    active
                      ? "border-primary bg-primary text-foreground shadow-[0_0_24px_rgba(225,6,0,0.5)]"
                      : complete
                        ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-200"
                        : "border-border/15 bg-muted/5 text-muted-foreground/60",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                {index < steps.length - 1 ? (
                  <span className="mt-2 h-10 w-px bg-muted/10" />
                ) : null}
              </div>
              <div className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold uppercase text-foreground">
                    {step.label}
                  </h3>
                  <time className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    {step.time}
                  </time>
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
