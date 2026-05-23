import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

import type { AuthRole, RolePreview } from "../types";

type RolePreviewCardProps = {
  role: RolePreview;
  selectedRole?: AuthRole;
  compact?: boolean;
};

export function RolePreviewCard({
  role,
  selectedRole,
  compact = false,
}: RolePreviewCardProps) {
  const Icon = role.icon;
  const selected = selectedRole === role.role;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-[#15151E]/85 p-4 text-left shadow-[0_18px_60px_rgba(0,0,0,0.34)] transition duration-200",
        selected
          ? "border-primary/80 ring-2 ring-primary/25"
          : "border-white/10 hover:border-primary/50",
        compact && "p-3",
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
      <div className="absolute -right-10 -top-10 size-24 rounded-full bg-primary/10 blur-2xl transition group-hover:bg-primary/20" />

      <div className="relative flex items-start gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl border",
            selected
              ? "border-primary bg-primary text-white"
              : "border-white/10 bg-white/[0.06] text-primary",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-primary">
              {role.eyebrow}
            </p>
            {selected ? (
              <CheckCircle2
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
            ) : null}
          </div>
          <h3 className="mt-1 text-base font-black uppercase text-white">
            {role.label}
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/68">
            {role.description}
          </p>
        </div>
      </div>

      {!compact ? (
        <ul
          className="relative mt-4 flex flex-wrap gap-2"
          aria-label={`${role.label} capabilities`}
        >
          {role.highlights.map((item) => (
            <li
              key={item}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-white/78"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
