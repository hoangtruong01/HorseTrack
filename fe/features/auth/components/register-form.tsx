"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { defaultDemoRole, rolePreviews } from "../mock-auth-data";
import type { AuthRole, MockRegisterPayload } from "../types";

const fieldClass =
  "h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#E10600] focus:ring-4 focus:ring-[#E10600]/15 disabled:cursor-not-allowed disabled:opacity-60";
const labelClass =
  "text-xs font-black uppercase tracking-[0.16em] text-white/55";

export function RegisterForm() {
  const [selectedRole, setSelectedRole] = useState<AuthRole>(defaultDemoRole);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredRolePreviews = useMemo(
    () => rolePreviews.filter((preview) => preview.role !== "admin"),
    []
  );

  const selectedPreview = useMemo(
    () =>
      rolePreviews.find((role) => role.role === selectedRole) ??
      rolePreviews[0],
    [selectedRole],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload: MockRegisterPayload = {
      fullName: String(data.get("fullName") ?? ""),
      email: String(data.get("email") ?? ""),
      role: selectedRole,
      password: String(data.get("password") ?? ""),
      acceptPolicy: data.get("acceptPolicy") === "on",
    };

    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      window.location.href = selectedPreview.entryPath;
    }, 700);

    void payload;
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-2">
          <span className={labelClass}>Full name</span>
          <input
            name="fullName"
            required
            autoComplete="name"
            className={fieldClass}
            placeholder="Stable Manager"
          />
        </label>

        <label className="space-y-2">
          <span className={labelClass}>Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
            placeholder="you@horsetrack.local"
          />
        </label>

        <label className="space-y-2">
          <span className={labelClass}>Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className={fieldClass}
            placeholder="Minimum 6 chars"
          />
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className={labelClass}>Request role</legend>
        <div className="grid grid-cols-4 gap-2">
          {filteredRolePreviews.map((preview) => {
            const Icon = preview.icon;
            const isSelected = selectedRole === preview.role;
            return (
              <button
                key={preview.role}
                type="button"
                onClick={() => setSelectedRole(preview.role)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-xl border p-2 transition-all duration-200 text-center cursor-pointer",
                  isSelected
                    ? "border-[#E10600] bg-[#E10600]/8 text-[#E10600] shadow-[0_0_10px_rgba(225,6,0,0.15)]"
                    : "border-white/[0.04] bg-white/[0.01] text-white/40 hover:border-white/10 hover:text-white/70"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="text-[9px] font-black uppercase tracking-wide leading-none">
                  {preview.role === "spectator" ? "Spectator" : preview.label.split(" ").pop()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Small Elegant Role Description Card */}
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 text-xs leading-relaxed text-white/60">
          <p className="font-black text-[#E10600] uppercase tracking-wider text-[10px]">
            {selectedPreview.eyebrow} • {selectedPreview.label}
          </p>
          <p className="mt-1 text-white/45 leading-normal font-semibold">
            {selectedPreview.description}
          </p>
        </div>
      </fieldset>

      <div className="pt-1">
        <label className="flex items-start gap-2.5 text-xs text-white/50 cursor-pointer hover:text-white/70 transition-colors">
          <input
            name="acceptPolicy"
            type="checkbox"
            required
            className="mt-0.5 size-4 shrink-0 rounded border-white/10 bg-white/[0.04] accent-[#E10600] focus:ring-offset-0 focus:ring-0"
          />
          <span className="leading-normal font-semibold">
            I understand this is a mock registration with visual-only role assignment.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#E10600] text-sm font-black uppercase tracking-[0.16em] text-white hover:bg-[#B80500] hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4.5 animate-spin" aria-hidden="true" />
            Creating mock profile...
          </>
        ) : (
          <>
            Continue as {selectedPreview.label}
            <ArrowRight className="size-4.5" aria-hidden="true" />
          </>
        )}
      </button>

      <div className="pt-2 text-center text-xs sm:text-sm text-white/55 font-semibold">
        Already staged?{" "}
        <Link
          href="/login"
          className="font-black text-[#E10600] hover:underline"
        >
          Login instead
        </Link>
      </div>
    </form>
  );
}
