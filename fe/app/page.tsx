"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CalendarDays,
  Compass,
  UserCheck,
  Trophy,
  Target,
  CalendarClock,
  Sparkles,
  Users,
  Flag,
  ChevronRight,
  Mail,
  Clock,
  Tv,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";

// Định nghĩa thông số dữ liệu cho Giao diện
const quickStats = [
  {
    value: "12",
    label: "Active Tournaments",
    desc: "Running this season",
    icon: Trophy,
    color: "text-[#E10600]",
    bg: "bg-[#E10600]/8",
    border: "border-[#E10600]/10",
  },
  {
    value: "256",
    label: "Registered Horses",
    desc: "Across all tournaments",
    icon: Compass,
    color: "text-[#F8CD46]",
    bg: "bg-[#F8CD46]/8",
    border: "border-[#F8CD46]/10",
  },
  {
    value: "98",
    label: "Assigned Jockeys",
    desc: "Ready to compete",
    icon: UserCheck,
    color: "text-[#067E6A]",
    bg: "bg-[#067E6A]/8",
    border: "border-[#067E6A]/10",
  },
  {
    value: "48",
    label: "Completed Races",
    desc: "This season",
    icon: Flag,
    color: "text-[#3B82F6]",
    bg: "bg-[#3B82F6]/8",
    border: "border-[#3B82F6]/10",
  },
];

const upcomingRaces = [
  {
    day: "24",
    month: "MAY",
    weekday: "SAT",
    title: "Morning Heat",
    tournament: "Saigon Derby Tournament",
    time: "08:30 AM",
    location: "Ho Chi Minh City Arena",
    horses: "12 Horses",
    badge: "Registration Open",
    badgeClass: "bg-[#067E6A]/10 text-[#067E6A] border-[#067E6A]/20",
  },
  {
    day: "24",
    month: "MAY",
    weekday: "SAT",
    title: "Coastal Dash",
    tournament: "Coastal Championship",
    time: "11:30 AM",
    location: "Da Nang Racecourse",
    horses: "10 Horses",
    badge: "Registration Closing",
    badgeClass: "bg-[#F8CD46]/10 text-[#F8CD46] border-[#F8CD46]/20",
  },
  {
    day: "24",
    month: "MAY",
    weekday: "SAT",
    title: "Night Circuit",
    tournament: "Winter Racing Series",
    time: "18:45 PM",
    location: "Hanoi Racecourse",
    horses: "14 Horses",
    badge: "Upcoming",
    badgeClass: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20",
  },
];

const roles = [
  {
    name: "Admin",
    desc: "Manage users, tournaments, races, schedules, results and system settings.",
    icon: Trophy,
    color: "text-[#E10600] border-[#E10600]/20 bg-[#E10600]/5",
    btnClass: "bg-[#E10600]/10 hover:bg-[#E10600]/20 text-[#E10600]",
  },
  {
    name: "Horse Owner",
    desc: "Register horses, choose jockeys, track races and view prizes.",
    icon: Compass,
    color: "text-[#F8CD46] border-[#F8CD46]/20 bg-[#F8CD46]/5",
    btnClass: "bg-[#F8CD46]/10 hover:bg-[#F8CD46]/20 text-[#F8CD46]",
  },
  {
    name: "Jockey",
    desc: "Accept race invitations, view assigned races and track performance.",
    icon: UserCheck,
    color: "text-[#067E6A] border-[#067E6A]/20 bg-[#067E6A]/5",
    btnClass: "bg-[#067E6A]/10 hover:bg-[#067E6A]/20 text-[#067E6A]",
  },
  {
    name: "Race Referee",
    desc: "Inspect horses, record violations, confirm results and create reports.",
    icon: Sparkles,
    color: "text-[#3B82F6] border-[#3B82F6]/20 bg-[#3B82F6]/5",
    btnClass: "bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#3B82F6]",
  },
  {
    name: "Spectator",
    desc: "View races, rankings and make predictions to win exciting rewards.",
    icon: Users,
    color: "text-[#A855F7] border-[#A855F7]/20 bg-[#A855F7]/5",
    btnClass: "bg-[#A855F7]/10 hover:bg-[#A855F7]/20 text-[#A855F7]",
  },
];

