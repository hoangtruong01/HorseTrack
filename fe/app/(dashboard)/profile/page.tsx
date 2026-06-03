"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { normalizeLanguage } from "@/lib/i18n-language";
import { useAuth } from "@/providers/auth-provider";

export default function ProfilePage() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const dateLocale = normalizeLanguage(i18n.language) === "en" ? "en-US" : "vi-VN";

  if (!user) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          {t("profile.loginRequired")}
        </p>
        <Button asChild>
          <Link href="/login">{t("profile.login")}</Link>
        </Button>
      </div>
    );
  }

  const formattedDob = user.dob
    ? new Date(user.dob).toLocaleDateString(dateLocale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : t("profile.notUpdated");

  return (
    <main className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-end mt-4">
        <Button asChild variant="outline" className="rounded-xl border-border hover:bg-muted">
          <Link href={`/${user.roles[0]?.toLowerCase() || "spectator"}`}>
            <ArrowLeft className="mr-2 size-4" /> {t("profile.backToDashboard")}
          </Link>
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card/80 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 size-48 rounded-full bg-[#E10600]/10 blur-3xl" />
        <div className="absolute left-0 bottom-0 -ml-16 -mb-16 size-48 rounded-full bg-[#F8CD46]/5 blur-3xl" />

        <div className="relative z-10 space-y-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-border">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E10600] to-[#B80500] dark:text-white text-foreground shadow-[0_8px_30px_rgba(225,6,0,0.3)]">
              <User className="size-10" />
            </div>
            <div className="text-center sm:text-left space-y-2">
              <h2 className="text-2xl font-black uppercase text-foreground tracking-wide">
                {user.fullName}
              </h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1 rounded-full border border-[#E10600]/30 bg-[#E10600]/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-foreground"
                  >
                    <Shield className="size-3 text-[#E10600]" />
                    {t(`profile.roles.${role.toLowerCase()}`)}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("profile.statusLabel")} {t("profile.statusActive")}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="group rounded-2xl border border-border bg-background/70 p-5 hover:border-border transition">
              <div className="flex items-center gap-3 text-muted-foreground group-hover:text-[#E10600] transition">
                <Mail className="size-4.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t("profile.email")}
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-foreground break-all">
                {user.email}
              </p>
            </div>

            <div className="group rounded-2xl border border-border bg-background/70 p-5 hover:border-[#E10600]/30 transition">
              <div className="flex items-center gap-3 text-muted-foreground group-hover:text-[#E10600] transition">
                <Phone className="size-4.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t("profile.phone")}
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-foreground">
                {user.phone || t("profile.notUpdated")}
              </p>
            </div>

            <div className="group rounded-2xl border border-border bg-background/70 p-5 hover:border-[#E10600]/30 transition">
              <div className="flex items-center gap-3 text-muted-foreground group-hover:text-[#E10600] transition">
                <Calendar className="size-4.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t("profile.dob")}
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-foreground">
                {formattedDob}
              </p>
            </div>

            <div className="group rounded-2xl border border-border bg-background/70 p-5 hover:border-[#E10600]/30 transition sm:col-span-2">
              <div className="flex items-center gap-3 text-muted-foreground group-hover:text-[#E10600] transition">
                <MapPin className="size-4.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t("profile.address")}
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-foreground leading-relaxed">
                {user.address || t("profile.notUpdated")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
