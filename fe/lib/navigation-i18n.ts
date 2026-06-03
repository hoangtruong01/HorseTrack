import type { TFunction } from "i18next";

import type { NavigationItem } from "@/types/navigation";

export function getNavTitle(t: TFunction, item: NavigationItem): string {
  if (item.i18nKey) {
    return t(`navigation.${item.i18nKey}.title`);
  }
  return item.title;
}

export function getNavDescription(
  t: TFunction,
  item: NavigationItem,
): string | undefined {
  if (!item.description && !item.i18nKey) return undefined;
  if (item.i18nKey) {
    return t(`navigation.${item.i18nKey}.description`);
  }
  return item.description;
}
