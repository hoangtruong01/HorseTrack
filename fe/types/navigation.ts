import type { ComponentType, SVGProps } from "react";

export type NavigationRole =
  | "Admin"
  | "Owner"
  | "Jockey"
  | "Referee"
  | "Spectator"
  | "CounterStaff";

export type NavigationItem = {
  title: string;
  href: string;
  /** Key under `navigation.*` in translation files */
  i18nKey?: string;
  description?: string;
  role?: NavigationRole;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
};