const coreFeatures = [
  {
    title: "Tournament Management",
    desc: "Create, manage and organize tournaments easily.",
    icon: Trophy,
  },
  {
    title: "Horse Registration",
    desc: "Register and manage horses for races.",
    icon: Compass,
  },
  {
    title: "Jockey Assignment",
    desc: "Assign jockeys to horses and manage agreements.",
    icon: UserCheck,
  },
  {
    title: "Race Scheduling",
    desc: "Create race schedules and manage race days.",
    icon: CalendarClock,
  },
  {
    title: "Referee Report",
    desc: "Record violations and generate referee reports.",
    icon: Sparkles,
  },
  {
    title: "Race Results",
    desc: "Record race results and announcements.",
    icon: Flag,
  },
  {
    title: "Ranking & Leaderboard",
    desc: "Track rankings for horses and jockeys.",
    icon: Target,
  },
  {
    title: "Prediction Management",
    desc: "Allow spectators to predict and win rewards.",
    icon: Tv,
  },
];

export default function Home() {
  const [countdown, setCountdown] = useState("02:45:30");

  // Giả lập đồng hồ đếm ngược trực quan cho Upcoming Race
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        const parts = prev.split(":").map(Number);
        let [h, m, s] = parts;
        s -= 1;
        if (s < 0) {
          s = 59;
          m -= 1;
          if (m < 0) {
            m = 59;
            h -= 1;
            if (h < 0) {
              return "00:00:00";
            }
          }
        }
        return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#07070A] text-white overflow-x-hidden">
      {/* Background radial glows */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(225,6,0,0.14),transparent_32rem),radial-gradient(circle_at_86%_28%,rgba(6,126,106,0.06),transparent_28rem)] opacity-40 z-0" />

      {/* 1. Header (Navbar) */}
      <AppHeader />

      {/* 2. Hero Section */}
      <section className="relative min-h-[580px] lg:min-h-[660px] border-b border-white/5 flex items-center py-16">
        {/* Generated Action Jockey image masked in background */}
        <div
          className="absolute inset-0 bg-cover bg-right lg:bg-center bg-no-repeat opacity-[0.16] pointer-events-none mix-blend-lighten"
          style={{ backgroundImage: "url('/hero_horse_racing.png')" }}
        />
        {/* Soft radial overlay grid to secure text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07070A] via-[#07070A]/85 to-transparent pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full grid gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
          {/* Left Hero Text block */}
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E10600]/30 bg-[#E10600]/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-white">
              <span className="size-2 rounded-full bg-[#E10600] animate-ping" />
              Live Tournament Platform
            </span>

            <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl uppercase">
              Manage Horse Racing <br />
              Tournaments{" "}
              <span className="text-[#E10600] drop-shadow-[0_0_15px_rgba(225,6,0,0.3)]">
                Smarter
              </span>
            </h1>

            <p className="max-w-xl text-base sm:text-lg leading-7 text-white/55 font-medium">
              Register horses, assign jockeys, schedule races, record results,
              track rankings and create predictions – all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/register"
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#E10600] px-8 text-sm font-black uppercase tracking-widest text-white hover:bg-[#B80500] hover:scale-[1.02] active:scale-[0.98] transition shadow-[0_4px_25px_rgba(225,6,0,0.3)]"
              >
                Get Started
                <ArrowRight className="size-4.5" />
              </Link>
              <Link
                href="/races"
                className="flex h-12 items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] px-8 text-sm font-black uppercase tracking-widest text-white transition"
              >
                <CalendarClock className="size-4.5 text-[#E10600]" />
                View Races
              </Link>
            </div>
          </div>

          {/* Right Live Race Status Board */}
          <div className="rounded-[2rem] border border-white/[0.06] bg-[#111118]/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-lg font-black uppercase tracking-wider text-white">
                Live Race Status
              </h2>
              <Link
                href="/races"
                className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-[#E10600] hover:underline"
              >
                View All Races
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {/* Card 1: LIVE */}
              <div className="group relative rounded-2xl border border-white/[0.04] bg-[#07070A]/90 p-4 hover:border-[#E10600]/30 transition-all duration-300">
                <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-[#E10600]/10 border border-[#E10600]/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#E10600]">
                  <span className="size-1.5 rounded-full bg-[#E10600] animate-pulse" />
                  Racing now
                </div>
                <span className="inline-block rounded-md bg-[#E10600] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                  LIVE
                </span>
                <h3 className="mt-2.5 font-black uppercase text-base text-white group-hover:text-[#E10600] transition-colors">
                  Saigon Sprint Race 05
                </h3>
                <div className="mt-2 flex items-center justify-between text-xs text-white/40 font-semibold">
                  <span>📍 Ho Chi Minh City Arena</span>
                  <span className="font-mono text-white/60">14:30</span>
                </div>
              </div>

              {/* Card 2: UPCOMING */}
              <div className="group relative rounded-2xl border border-white/[0.04] bg-[#07070A]/90 p-4 hover:border-[#F8CD46]/30 transition-all duration-300">
                <div className="absolute right-4 top-4 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#F8CD46]">
                  <Clock className="size-3.5" />
                  Starts in {countdown}
                </div>
                <span className="inline-block rounded-md border border-[#F8CD46]/30 bg-[#F8CD46]/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#F8CD46]">
                  UPCOMING
                </span>
                <h3 className="mt-2.5 font-black uppercase text-base text-white group-hover:text-[#F8CD46] transition-colors">
                  Delta Derby Race 07
                </h3>
                <div className="mt-2 flex items-center justify-between text-xs text-white/40 font-semibold">
                  <span>📍 Can Tho Racecourse</span>
                  <span className="font-mono text-white/60">17:00</span>
                </div>
              </div>

              {/* Card 3: FINISHED */}
              <div className="group relative rounded-2xl border border-white/[0.04] bg-[#07070A]/90 p-4 hover:border-[#067E6A]/30 transition-all duration-300">
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#067E6A]/10 border border-[#067E6A]/20 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#067E6A]">
                  Winner: Thunder Bolt
                </div>
                <span className="inline-block rounded-md border border-[#067E6A]/30 bg-[#067E6A]/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#067E6A]">
                  FINISHED
                </span>
                <h3 className="mt-2.5 font-black uppercase text-base text-white group-hover:text-[#067E6A] transition-colors">
                  Capital Race 02
                </h3>
                <div className="mt-2 flex items-center justify-between text-xs text-white/40 font-semibold">
                  <span>📍 Hanoi Racecourse</span>
                  <span className="text-[#067E6A] font-bold">Finished</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Quick Stats Section */}
      <section className="py-12 border-b border-white/5 bg-[#111118]/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={cn(
                    "group flex items-center gap-4 rounded-2xl border p-5 transition hover:bg-white/[0.02]",
                    stat.border,
                  )}
                >
                  <div
                    className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/5",
                      stat.bg,
                      stat.color,
                    )}
                  >
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <span className="block text-3xl font-black text-white leading-none">
                      {stat.value}
                    </span>
                    <span className="block text-xs font-black uppercase tracking-wider text-white/80 mt-1.5 leading-none">
                      {stat.label}
                    </span>
                    <span className="block text-[10px] font-semibold text-white/40 mt-1">
                      {stat.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Upcoming Races Section */}
      <section className="py-20 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.24em] text-[#E10600]">
                Race Schedule Preview
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                Upcoming Races
              </h2>
            </div>
            <Link
              href="/races"
              className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-[#E10600] hover:underline"
            >
              View All Races
              <ChevronRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {upcomingRaces.map((race) => (
              <article
                key={race.title}
                className="group flex flex-col justify-between rounded-[2rem] border border-white/[0.05] bg-[#111118]/60 p-6 hover:border-white/10 hover:bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.15)] transition-all duration-300"
              >
                <div className="space-y-4">
                  {/* Date Badge and Status Badge */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center size-12 rounded-xl bg-white/[0.03] border border-white/5 text-center px-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#E10600] leading-none">
                          {race.month}
                        </span>
                        <span className="text-lg font-black text-white leading-none mt-1">
                          {race.day}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-black text-white/50 leading-none">
                          {race.weekday}
                        </span>
                        <span className="block text-[10px] font-semibold text-white/30 mt-1 leading-none">
                          {race.time}
                        </span>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                        race.badgeClass,
                      )}
                    >
                      {race.badge}
                    </span>
                  </div>

                  {/* Title and details */}
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xl font-black uppercase tracking-wide text-white group-hover:text-[#E10600] transition-colors">
                      {race.title}
                    </h3>
                    <p className="text-xs font-bold text-white/40 leading-none">
                      🏆 {race.tournament}
                    </p>
                    <p className="text-xs text-white/55">📍 {race.location}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-white/60">
                    👥 {race.horses}
                  </span>

                  <Link
                    href={`/races/detail`}
                    className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-[#E10600] border border-[#E10600]/20 bg-[#E10600]/5 hover:bg-[#E10600]/15 rounded-lg px-3 py-1.5 transition"
                  >
                    View Detail
                    <ChevronRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Choose Your Role Section */}
      <section className="py-20 border-b border-white/5 bg-[#111118]/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.24em] text-[#E10600]">
                Access Point Selectors
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                Choose Your Role
              </h2>
            </div>
            <Link
              href="/roles"
              className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-[#E10600] hover:underline"
            >
              Learn more about roles
              <ChevronRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.name}
                  className="group flex flex-col justify-between rounded-2xl border border-white/[0.04] bg-[#111118]/70 p-5 hover:border-white/15 transition-all duration-300"
                >
                  <div className="space-y-4">
                    <div
                      className={cn(
                        "flex size-11 items-center justify-center rounded-xl border",
                        role.color,
                      )}
                    >
                      <Icon className="size-5.5" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase text-white tracking-wider leading-none">
                        {role.name}
                      </h3>
                      <p className="mt-3 text-xs text-white/50 leading-relaxed font-medium">
                        {role.desc}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/login?role=${role.name.toLowerCase().replace(" ", "")}`}
                    className={cn(
                      "mt-5 flex h-9 w-full items-center justify-center rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                      role.btnClass,
                    )}
                  >
                    Explore
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Core Features Section */}
      <section className="py-20 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="space-y-2 text-center">
            <span className="text-xs font-black uppercase tracking-[0.24em] text-[#E10600]">
              Operational Abstractions
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
              Core Features
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {coreFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="group flex items-start gap-4 rounded-2xl border border-white/[0.04] bg-white/[0.01] p-5 hover:border-white/10 hover:bg-white/[0.02] shadow-[0_4px_24px_rgba(0,0,0,0.1)] transition-all duration-200"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E10600]/8 text-[#E10600] border border-[#E10600]/15 group-hover:scale-105 transition-transform">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-xs uppercase text-white tracking-wide leading-none">
                      {feat.title}
                    </h3>
                    <p className="mt-2 text-xs text-white/50 leading-relaxed font-medium">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Newsletter Subscription Section */}
      <section id="contact" className="scroll-mt-24 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.05] bg-[#111118]/85 p-6 sm:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            {/* Glowing gold border lines */}
            <div className="absolute inset-y-12 left-0 w-[2px] bg-gradient-to-b from-transparent via-[#F8CD46] to-transparent shadow-[0_0_10px_rgba(248,205,70,0.8)] opacity-70" />

            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center relative z-10">
              {/* Left side: Champion Cup Image */}
              <div className="flex items-center gap-6">
                <div
                  className="size-24 sm:size-28 shrink-0 bg-contain bg-center bg-no-repeat drop-shadow-[0_0_20px_rgba(248,205,70,0.35)]"
                  style={{ backgroundImage: "url('/subscription_trophy.png')" }}
                />
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[#F8CD46]">
                    Champion Gold Rewards
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white leading-tight">
                    Stay Updated <br />
                    With Horse Racing
                  </h3>
                </div>
              </div>

              {/* Right side: Input and Subscribe CTA */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:pl-8">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#07070A] pl-10.5 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#E10600] focus:ring-4 focus:ring-[#E10600]/15"
                  />
                </div>
                <button
                  type="button"
                  className="h-12 rounded-xl bg-[#E10600] hover:bg-[#B80500] px-8 text-sm font-black uppercase tracking-widest text-white transition hover:scale-[1.01] active:scale-[0.99]"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer Section */}
      <footer className="bg-[#07070A] border-t border-white/5 py-16 text-xs sm:text-sm text-white/40 font-semibold tracking-wide">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-white/5">
          {/* Logo & Desc */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-3 group focus:outline-none"
            >
              <img
                src="/logo.png"
                alt="HorseTrack Logo"
                className="size-11 rounded-2xl object-cover border border-white/10 shadow-[0_0_20px_rgba(225,6,0,0.25)] transition group-hover:scale-105"
              />
              <span className="text-xl font-black uppercase tracking-[0.16em]">
                Horse<span className="text-[#E10600]">Track</span>
              </span>
            </Link>
            <p className="text-xs text-white/40 leading-relaxed font-medium max-w-xs">
              The complete management system for horse racing tournaments.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">
              Quick Links
            </h4>
            <div className="flex flex-col gap-2 text-xs">
              {["Tournaments", "Races", "Rankings", "Predictions"].map(
                (link) => (
                  <Link
                    key={link}
                    href={`/${link.toLowerCase()}`}
                    className="text-white/40 hover:text-white transition"
                  >
                    {link}
                  </Link>
                ),
              )}
            </div>
          </div>

          {/* Support */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">
              Support
            </h4>
            <div className="flex flex-col gap-2 text-xs">
              {["Help Center", "Guides", "FAQ", "Contact Us"].map((link) => (
                <Link
                  key={link}
                  href={`/support`}
                  className="text-white/40 hover:text-white transition"
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>

          {/* Follow Us */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">
              Follow Us
            </h4>
            <div className="flex items-center gap-3">
              <Link
                href="https://facebook.com"
                className="flex size-9 items-center justify-center rounded-xl bg-white/[0.02] border border-white/5 text-white/40 hover:text-[#E10600] hover:border-[#E10600]/30 transition"
              >
                <svg
                  className="size-4.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </Link>
              <Link
                href="https://twitter.com"
                className="flex size-9 items-center justify-center rounded-xl bg-white/[0.02] border border-white/5 text-white/40 hover:text-[#E10600] hover:border-[#E10600]/30 transition"
              >
                <svg
                  className="size-4.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              <Link
                href="https://instagram.com"
                className="flex size-9 items-center justify-center rounded-xl bg-white/[0.02] border border-white/5 text-white/40 hover:text-[#E10600] hover:border-[#E10600]/30 transition"
              >
                <svg
                  className="size-4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </Link>
              <Link
                href="https://youtube.com"
                className="flex size-9 items-center justify-center rounded-xl bg-white/[0.02] border border-white/5 text-white/40 hover:text-[#E10600] hover:border-[#E10600]/30 transition"
              >
                <svg
                  className="size-4.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span>
            © 2026 Horse Racing Tournament Management System. All rights
            reserved.
          </span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
