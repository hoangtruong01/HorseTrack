"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Calendar, MapPin, Award, ArrowRight, Flag, Bell, Wallet, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { mockWalletBalances } from "@/features/wallet/mock-wallet";

// Mock Featured Tournaments Data
const mockFeaturedTournaments = [
  {
    id: "tour-01",
    name: "Spring Velocity Cup 2026",
    description: "Giải đấu mùa xuân quy tụ những nài ngựa và chiến mã tốc độ hàng đầu cả nước tranh tài trên cự ly ngắn.",
    status: "ONGOING",
    statusLabel: "Đang diễn ra",
    startDate: "2026-05-15",
    endDate: "2026-06-10",
    location: "Trường đua Phú Thọ, TPHCM",
    prizePool: 50000,
    maxHorses: 24,
    enrolledHorses: 20,
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=600&auto=format&fit=crop",
    color: "from-[#E10600]/20 to-[#E10600]/5",
  },
  {
    id: "tour-02",
    name: "Night Circuit Trophy",
    description: "Thử thách đua đêm kịch tính dưới ánh đèn floodlight rực rỡ tại thành phố biển Đà Nẵng.",
    status: "OPEN_REGISTRATION",
    statusLabel: "Mở đăng ký",
    startDate: "2026-06-15",
    endDate: "2026-07-05",
    location: "Trường đua Coastal, Đà Nẵng",
    prizePool: 75000,
    maxHorses: 16,
    enrolledHorses: 12,
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop",
    color: "from-teal-500/20 to-teal-500/5",
  },
  {
    id: "tour-03",
    name: "Mekong Masters Endurance",
    description: "Giải đấu sức bền vượt chướng ngại vật dọc theo lưu vực sông Mekong đòi hỏi sức dẻo dai phi thường.",
    status: "COMPLETED",
    statusLabel: "Đã kết thúc",
    startDate: "2026-04-01",
    endDate: "2026-04-20",
    location: "Sân vận động Cần Thơ",
    prizePool: 30000,
    maxHorses: 32,
    enrolledHorses: 32,
    image: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=600&auto=format&fit=crop",
    color: "from-yellow-500/20 to-yellow-500/5",
  },
];

// Mock Upcoming Races
const mockUpcomingRaces = [
  {
    id: "race-neon-900",
    name: "Neon Dash 900",
    tournament: "Night Circuit Trophy",
    startTime: "19:30",
    date: "25 May 2026",
    distance: "900m",
    surface: "Synthetic Track",
    status: "SCHEDULED",
  },
  {
    id: "race-aurora-1200",
    name: "Aurora Sprint 1200",
    tournament: "Spring Velocity Cup",
    startTime: "10:00",
    date: "Today",
    distance: "1,200m",
    surface: "Dry turf",
    status: "LIVE",
  },
];

