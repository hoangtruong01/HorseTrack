"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Chapter {
  id: string;
  label: string;
}

const CHAPTERS: Chapter[] = [
  { id: "hero", label: "Giới Thiệu" },
  { id: "stats", label: "Quy Mô" },
  { id: "tournaments", label: "Giải Đấu" },
  { id: "rankings", label: "Vinh Quang" },
  { id: "globe", label: "Thế Giới" },
  { id: "features", label: "Hệ Thống" },
  { id: "contact", label: "Kết Nối" },
];

/**
 * Bộ điều hướng chương dạng chấm cố định bên phải màn hình.
 * Tự động highlight chương đang hiển thị và cho phép click để cuộn đến.
 */
export function ChapterNav() {
  const [activeChapter, setActiveChapter] = useState("hero");
  const [visible, setVisible] = useState(false);

  const updateActive = useCallback(() => {
    const scrollY = window.scrollY;
    // Chỉ hiện sau khi cuộn qua 200px
    setVisible(scrollY > 200);

    // Tìm section nào đang chiếm viewport nhiều nhất
    let current = "hero";
    for (const ch of CHAPTERS) {
      const el = document.getElementById(ch.id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.45) {
        current = ch.id;
      }
    }
    setActiveChapter(current);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", updateActive, { passive: true });
    updateActive();
    return () => window.removeEventListener("scroll", updateActive);
  }, [updateActive]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      className={cn(
        "fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-end gap-3 transition-all duration-500",
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
      )}
    >
      {CHAPTERS.map((ch) => {
        const isActive = activeChapter === ch.id;
        return (
          <button
            key={ch.id}
            onClick={() => scrollTo(ch.id)}
            className="group flex items-center gap-2.5 outline-none"
            title={ch.label}
          >
            {/* Label — hiển thị khi hover hoặc active */}
            <span
              className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                isActive
                  ? "opacity-100 text-primary translate-x-0"
                  : "opacity-0 text-muted-foreground translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
              )}
            >
              {ch.label}
            </span>

            {/* Dot */}
            <span
              className={cn(
                "block rounded-full transition-all duration-300 border",
                isActive
                  ? "size-3 bg-primary border-primary shadow-[0_0_10px_rgba(225,6,0,0.5)]"
                  : "size-2 bg-muted-foreground/30 border-muted-foreground/20 group-hover:bg-primary/50 group-hover:border-primary/30"
              )}
            />
          </button>
        );
      })}
    </nav>
  );
}
