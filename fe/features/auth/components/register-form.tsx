"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, UserRoundPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { defaultDemoRole, rolePreviews } from "../mock-auth-data";
import type { AuthRole, MockRegisterPayload } from "../types";
import { RolePreviewCard } from "./role-preview-card";

const fieldClass =
  "h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60";
const labelClass =
  "text-xs font-black uppercase tracking-[0.18em] text-white/72";

export function RegisterForm() {
  const [selectedRole, setSelectedRole] = useState<AuthRole>(defaultDemoRole);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        <div className="grid gap-3 md:grid-cols-2">
          {rolePreviews.map((role) => (
            <button
              key={role.role}
              type="button"
              className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              onClick={() => setSelectedRole(role.role)}
            >
              <RolePreviewCard
                role={role}
                selectedRole={selectedRole}
                compact
              />
            </button>
          ))}
        </div>
      </fieldset>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <label className="flex items-start gap-3 text-sm leading-6 text-white/68">
          <input
            name="acceptPolicy"
            type="checkbox"
            required
            className="mt-1 size-4 rounded border-white/20 bg-white/10 accent-[#E10600] focus:ring-primary/40"
          />
          <span>
            I understand this is a mock registration. Future secure auth uses
            httpOnly cookie sessions, never localStorage JWT.
          </span>
        </label>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-full bg-primary text-sm font-black uppercase tracking-[0.16em] text-white hover:bg-[#B80500]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Creating mock profile
          </>
        ) : (
          <>
            Continue as {selectedPreview.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </>
        )}
      </Button>

      <p className="flex items-start gap-2 text-xs leading-5 text-white/48">
        <UserRoundPlus
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden="true"
        />
        Role request is visual only. Admin approval and backend account creation
        are deferred.
      </p>

      <p className="text-center text-sm text-white/58">
        Already staged?{" "}
        <Link
          href="/login"
          className="font-black text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          Login instead
        </Link>
      </p>
    </form>
  );
}
