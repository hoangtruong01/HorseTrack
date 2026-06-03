"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ErrorStateProps = {
  title?: string;
  description?: string;
  reset?: () => void;
  className?: string;
};

export function ErrorState({ title, description, reset, className }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <section
      className={cn(
        "rounded-lg border border-primary/40 bg-primary/10 p-6 text-center sm:p-8",
        className,
      )}
      role="alert"
    >
      <AlertTriangle
        className="mx-auto size-8 text-primary"
        aria-hidden="true"
      />
      <h2 className="mt-4 text-xl font-black uppercase text-foreground">
        {title ?? t("common.errorState.title")}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        {description ?? t("common.errorState.description")}
      </p>
      {reset ? (
        <Button
          className="mt-5 rounded-full bg-primary font-bold hover:bg-[#B80500]"
          onClick={reset}
        >
          {t("common.errorState.retry")}
        </Button>
      ) : null}
    </section>
  );
}
