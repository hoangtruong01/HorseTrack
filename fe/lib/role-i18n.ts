import type { TFunction } from "i18next";

export function normalizeRoleKey(role?: string): string {
  if (!role) return "spectator";
  return role.toLowerCase().replace(/-/g, "_");
}

export function formatRoleLabel(t: TFunction, role?: string): string {
  const key = normalizeRoleKey(role);
  return t(`roles.${key}`, { defaultValue: role ?? "" });
}
