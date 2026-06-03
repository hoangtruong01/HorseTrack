export const LANGUAGE_STORAGE_KEY = "language";

export type AppLanguage = "en" | "vi";

export function normalizeLanguage(lng?: string | null): AppLanguage {
  if (!lng) return "vi";
  const base = lng.split("-")[0].toLowerCase();
  return base === "en" ? "en" : "vi";
}

export function readStoredLanguage(): AppLanguage {
  if (typeof window === "undefined") return "vi";
  return normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
}

export function persistLanguage(lng: AppLanguage) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  document.documentElement.lang = lng;
}
