"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <main className="f1-container flex min-h-screen items-center py-10">
      <EmptyState
        title={t("notFound.title")}
        description={t("notFound.description")}
        action={
          <Button
            asChild
            className="rounded-full bg-primary font-bold hover:bg-[#B80500]"
          >
            <Link href="/">{t("notFound.backHome")}</Link>
          </Button>
        }
      />
    </main>
  );
}
