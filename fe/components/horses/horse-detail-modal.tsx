"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Trophy,
  Zap,
  Heart,
  Timer,
  Award,
  Calendar,
  User,
  X,
  Sparkles,
  Flame,
  ShieldCheck,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { raceResultsApi, type HorseVictoriesSummary } from "@/lib/api-client";
import { getHorseImage } from "@/lib/utils";

interface HorseDetailModalProps {
  horseId: string | null;
  isOpen: boolean;
  onClose: () => void;
  horseData?: {
    _id?: string;
    id?: string;
    name?: string;
    breed?: string;
    color?: string;
    age?: number;
    weightKg?: number;
    heightCm?: number;
    gender?: string;
    baseSpeed?: number;
    staminaScore?: number;
    description?: string;
    image?: string;
    imageUrl?: string;
    images?: string[];
    ownerName?: string;
  } | null;
}

export function HorseDetailModal({
  horseId,
  isOpen,
  onClose,
  horseData,
}: HorseDetailModalProps) {
  const [summary, setSummary] = useState<HorseVictoriesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"victories" | "all_races">("victories");

  useEffect(() => {
    if (isOpen && horseId) {
      setIsLoading(true);
      raceResultsApi
        .getByHorse(horseId)
        .then((res) => {
          setSummary(res);
        })
        .catch((err) => {
          console.error("Lỗi lấy thành tích chiến mã:", err);
          setSummary(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setSummary(null);
    }
  }, [isOpen, horseId]);

  if (!isOpen) return null;

  const horseName = horseData?.name || "Chiến mã";
  const horseImage = getHorseImage(horseData);

  const formatTime = (ms?: number) => {
    if (!ms) return "—";
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(2);
    return `${minutes}:${seconds.padStart(5, "0")}`;
  };

  const winRate =
    summary && summary.totalRaces > 0
      ? Math.round((summary.wins / summary.totalRaces) * 100)
      : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
              <Trophy className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black uppercase tracking-tight text-foreground">
                Hồ Sơ & Bảng Vàng Danh Hiệu: {horseName}
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Chi tiết thành tích các lần Vô Địch và thông số kỹ thuật chuẩn quốc tế.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Header Info Banner */}
          <div className="grid gap-4 md:grid-cols-12 rounded-2xl border border-border bg-card/60 p-4">
            <div className="md:col-span-4 relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-border flex items-center justify-center">
              {horseImage ? (
                <Image src={horseImage} alt={horseName} fill className="object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground/40">
                  <Award className="size-16 stroke-[1]" />
                  <span className="text-[10px] uppercase tracking-widest mt-2">No Image</span>
                </div>
              )}
            </div>

            <div className="md:col-span-8 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                    Chiến mã chuyên nghiệp
                  </span>
                  <StatusBadge label="Sẵn sàng thi đấu" tone="green" />
                </div>
                <h3 className="text-2xl font-black uppercase text-foreground mt-1">
                  {horseName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Giống: <span className="font-bold text-foreground">{horseData?.breed || "—"}</span> · Màu:{" "}
                  <span className="font-bold text-foreground">{horseData?.color || "—"}</span> · Giới tính:{" "}
                  <span className="font-bold text-foreground">
                    {horseData?.gender === "MALE"
                      ? "Đực"
                      : horseData?.gender === "FEMALE"
                      ? "Cái"
                      : "Thiến"}
                  </span>
                </p>
              </div>

              {/* Stat KPI Pills */}
              <div className="grid grid-cols-4 gap-2 bg-muted/30 rounded-xl p-3 border border-border text-center">
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-muted-foreground font-bold">
                    Vô Địch (Hạng 1)
                  </span>
                  <span className="text-sm font-mono font-black text-yellow-400 flex items-center justify-center gap-1 mt-0.5">
                    <Trophy className="size-3.5 text-yellow-500" /> {summary?.wins ?? 0}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-muted-foreground font-bold">
                    Tỷ Lệ Thắng
                  </span>
                  <span className="text-sm font-mono font-black text-emerald-400 mt-0.5 block">
                    {winRate}%
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-muted-foreground font-bold">
                    Tổng Trận
                  </span>
                  <span className="text-sm font-mono font-black text-foreground mt-0.5 block">
                    {summary?.totalRaces ?? 0}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-muted-foreground font-bold">
                    Điểm Tích Lũy
                  </span>
                  <span className="text-sm font-mono font-black text-teal-400 mt-0.5 block">
                    +{summary?.totalPoints ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("victories")}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition ${
                activeTab === "victories"
                  ? "border-yellow-500 text-yellow-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Trophy className="size-4 text-yellow-500" /> Bảng Vàng Vô Địch ({summary?.championships.length ?? 0})
            </button>
            <button
              onClick={() => setActiveTab("all_races")}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition ${
                activeTab === "all_races"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Flame className="size-4 text-primary" /> Tất Cả Lịch Sử Thi Đấu ({summary?.allResults.length ?? 0})
            </button>
          </div>

          {/* Content Area */}
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground text-xs animate-pulse">
              Đang tải danh hiệu và lịch sử thi đấu...
            </div>
          ) : activeTab === "victories" ? (
            /* Championships / Wins list */
            !summary || summary.championships.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card/40 p-8 text-center text-muted-foreground">
                <Trophy className="size-10 mx-auto mb-2 opacity-20 text-yellow-500" />
                <p className="font-bold text-xs uppercase tracking-widest text-foreground">Chưa có danh hiệu Vô Địch</p>
                <p className="text-xs mt-1">Chiến mã này đang nỗ lực thi đấu để giành chiếc cúp vô địch đầu tiên.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {summary.championships.map((res) => {
                  const raceObj = typeof res.raceId === "object" ? res.raceId : null;
                  const tourObj = raceObj && typeof raceObj.tournamentId === "object" ? raceObj.tournamentId : null;
                  const jockeyObj = typeof res.jockeyUserId === "object" ? res.jockeyUserId : null;

                  return (
                    <div
                      key={res.id}
                      className="group relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-card to-card p-4 shadow-[0_4px_24px_rgba(234,179,8,0.08)] transition duration-300 hover:border-yellow-500/60"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-yellow-400 border border-yellow-500/30">
                              🏆 QUÁN QUÂN (HANG 1)
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                              <Calendar className="size-3 text-yellow-500" />
                              {raceObj?.startTime
                                ? new Date(raceObj.startTime).toLocaleDateString("vi-VN")
                                : "N/A"}
                            </span>
                          </div>

                          <h4 className="text-sm font-black uppercase text-foreground group-hover:text-yellow-400 transition">
                            {tourObj?.name ? `${tourObj.name} · ` : ""}{raceObj?.name || "Giải đấu chính thức"}
                          </h4>

                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>
                              Nài ngựa điều khiển:{" "}
                              <strong className="text-foreground">{jockeyObj?.fullName || "—"}</strong>
                            </span>
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono font-black text-foreground block">
                            {formatTime(res.finishTimeMs)}
                          </span>
                          <span className="text-[10px] font-bold text-teal-400 block mt-1">
                            +{res.points || 10} điểm
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* All races list */
            !summary || summary.allResults.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card/40 p-8 text-center text-muted-foreground">
                <p className="font-bold text-xs uppercase tracking-widest text-foreground">Chưa có dữ liệu thi đấu</p>
              </div>
            ) : (
              <div className="space-y-2">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground font-black uppercase tracking-wider">
                      <th className="p-3 w-14 text-center">Hạng</th>
                      <th className="p-3">Giải / Trận Đua</th>
                      <th className="p-3">Nài Ngựa</th>
                      <th className="p-3">Thời gian</th>
                      <th className="p-3 text-right">Điểm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {summary.allResults.map((res) => {
                      const raceObj = typeof res.raceId === "object" ? res.raceId : null;
                      const tourObj = raceObj && typeof raceObj.tournamentId === "object" ? raceObj.tournamentId : null;
                      const jockeyObj = typeof res.jockeyUserId === "object" ? res.jockeyUserId : null;

                      return (
                        <tr key={res.id} className="hover:bg-muted/30 transition">
                          <td className="p-3 text-center">
                            <span
                              className={`inline-flex items-center justify-center size-6 rounded-full font-black text-xs ${
                                res.rank === 1
                                  ? "bg-yellow-500 text-black font-extrabold"
                                  : res.rank === 2
                                  ? "bg-slate-200 text-slate-900 border border-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
                                  : res.rank === 3
                                  ? "bg-amber-700 text-amber-100 dark:bg-[#CD7F32] dark:text-white"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {res.rank || "—"}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-foreground">
                            {tourObj?.name ? `${tourObj.name} - ` : ""}{raceObj?.name || "Trận đua"}
                          </td>
                          <td className="p-3 text-muted-foreground">{jockeyObj?.fullName || "—"}</td>
                          <td className="p-3 font-mono font-bold text-foreground">
                            {res.outcome === "finished" ? formatTime(res.finishTimeMs) : "Không hoàn thành"}
                          </td>
                          <td className="p-3 text-right font-black text-teal-600 dark:text-teal-400">
                            +{res.points || 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
