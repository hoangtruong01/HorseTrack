"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { HorseForm } from "@/features/horses/components/horse-form";
import { toast } from "sonner";

export default function NewHorsePage() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/owner/horses", {
        method: "POST",
        body: formData,
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || t("pages.owner.horsesNew.toast.createFailed"));
      }

      toast.success(t("pages.owner.horsesNew.toast.createSuccess"));
      router.push("/owner/horses");
    } catch (err: any) {
      toast.error(err.message || t("pages.owner.horsesNew.toast.error"));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/owner/horses"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] dark:text-white/50 text-muted-foreground hover:dark:text-white text-foreground transition mb-3"
        >
          <ChevronLeft className="size-4" /> {t("common.backToStable")}
        </Link>
      </div>

      <section className="mt-4">
        <HorseForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/owner/horses")}
          isSubmitting={isSubmitting}
        />
      </section>
    </main>
  );
}
