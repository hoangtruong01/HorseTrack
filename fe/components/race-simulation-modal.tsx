"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";

// ── Rotating status messages ──
const RACE_MESSAGES = [
  "⚡ Đang khởi động cuộc đua...",
  "🏁 Các chiến mã đang tăng tốc...",
  "🔥 Cuộc đua đang diễn ra gay cấn...",
  "📊 Hệ thống đang phân tích chỉ số ngựa...",
  "🏆 Đang tính toán thứ hạng cán đích...",
  "🐎 Các kỵ sĩ đang nỗ lực hết mình...",
  "💨 Bụi đường đua tung bay...",
];

// ── Lane accent colors ──
const LANE_BG = [
  "border-l-red-500",
  "border-l-blue-500",
  "border-l-emerald-500",
  "border-l-amber-500",
  "border-l-purple-500",
  "border-l-pink-500",
  "border-l-cyan-500",
  "border-l-orange-500",
];

const LANE_ACCENT = [
  "text-red-400",
  "text-blue-400",
  "text-emerald-400",
  "text-amber-400",
  "text-purple-400",
  "text-pink-400",
  "text-cyan-400",
  "text-orange-400",
];

const TRAIL_COLORS = [
  "#ef4444", "#3b82f6", "#10b981", "#f59e0b",
  "#a855f7", "#ec4899", "#06b6d4", "#f97316",
];

interface RaceSimulationModalProps {
  isOpen: boolean;
  horses: Array<{
    id: string;
    name: string;
    breed?: string;
  }>;
}

export function RaceSimulationModal({
  isOpen,
  horses,
}: RaceSimulationModalProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Generate random race durations for each horse (visual only)
  const horseDurations = useMemo(() => {
    return horses.map(() => {
      const base = 3.5;
      const variance = Math.random() * 2;
      return base + variance; // 3.5s – 5.5s
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horses.length, isOpen]);

  // Fake progress bar
  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setIsFinished(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.random() * 12 + 3;
        const next = prev + increment;
        if (next >= 90) return 90;
        return next;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Rotating messages
  useEffect(() => {
    if (!isOpen) {
      setMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % RACE_MESSAGES.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen]);

  // When modal closes, snap to 100%
  useEffect(() => {
    if (!isOpen && progress > 0) {
      setProgress(100);
      setIsFinished(true);
      const timeout = setTimeout(() => {
        setProgress(0);
        setIsFinished(false);
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, progress]);

  if (!isOpen && !isFinished) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 race-modal-backdrop">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0D0D14] shadow-2xl overflow-hidden race-modal-content">
        {/* Decorative gradient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-32 bg-yellow-500/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="size-1.5 rounded-full bg-yellow-400 animate-pulse" />
            Đang giả lập
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            {isFinished ? "✅ Giả Lập Hoàn Tất!" : "Cuộc Đua Đang Diễn Ra..."}
          </h2>
          <p
            className="text-sm text-white/50 font-medium transition-all duration-500"
            key={messageIndex}
          >
            {isFinished
              ? "Kết quả đã sẵn sàng để xem xét"
              : RACE_MESSAGES[messageIndex]}
          </p>
        </div>

        {/* Race Track */}
        <div className="relative px-4 sm:px-6 pb-2">
          <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-emerald-950/20 to-[#0A0A10] overflow-hidden">
            {/* Track Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">
                🚩 Start
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-yellow-400/60">
                🏁 Finish Line
              </span>
            </div>

            {/* Lanes */}
            <div className="relative">
              {/* Finish line - checkered pattern */}
              <div
                className="absolute right-10 top-0 bottom-0 w-1 z-10"
                style={{
                  background:
                    "repeating-linear-gradient(to bottom, #facc15 0px, #facc15 6px, transparent 6px, transparent 12px)",
                  opacity: 0.5,
                }}
              />

              {horses.length === 0 ? (
                <div className="py-12 text-center text-white/30 text-xs">
                  Không có ngựa nào tham gia cuộc đua
                </div>
              ) : (
                horses.map((horse, index) => {
                  const duration = horseDurations[index] ?? 4;
                  const trailColor = TRAIL_COLORS[index % TRAIL_COLORS.length];

                  return (
                    <div
                      key={horse.id || index}
                      className={`relative flex items-center gap-3 px-4 border-l-[3px] ${
                        LANE_BG[index % LANE_BG.length]
                      } ${
                        index < horses.length - 1
                          ? "border-b border-dashed border-white/[0.06]"
                          : ""
                      }`}
                      style={{ height: "56px" }}
                    >
                      {/* Lane number badge */}
                      <div
                        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black bg-white/[0.06] border border-white/10 ${
                          LANE_ACCENT[index % LANE_ACCENT.length]
                        }`}
                      >
                        {index + 1}
                      </div>

                      {/* Horse name */}
                      <div className="shrink-0 w-28 sm:w-36 overflow-hidden">
                        <p className="text-xs font-bold text-white/90 truncate leading-tight">
                          {horse.name}
                        </p>
                        {horse.breed && (
                          <p className="text-[9px] text-white/30 truncate leading-tight mt-0.5">
                            {horse.breed}
                          </p>
                        )}
                      </div>

                      {/* Track lane — horse runs here */}
                      <div className="relative flex-1 h-10 overflow-hidden">
                        {/* Trail glow */}
                        {isOpen && (
                          <div
                            className="horse-trail-anim absolute top-1/2 h-[3px] rounded-full"
                            style={{
                              "--horse-duration": `${duration}s`,
                              background: `linear-gradient(to right, transparent 0%, ${trailColor}44 40%, ${trailColor} 100%)`,
                              width: "0%",
                              marginTop: "-1.5px",
                            } as React.CSSProperties}
                          />
                        )}

                        {/* Horse GIF sprite */}
                        {isOpen && (
                          <div
                            className="horse-sprite-anim absolute"
                            style={{
                              "--horse-duration": `${duration}s`,
                              top: "50%",
                              marginTop: "-18px",
                            } as React.CSSProperties}
                          >
                            <Image
                              src="/skeletonHorse.gif"
                              alt={horse.name}
                              width={36}
                              height={36}
                              unoptimized
                              className="object-contain"
                              style={{
                                filter: "drop-shadow(0 0 8px rgba(255,255,255,0.2)) brightness(1.2)",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative px-6 pt-3 pb-6 space-y-2">
          <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(progress, 100)}%`,
                background:
                  progress >= 100
                    ? "linear-gradient(90deg, #10b981, #34d399)"
                    : "linear-gradient(90deg, #eab308, #f59e0b, #eab308)",
                boxShadow:
                  progress >= 100
                    ? "0 0 12px rgba(16,185,129,0.4)"
                    : "0 0 12px rgba(234,179,8,0.3)",
              }}
            />
          </div>
          <p className="text-center text-[11px] font-bold text-white/40 uppercase tracking-wider">
            {progress >= 100 ? (
              <span className="text-emerald-400">Hoàn tất! 100%</span>
            ) : (
              <>Đang xử lý... {Math.round(progress)}%</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
