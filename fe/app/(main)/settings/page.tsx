"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // Đợi component mount để tránh hydration mismatch
  useEffect(() => {
    // This is intentional for preventing hydration mismatch with next-themes
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  // Render placeholder khi chưa mount để tránh flash
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-5xl font-black uppercase tracking-wider text-primary mb-3">
              Cài Đặt
            </h1>
            <p className="text-base text-foreground/60 font-medium">
              Quản lý giao diện và ngôn ngữ cho HorseTrack.
            </p>
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl bg-card p-8 shadow-lg border border-border">
              <h2 className="text-lg font-black uppercase tracking-wider text-primary mb-2">
                Giao Diện
              </h2>
              <p className="text-sm text-foreground/60 font-medium mb-6">
                Chọn chế độ sáng hoặc tối.
              </p>
              <div className="flex gap-4">
                <div className="flex-1 rounded-xl px-6 py-3 bg-secondary/50 animate-pulse h-[42px]"></div>
                <div className="flex-1 rounded-xl px-6 py-3 bg-secondary/50 animate-pulse h-[42px]"></div>
              </div>
            </div>
            <div className="rounded-3xl bg-card p-8 shadow-lg border border-border">
              <h2 className="text-lg font-black uppercase tracking-wider text-primary mb-2">
                Ngôn Ngữ
              </h2>
              <p className="text-sm text-foreground/60 font-medium mb-6">
                Chọn ngôn ngữ hiển thị.
              </p>
              <div className="flex gap-4">
                <div className="flex-1 rounded-xl px-6 py-3 bg-secondary/50 animate-pulse h-[42px]"></div>
                <div className="flex-1 rounded-xl px-6 py-3 bg-secondary/50 animate-pulse h-[42px]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-black uppercase tracking-wider text-primary mb-3">
            Cài Đặt
          </h1>
          <p className="text-base text-foreground/60 font-medium">
            Quản lý giao diện và ngôn ngữ cho HorseTrack.
          </p>
        </div>

        {/* Settings Cards */}
        <div className="space-y-6">
          {/* Theme Card */}
          <div className="rounded-3xl bg-card p-8 shadow-lg border border-border">
            <h2 className="text-lg font-black uppercase tracking-wider text-primary mb-2">
              Giao Diện
            </h2>
            <p className="text-sm text-foreground/60 font-medium mb-6">
              Chọn chế độ sáng hoặc tối.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleThemeChange("light")}
                className={cn(
                  "flex-1 rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wide transition-all",
                  theme === "light"
                    ? "bg-primary text-foreground"
                    : "bg-secondary text-foreground/70 hover:bg-secondary/80"
                )}
              >
                Sáng
              </button>
              <button
                onClick={() => handleThemeChange("dark")}
                className={cn(
                  "flex-1 rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wide transition-all",
                  theme === "dark"
                    ? "bg-primary text-foreground"
                    : "bg-secondary text-foreground/70 hover:bg-secondary/80"
                )}
              >
                Tối
              </button>
            </div>
          </div>

          {/* Language Card */}
          <div className="rounded-3xl bg-card p-8 shadow-lg border border-border">
            <h2 className="text-lg font-black uppercase tracking-wider text-primary mb-2">
              Ngôn Ngữ
            </h2>
            <p className="text-sm text-foreground/60 font-medium mb-6">
              Chọn ngôn ngữ hiển thị.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleLanguageChange("vi")}
                className={cn(
                  "flex-1 rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wide transition-all",
                  i18n.language === "vi"
                    ? "bg-primary text-foreground"
                    : "bg-secondary text-foreground/70 hover:bg-secondary/80"
                )}
              >
                Tiếng Việt
              </button>
              <button
                onClick={() => handleLanguageChange("en")}
                className={cn(
                  "flex-1 rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wide transition-all",
                  i18n.language === "en"
                    ? "bg-primary text-foreground"
                    : "bg-secondary text-foreground/70 hover:bg-secondary/80"
                )}
              >
                Tiếng Anh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}