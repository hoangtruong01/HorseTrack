"use client";

import { useTranslation } from "react-i18next";

import { PageHeader, type PageHeaderProps } from "@/components/layout/page-header";

export type TranslatedPageHeaderProps = {
  i18nKey: string;
  actions?: PageHeaderProps["actions"];
  className?: PageHeaderProps["className"];
};

export function TranslatedPageHeader({
  i18nKey,
  actions,
  className,
}: TranslatedPageHeaderProps) {
  const { t } = useTranslation();
  const base = `pages.${i18nKey}`;

  return (
    <PageHeader
      eyebrow={t(`${base}.eyebrow`, { defaultValue: "" }) || undefined}
      title={t(`${base}.title`)}
      description={t(`${base}.description`, { defaultValue: "" }) || undefined}
      actions={actions}
      className={className}
    />
  );
}
