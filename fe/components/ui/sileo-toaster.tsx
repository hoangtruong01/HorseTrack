"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sileo";

export function SileoToasterWrapper({ duration = 1200 }: { duration?: number }) {
  const { theme = "system" } = useTheme();

  return (
    <Toaster
      position="top-center"
      theme={theme === "dark" || theme === "light" ? theme : "system"}
      options={{
        duration,
        styles: {
          title: "font-bold!",
        },
      }}
    />
  );
}
