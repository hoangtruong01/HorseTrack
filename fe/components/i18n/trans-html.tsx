"use client";

import { Fragment, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

export type TransHtmlProps = {
  i18nKey: string;
  values?: Record<string, string | number>;
  className?: string;
};

const STRONG_TAG_RE = /<strong>(.*?)<\/strong>/gi;

function parseStrongHtml(text: string) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(STRONG_TAG_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      nodes.push(
        <Fragment key={`text-${key++}`}>{text.slice(lastIndex, index)}</Fragment>,
      );
    }
    nodes.push(<strong key={`strong-${key++}`}>{match[1]}</strong>);
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(<Fragment key={`text-${key++}`}>{text.slice(lastIndex)}</Fragment>);
  }

  return nodes.length > 0 ? nodes : [text];
}

export function TransHtml({ i18nKey, values, className }: TransHtmlProps) {
  const { t } = useTranslation();
  const text = t(i18nKey, values);

  return <span className={cn(className)}>{parseStrongHtml(text)}</span>;
}
