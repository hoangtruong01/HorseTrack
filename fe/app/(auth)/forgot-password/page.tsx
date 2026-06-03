"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card/85 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.2)] sm:p-8 backdrop-blur-xl">
      <div className="absolute inset-x-12 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#E10600] to-transparent" />
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase text-foreground tracking-tight">
            {t("auth.forgotPassword.title")}
          </h2>
          <p className="text-sm font-semibold text-muted-foreground">
            {t("auth.forgotPassword.description")}
          </p>
        </div>
        <Button asChild className="w-full rounded-xl font-black uppercase tracking-wider">
          <Link href="/login">{t("auth.forgotPassword.backToLogin")}</Link>
        </Button>
      </div>
    </section>
  );
}
