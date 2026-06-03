"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  const { t } = useTranslation();

  return (
    <main className="f1-container flex min-h-screen items-center py-10">
      <EmptyState
        icon={<ShieldAlert className="size-8" aria-hidden="true" />}
        title={t("forbidden.title")}
        description={t("forbidden.description")}
        action={
          <Button
            asChild
            className="rounded-full bg-primary font-bold hover:bg-[#B80500]"
          >
            <Link href="/login">{t("forbidden.action")}</Link>
          </Button>
        }
      />
    </main>
  );
}
