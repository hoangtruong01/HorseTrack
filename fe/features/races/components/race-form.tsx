import { CalendarClock, Flag, MapPin, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RaceForm() {
  return (
    <form className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5 shadow-[0_18px_56px_rgba(0,0,0,0.28)] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Race form
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight dark:text-white text-foreground">
            Create race mock
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            UI-only form. No validation service, no API submit.
          </p>
        </div>
        <Button type="button" className="rounded-full">
          Save mock race
        </Button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {[
          { label: "Race name", icon: Flag, placeholder: "Aurora Sprint 1200" },
          {
            label: "Tournament",
            icon: ShieldCheck,
            placeholder: "Spring Velocity Cup",
          },
          {
            label: "Date & time",
            icon: CalendarClock,
            placeholder: "24 May 2026 · 10:00",
          },
          {
            label: "Location",
            icon: MapPin,
            placeholder: "Saigon Grand Track",
          },
        ].map((field) => {
          const Icon = field.icon;
          return (
            <label
              key={field.label}
              className="grid gap-2 text-sm font-bold dark:text-white text-foreground"
            >
              <span className="inline-flex items-center gap-2">
                <Icon className="size-4 text-primary" />
                {field.label}
              </span>
              <input
                className="h-11 rounded-lg border dark:border-white/10 border-border dark:bg-black/25 bg-muted/20 px-3 text-sm dark:text-white text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder={field.placeholder}
              />
            </label>
          );
        })}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {[
          ["Distance", "1,200m"],
          ["Surface", "Dry turf"],
          ["Capacity", "8"],
        ].map(([label, placeholder]) => (
          <label
            key={label}
            className="grid gap-2 text-sm font-bold dark:text-white text-foreground"
          >
            {label}
            <input
              className="h-11 rounded-lg border dark:border-white/10 border-border dark:bg-black/25 bg-muted/20 px-3 text-sm dark:text-white text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder={placeholder}
            />
          </label>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm leading-6 dark:text-yellow-100 text-yellow-800">
        Phase 4C scope: form layout only. Registration approval, result publish,
        realtime, backend integration stay out.
      </div>
    </form>
  );
}
