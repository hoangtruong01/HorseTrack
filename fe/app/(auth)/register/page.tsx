"use client";

import { useTranslation } from "react-i18next";

import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card/85 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.2)] sm:p-8 backdrop-blur-xl">
      <div className="absolute inset-x-12 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#E10600] to-transparent shadow-[0_0_15px_rgba(225,6,0,0.8)]" />

      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase text-foreground tracking-tight">
            {t("auth.register.title")}
          </h2>
          <p className="text-sm font-semibold text-muted-foreground">
            {t("auth.register.description")}
          </p>
        </div>

        <RegisterForm />
      </div>
    </section>
  );
}
