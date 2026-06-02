import type { LucideIcon } from "lucide-react";

export type AuthRole = "admin" | "owner" | "jockey" | "referee" | "spectator" | "counter_staff";

export type RolePreview = {
  role: AuthRole;
  label: string;
  eyebrow: string;
  description: string;
  entryPath: string;
  icon: LucideIcon;
  highlights: string[];
};

export type MockLoginPayload = {
  email: string;
  password: string;
  role: AuthRole;
  rememberDemo: boolean;
};

export type MockRegisterPayload = {
  fullName: string;
  email: string;
  role: AuthRole;
  password: string;
  acceptPolicy: boolean;
};
