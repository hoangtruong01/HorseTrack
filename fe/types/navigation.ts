import type { ComponentType, SVGProps } from "react";

export type NavigationRole =
  | "Admin"
  | "Owner"
  | "Jockey"
  | "Referee"
  | "Spectator";

export type NavigationItem = {
  title: string;
  href: string;
  description?: string;
  role?: NavigationRole;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
};