export default function SpectatorDashboardPage() {
  const { t } = useTranslation();
  const userId = "user-spectator-1";
  const [balance] = useState(mockWalletBalances[userId] || 3200);

  return (
    <main className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Premium Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border dark:border-white/10 border-border dark:bg-gradient-to-br dark:from-[#1A1A24] dark:to-[#111116] bg-card p-6 sm:p-8 shadow-[0_24px_48px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 -z-10 dark:bg-[linear-gradient(135deg,rgba(225,6,0,0.15),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(6,126,106,0.1),transparent_30rem)] bg-card animate-pulse duration-[8s]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-primary">
              <Activity className="size-3.5 animate-pulse" /> {t("spectator.header.eyebrow")}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight dark:text-white text-foreground">
              {t("spectator.header.title").split(" & ")[0]} & <span className="text-primary">{t("spectator.header.title").split(" & ")[1] || "Dự Đoán"}</span>
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              {t("spectator.header.description")}
            </p>
          </div>

          {/* Quick Balance Card */}
          <div className="shrink-0 rounded-2xl border dark:border-white/10 border-border dark:bg-white/[0.02] bg-muted/50 p-5 backdrop-blur-md min-w-[240px] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("spectator.wallet.title")}</span>
              <Wallet className="size-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black dark:text-white text-foreground tracking-tight">{balance.toLocaleString()} Pts</p>
              <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">● {t("spectator.wallet.active")}</p>
            </div>
            <Button asChild variant="outline" className="w-full rounded-xl dark:border-white/10 border-border bg-transparent dark:text-white text-foreground hover:dark:bg-white/5 bg-muted/50 text-xs font-bold uppercase tracking-wider">
              <Link href="/spectator/wallet">{t("spectator.wallet.link")}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Grid Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border dark:border-white/5 border-border dark:bg-white/[0.01] bg-muted/50 p-5 space-y-2 hover:dark:border-white/10 border-border transition duration-300">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Trophy className="size-4.5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("spectator.stats.ongoing.label")}</span>
          </div>
          <p className="text-3xl font-black dark:text-white text-foreground">{t("spectator.stats.ongoing.value")}</p>
          <p className="text-xs text-muted-foreground">{t("spectator.stats.ongoing.desc")}</p>
        </div>

        <div className="rounded-2xl border dark:border-white/5 border-border dark:bg-white/[0.01] bg-muted/50 p-5 space-y-2 hover:dark:border-white/10 border-border transition duration-300">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Activity className="size-4.5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("spectator.stats.today.label")}</span>
          </div>
          <p className="text-3xl font-black text-teal-400">{t("spectator.stats.today.value")}</p>
          <p className="text-xs text-muted-foreground">{t("spectator.stats.today.desc")}</p>
        </div>

        <div className="rounded-2xl border dark:border-white/5 border-border dark:bg-white/[0.01] bg-muted/50 p-5 space-y-2 hover:dark:border-white/10 border-border transition duration-300">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Bell className="size-4.5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("spectator.stats.accuracy.label")}</span>
          </div>
          <p className="text-3xl font-black text-yellow-400">{t("spectator.stats.accuracy.value")}</p>
          <p className="text-xs text-muted-foreground">{t("spectator.stats.accuracy.desc")}</p>
        </div>
      </div>

      {/* Main Grid: Featured Tournaments & Sidebar */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Featured Tournaments */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b dark:border-white/10 border-border pb-4">
            <div className="space-y-1">
              <h2 className="text-xl font-black uppercase tracking-tight dark:text-white text-foreground flex items-center gap-2">
                <Trophy className="size-5 text-primary" /> {t("spectator.tournaments.title")}
              </h2>
              <p className="text-xs text-muted-foreground">{t("spectator.tournaments.desc")}</p>
            </div>
            <Button asChild variant="ghost" className="text-xs font-bold uppercase tracking-wider text-primary hover:dark:text-white text-foreground group">
              <Link href="/spectator/tournaments" className="flex items-center gap-1">
                {t("spectator.tournaments.viewAll")} <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {mockFeaturedTournaments.slice(0, 2).map((tour) => (
              <div
                key={tour.id}
                className="group relative overflow-hidden rounded-2xl border dark:border-white/10 border-border dark:bg-[#16161E]/90 bg-card hover:dark:border-white/20 border-border transition duration-300 flex flex-col h-full"
              >
                {/* Image Banner */}
                <div className="h-44 w-full overflow-hidden relative border-b dark:border-white/5 border-border">
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#16161E] via-transparent to-transparent" />
                  
                  {/* Status Badge */}
                  <span className={`absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white border backdrop-blur-md ${
                    tour.status === "ONGOING"
                      ? "bg-[#E10600]/80 border-[#E10600]"
                      : "bg-teal-500/80 border-teal-500"
                  }`}>
                    <span className="size-1.5 rounded-full bg-white animate-ping" />
                    {tour.statusLabel}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-black uppercase tracking-tight dark:text-white text-foreground leading-tight group-hover:text-primary transition duration-300">
                      {tour.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {tour.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t dark:border-white/5 border-border text-[11px] text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><MapPin className="size-3 text-primary" /> {tour.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Calendar className="size-3 text-primary" /> {tour.startDate} ~ {tour.endDate}</span>
                    </div>
                    <div className="flex items-center justify-between font-bold dark:text-white text-foreground border-t dark:border-white/5 border-border pt-2">
                      <span>{t("spectator.tournaments.prizePool")}</span>
                      <span className="text-primary text-xs font-black uppercase tracking-wider">{tour.prizePool.toLocaleString()} Pts</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 mt-auto">
                  <Button asChild className="w-full rounded-xl dark:bg-white/5 bg-muted/50 border dark:border-white/10 border-border text-blackblack hover:bg-primary hover:text-foreground dark:hover:text-white transition duration-300 text-xs font-black uppercase tracking-wider">
                    <Link href={`/spectator/tournaments?id=${tour.id}`}>{t("spectator.tournaments.detailLink")}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Upcoming Races & Quick Bets */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-1 border-b dark:border-white/10 border-border pb-4">
            <h2 className="text-xl font-black uppercase tracking-tight dark:text-white text-foreground flex items-center gap-2">
              <Flag className="size-5 text-primary" /> {t("spectator.upcoming.title")}
            </h2>
            <p className="text-xs text-muted-foreground">{t("spectator.upcoming.desc")}</p>
          </div>

          <div className="space-y-4">
            {mockUpcomingRaces.map((race) => (
              <div
                key={race.id}
                className="rounded-2xl border dark:border-white/5 border-border dark:bg-[#13131A] bg-card p-5 space-y-4 hover:dark:border-white/15 border-border transition duration-300 relative overflow-hidden"
              >
                {race.status === "LIVE" && (
                  <div className="absolute top-0 right-0 w-2 h-full bg-teal-500" />
                )}

                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{race.tournament}</span>
                    <h4 className="font-black dark:text-white text-foreground text-base leading-tight uppercase">{race.name}</h4>
                  </div>
                  {race.status === "LIVE" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-[9px] font-black text-teal-400 uppercase tracking-wider">
                      ● {t("spectator.upcoming.liveNow")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full dark:bg-white/5 bg-muted/50 border dark:border-white/10 border-border px-2 py-0.5 text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                      {race.startTime}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground dark:bg-white/[0.01] bg-muted/50 rounded-xl p-2.5 border dark:border-white/5 border-border">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/60 font-black">{t("spectator.upcoming.distance")}</span>
                    <span className="font-bold dark:text-white text-foreground text-xs">{race.distance}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/60 font-black">{t("spectator.upcoming.surface")}</span>
                    <span className="font-bold dark:text-white text-foreground text-xs truncate block">{race.surface}</span>
                  </div>
                </div>

                <Button asChild className={`w-full rounded-xl text-xs font-black uppercase tracking-wider transition duration-300 ${
                  race.status === "LIVE" 
                    ? "bg-teal-500 hover:bg-teal-600 text-white"
                    : "bg-primary hover:bg-[#B80500] text-white"
                }`}>
                  <Link href="/spectator/predictions">
                    {race.status === "LIVE" ? t("spectator.upcoming.watchLive") : t("spectator.upcoming.predictFree")}
                  </Link>
                </Button>
              </div>
            ))}

            <div className="rounded-2xl border border-[#E10600]/10 bg-[#E10600]/5 p-5 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 size-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-2 text-[#E10600]">
                <Award className="size-4 animate-bounce" />
                <span className="text-xs font-black uppercase tracking-wider">{t("spectator.rules.title")}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {t("spectator.rules.desc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
