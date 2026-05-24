"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { defaultDemoRole, rolePreviews } from "../mock-auth-data";
import type { AuthRole, MockLoginPayload } from "../types";
import { RolePreviewCard } from "./role-preview-card";

const fieldClass =
  "h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60";
const labelClass =
  "text-xs font-black uppercase tracking-[0.18em] text-white/72";

export function LoginForm() {
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
    const payload: MockLoginPayload = {
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      role: selectedRole,
      rememberDemo: data.get("rememberDemo") === "on",
    };

    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      window.location.href = selectedPreview.entryPath;
    }, 650);

    void payload;
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-2">
          <span className={labelClass}>Email</span>
          <span className="relative block">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/38" />
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue="owner.demo@horsetrack.local"
              className={cn(fieldClass, "pl-10")}
              placeholder="you@stable.com"
            />
          </span>
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className={labelClass}>Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            defaultValue="demo123"
            className={fieldClass}
            placeholder="••••••••"
          />
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className={labelClass}>Choose demo cockpit</legend>
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

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-3 text-sm text-white/68">
          <input
            name="rememberDemo"
            type="checkbox"
            className="size-4 rounded border-white/20 bg-white/10 accent-[#E10600] focus:ring-primary/40"
          />
          Remember role visually for this mock submit
        </label>
        <Link
          href="/register"
          className="text-sm font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          Need account?
        </Link>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-full bg-primary text-sm font-black uppercase tracking-[0.16em] text-white hover:bg-[#B80500]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Preparing mock session
          </>
        ) : (
          <>
            Enter {selectedPreview.label} dashboard
            <ArrowRight className="size-4" aria-hidden="true" />
          </>
        )}
      </Button>

      <p className="flex items-start gap-2 text-xs leading-5 text-white/48">
        <ShieldCheck
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden="true"
        />
        Redirect is a placeholder for demo only. No credentials leave the
        browser.
      </p>
    </form>
  );
}
