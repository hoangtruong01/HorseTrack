"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Loader2,
  AlertTriangle,
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  MapPin,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { defaultDemoRole, rolePreviews } from "../mock-auth-data";
import type { AuthRole } from "../types";
import { toast } from "sonner";

const fieldClass =
  "h-11 w-full rounded-xl border border-border bg-background/70 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-[#E10600] focus:ring-4 focus:ring-[#E10600]/15 disabled:cursor-not-allowed disabled:opacity-60";
const labelClass =
  "text-xs font-black uppercase tracking-[0.16em] text-muted-foreground";

export function RegisterForm() {
  const { register } = useAuth();
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<AuthRole>(defaultDemoRole);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  const roleLabel = (role: AuthRole) =>
    t(`auth.roleDescriptions.${role}.label`);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    const data = new FormData(event.currentTarget);
    const payload = {
      fullName: String(data.get("fullName") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      address: String(data.get("address") ?? ""),
      dob: String(data.get("dob") ?? ""),
      roles: [selectedRole],
      password: String(data.get("password") ?? ""),
    };

    try {
      await register(payload);
      toast.success(t("auth.registerForm.registerSuccess"));
      window.location.href = selectedPreview.entryPath;
    } catch (err: any) {
      const errMsg = err.message || t("auth.registerForm.registerFailed");
      setErrorMsg(errMsg);
      toast.error(errMsg);
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {errorMsg && (
        <div className="flex items-start gap-3 rounded-xl border border-[#E10600] bg-[#E10600]/10 p-4 shadow-[0_0_15px_rgba(225,6,0,0.15)] animate-[shake_0.4s_ease-in-out]">
          <AlertTriangle className="size-5 shrink-0 text-[#E10600] mt-0.5" />
          <div>
            <p className="text-xs font-black uppercase text-[#E10600] tracking-[0.1em]">{t("auth.registerForm.registrationError")}</p>
            <p className="mt-1 text-sm text-foreground leading-5">{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-2">
          <span className={labelClass}>{t("auth.registerForm.fullName")}</span>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
            <input
              name="fullName"
              required
              autoComplete="name"
              className={fieldClass}
              placeholder={t("auth.registerForm.fullNamePlaceholder")}
            />
          </div>
        </label>

        <label className="space-y-2">
          <span className={labelClass}>{t("auth.registerForm.email")}</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className={fieldClass}
              placeholder={t("auth.registerForm.emailPlaceholder")}
            />
          </div>
        </label>

        <label className="space-y-2">
          <span className={labelClass}>{t("auth.registerForm.password")}</span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
            <input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className={fieldClass}
              placeholder={t("auth.registerForm.passwordPlaceholder")}
            />
          </div>
        </label>

        <label className="space-y-2">
          <span className={labelClass}>{t("auth.registerForm.phone")}</span>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
            <input
              name="phone"
              type="tel"
              className={fieldClass}
              placeholder={t("auth.registerForm.phonePlaceholder")}
            />
          </div>
        </label>

        <label className="space-y-2">
          <span className={labelClass}>{t("auth.registerForm.dob")}</span>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
            <input
              name="dob"
              type="date"
              className={cn(fieldClass, "dark:[&::-webkit-calendar-picker-indicator]:invert")}
            />
          </div>
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className={labelClass}>{t("auth.registerForm.address")}</span>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
            <input
              name="address"
              className={fieldClass}
              placeholder={t("auth.registerForm.addressPlaceholder")}
            />
          </div>
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className={labelClass}>{t("auth.registerForm.requestRole")}</legend>
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
                    : "border-border bg-card/60 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="text-[9px] font-black uppercase tracking-wide leading-none">
                  {preview.role === "spectator"
                    ? t("auth.registerForm.spectatorRole")
                    : roleLabel(preview.role).split(" ").pop()}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-border bg-card/70 p-3 text-xs leading-relaxed text-muted-foreground">
          <p className="font-black text-[#E10600] uppercase tracking-wider text-[10px]">
            {t(`auth.roleDescriptions.${selectedRole}.eyebrow`)} • {roleLabel(selectedRole)}
          </p>
          <p className="mt-1 text-muted-foreground leading-normal font-semibold">
            {t(`auth.roleDescriptions.${selectedRole}.description`)}
          </p>
        </div>
      </fieldset>

      <div className="pt-1">
        <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
          <input
            name="acceptPolicy"
            type="checkbox"
            required
            className="mt-0.5 size-4 shrink-0 rounded border-border bg-background/70 accent-[#E10600] focus:ring-offset-0 focus:ring-0"
          />
          <span className="leading-normal font-semibold">
            {t("auth.registerForm.acceptPolicy")}
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
            {t("auth.registerForm.creatingProfile")}
          </>
        ) : (
          <>
            {t("auth.registerForm.continueAs", { role: roleLabel(selectedRole) })}
            <ArrowRight className="size-4.5" aria-hidden="true" />
          </>
        )}
      </button>

      <div className="pt-2 text-center text-xs sm:text-sm text-muted-foreground font-semibold">
        {t("auth.registerForm.alreadyStaged")}{" "}
        <Link
          href="/login"
          className="font-black text-[#E10600] hover:underline"
        >
          {t("auth.registerForm.loginInstead")}
        </Link>
      </div>
    </form>
  );
}
