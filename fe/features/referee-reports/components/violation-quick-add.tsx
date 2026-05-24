import { Plus, RadioTower } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ViolationQuickAdd() {
  return (
    <section className="rounded-2xl border border-primary/25 bg-[linear-gradient(135deg,rgba(225,6,0,0.18),rgba(21,21,30,0.92))] p-4 shadow-[0_18px_56px_rgba(225,6,0,0.12)] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-primary">
            <RadioTower className="size-4" /> Quick add
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase text-white">
            Log violation
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Mock-only controls for referee desk: choose severity, attach
            horse/jockey, add timing note. No API calls.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[30rem]">
          <Button
            className="h-12 rounded-full"
            aria-label="Add warning violation"
          >
            <Plus className="size-4" /> Warning
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-full"
            aria-label="Add penalty violation"
          >
            <Plus className="size-4" /> Penalty
          </Button>
          <Button
            variant="destructive"
            className="h-12 rounded-full"
            aria-label="Add critical violation"
          >
            <Plus className="size-4" /> Critical
          </Button>
        </div>
      </div>
    </section>
  );
}
