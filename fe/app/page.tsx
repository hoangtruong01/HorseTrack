"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
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
import { useTranslation } from "react-i18next";

// Định nghĩa thông số dữ liệu cho Giao diện
const quickStats = [
  {
    key: "tournaments",
    value: "12",
    label: "Active Tournaments",
    desc: "Running this season",
    icon: Trophy,
    color: "text-[#E10600]",
    bg: "bg-[#E10600]/8",
    border: "border-[#E10600]/10",
  },
  {
    key: "horses",
    value: "256",
    label: "Registered Horses",
    desc: "Across all tournaments",
    icon: Compass,
    color: "text-[#F8CD46]",
    bg: "bg-[#F8CD46]/8",
    border: "border-[#F8CD46]/10",
  },
  {
    key: "jockeys",
    value: "98",
    label: "Assigned Jockeys",
    desc: "Ready to compete",
    icon: UserCheck,
    color: "text-[#067E6A]",
    bg: "bg-[#067E6A]/8",
    border: "border-[#067E6A]/10",
  },
  {
    key: "races",
    value: "48",
    label: "Completed Races",
    desc: "This season",
    icon: Flag,
    color: "text-[#3B82F6]",
    bg: "bg-[#3B82F6]/8",
    border: "border-[#3B82F6]/10",
  },
];

const roles = [
  {
    key: "admin",
    name: "Admin",
    desc: "Manage users, tournaments, races, schedules, results and system settings.",
    icon: Trophy,
    color: "text-[#E10600] border-[#E10600]/20 bg-[#E10600]/5",
    btnClass: "bg-[#E10600]/10 hover:bg-[#E10600]/20 text-[#E10600]",
  },
  {
    key: "owner",
    name: "Horse Owner",
    desc: "Register horses, choose jockeys, track races and view prizes.",
    icon: Compass,
    color: "text-[#F8CD46] border-[#F8CD46]/20 bg-[#F8CD46]/5",
    btnClass: "bg-[#F8CD46]/10 hover:bg-[#F8CD46]/20 text-[#F8CD46]",
  },
  {
    key: "jockey",
    name: "Jockey",
    desc: "Accept race invitations, view assigned races and track performance.",
    icon: UserCheck,
    color: "text-[#067E6A] border-[#067E6A]/20 bg-[#067E6A]/5",
    btnClass: "bg-[#067E6A]/10 hover:bg-[#067E6A]/20 text-[#067E6A]",
  },
  {
    key: "referee",
    name: "Race Referee",
    desc: "Inspect horses, record violations, confirm results and create reports.",
    icon: Sparkles,
    color: "text-[#3B82F6] border-[#3B82F6]/20 bg-[#3B82F6]/5",
    btnClass: "bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#3B82F6]",
  },
  {
    key: "spectator",
    name: "Spectator",
    desc: "View races, rankings and make predictions to win exciting rewards.",
    icon: Users,
    color: "text-[#A855F7] border-[#A855F7]/20 bg-[#A855F7]/5",
    btnClass: "bg-[#A855F7]/10 hover:bg-[#A855F7]/20 text-[#A855F7]",
  },
];

const coreFeatures = [
  {
    key: "feat1",
    title: "Tournament Management",
    desc: "Create, manage and organize tournaments easily.",
    icon: Trophy,
  },
  {
    key: "feat2",
    title: "Horse Registration",
    desc: "Register and manage horses for races.",
    icon: Compass,
  },
  {
    key: "feat3",
    title: "Jockey Assignment",
    desc: "Assign jockeys to horses and manage agreements.",
    icon: UserCheck,
  },
  {
    key: "feat4",
    title: "Race Scheduling",
    desc: "Create race schedules and manage race days.",
    icon: CalendarClock,
  },
  {
    key: "feat5",
    title: "Referee Report",
    desc: "Record violations and generate referee reports.",
    icon: Sparkles,
  },
  {
    key: "feat6",
    title: "Race Results",
    desc: "Record race results and announcements.",
    icon: Flag,
  },
  {
    key: "feat7",
    title: "Ranking & Leaderboard",
    desc: "Track rankings for horses and jockeys.",
    icon: Target,
  },
  {
    key: "feat8",
    title: "Prediction Management",
    desc: "Allow spectators to predict and win rewards.",
    icon: Tv,
  },
];

export default function Home() {
  const { t } = useTranslation();
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
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* 1. Header (Navbar) */}
      <AppHeader />

      {/* 2. Hero Section */}
      <section className="relative min-h-[580px] lg:min-h-[660px] border-b border-border flex items-center py-16">
        {/* Generated Action Jockey image masked in background */}
        <div
          className="absolute inset-0 bg-cover bg-right lg:bg-center bg-no-repeat opacity-[0.16] pointer-events-none mix-blend-lighten"
          style={{ backgroundImage: "url('/hero_horse_racing.png')" }}
        />
        {/* Soft radial overlay grid to secure text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full grid gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
          {/* Left Hero Text block */}
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-foreground">
              <span className="size-2 rounded-full bg-primary animate-ping" />
              {t("homepage.badge", "Live Tournament Platform")}
            </span>

            <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl uppercase">
              {t("homepage.heroTitle1", "Manage Horse Racing")} <br />
              {t("homepage.heroTitle2", "Tournaments")}{" "}
              <span className="text-primary drop-shadow-[0_0_15px_rgba(225,6,0,0.3)]">
                {t("homepage.heroTitleHighlight", "Smarter")}
              </span>
            </h1>

            <p className="max-w-xl text-base sm:text-lg leading-7 text-foreground/55 font-medium">
              {t("homepage.heroSubtitle", "Register horses, assign jockeys, schedule races, record results, track rankings and create predictions – all in one platform.")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/register"
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition shadow-[0_4px_25px_rgba(225,6,0,0.3)]"
              >
                {t("homepage.getStarted", "Get Started")}
                <ArrowRight className="size-4.5" />
              </Link>
              <Link
                href="/races"
                className="flex h-12 items-center justify-center gap-2.5 rounded-xl border border-border bg-secondary/50 hover:bg-secondary px-8 text-sm font-black uppercase tracking-widest text-foreground transition"
              >
                <CalendarClock className="size-4.5 text-primary" />
                {t("homepage.viewRaces", "View Races")}
              </Link>
            </div>
          </div>

          {/* Right Live Race Status Board */}
          <div className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-black uppercase tracking-wider text-foreground">
                {t("homepage.liveRaceStatus", "Live Race Status")}
              </h2>
              <Link
                href="/races"
                className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-primary hover:underline"
              >
                {t("homepage.viewAllRaces", "View All Races")}
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {/* Card 1: LIVE */}
              <div className="group relative rounded-2xl border border-border bg-card/90 p-4 hover:border-primary/30 transition-all duration-300">
                <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                  {t("homepage.racingNow", "Racing now")}
                </div>
                <span className="inline-block rounded-md bg-primary px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary-foreground">
                  {t("homepage.live", "LIVE")}
                </span>
                <h3 className="mt-2.5 font-black uppercase text-base text-foreground group-hover:text-primary transition-colors">
                  Saigon Sprint Race 05
                </h3>
                <div className="mt-2 flex items-center justify-between text-xs text-foreground/40 font-semibold">
                  <span>📍 Ho Chi Minh City Arena</span>
                  <span className="font-mono text-foreground/60">14:30</span>
                </div>
              </div>

               {/* Card 2: UPCOMING */}
               <div className="group relative rounded-2xl border border-border bg-card/90 p-4 hover:border-chart-3/30 transition-all duration-300">
                <div className="absolute right-4 top-4 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-chart-3">
                  <Clock className="size-3.5" />
                  {t("homepage.startsIn", "Starts in")} {countdown}
                </div>
                <span className="inline-block rounded-md border border-chart-3/30 bg-chart-3/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-chart-3">
                  {t("homepage.upcoming", "UPCOMING")}
                </span>
                <h3 className="mt-2.5 font-black uppercase text-base text-foreground group-hover:text-chart-3 transition-colors">
                  Delta Derby Race 07
                </h3>
                <div className="mt-2 flex items-center justify-between text-xs text-foreground/40 font-semibold">
                  <span>📍 Can Tho Racecourse</span>
                  <span className="font-mono text-foreground/60">17:00</span>
                </div>
              </div>

              {/* Card 3: FINISHED */}
              <div className="group relative rounded-2xl border border-border bg-card/90 p-4 hover:border-chart-2/30 transition-all duration-300">
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-chart-2/10 border border-chart-2/20 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-chart-2">
                  {t("homepage.winner", "Winner")}: Thunder Bolt
                </div>
                <span className="inline-block rounded-md border border-chart-2/30 bg-chart-2/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-chart-2">
                  {t("homepage.finished", "FINISHED")}
                </span>
                <h3 className="mt-2.5 font-black uppercase text-base text-foreground group-hover:text-chart-2 transition-colors">
                  Capital Race 02
                </h3>
                <div className="mt-2 flex items-center justify-between text-xs text-foreground/40 font-semibold">
                  <span>📍 Hanoi Racecourse</span>
                  <span className="text-chart-2 font-bold">{t("homepage.finished", "FINISHED")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Quick Stats Section */}
      <section className="py-12 border-b border-border bg-secondary/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.key}
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
                    <span className="block text-3xl font-black text-foreground leading-none">
                      {stat.value}
                    </span>
                    <span className="block text-xs font-black uppercase tracking-wider text-foreground/80 mt-1.5 leading-none">
                      {t(`homepage.quickStats.${stat.key}.label`, stat.label)}
                    </span>
                    <span className="block text-[10px] font-semibold text-foreground/40 mt-1">
                      {t(`homepage.quickStats.${stat.key}.desc`, stat.desc)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* 5. Choose Your Role Section */}
      <section className="py-20 border-b border-border bg-secondary/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
           <div className="flex items-end justify-between">
             <div className="space-y-2">
               <span className="text-xs font-black uppercase tracking-[0.24em] text-primary">
                 {t("homepage.roles.eyebrow", "Access Point Selectors")}
               </span>
               <h2 className="text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
                 {t("homepage.roles.title", "Choose Your Role")}
               </h2>
             </div>
             <Link
               href="/roles"
               className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-primary hover:underline"
            >
              {t("homepage.roles.learnMore", "Learn more about roles")}
              <ChevronRight className="size-3.5" />
            </Link>
          </div>

           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
             {roles.map((role) => {
               const Icon = role.icon;
               return (
                 <div
                   key={role.key}
                   className="group flex flex-col justify-between rounded-2xl border border-border bg-card/70 p-5 hover:border-primary/15 transition-all duration-300"
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
                       <h3 className="font-black text-sm uppercase text-foreground tracking-wider leading-none">
                         {t(`homepage.roles.${role.key}.name`, role.name)}
                       </h3>
                       <p className="mt-3 text-xs text-foreground/50 leading-relaxed font-medium">
                        {t(`homepage.roles.${role.key}.desc`, role.desc)}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/login?role=${role.key}`}
                    className={cn(
                      "mt-5 flex h-9 w-full items-center justify-center rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                      role.btnClass,
                    )}
                  >
                    {t("homepage.roles.explore", "Explore")}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Core Features Section */}
      <section className="py-20 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
           <div className="space-y-2 text-center">
             <span className="text-xs font-black uppercase tracking-[0.24em] text-primary">
               {t("homepage.features.eyebrow", "Operational Abstractions")}
             </span>
             <h2 className="text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
              {t("homepage.features.title", "Core Features")}
            </h2>
           </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {coreFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                 <div
                   key={feat.key}
                   className="group flex items-start gap-4 rounded-2xl border border-border bg-secondary/50 p-5 hover:border-primary/10 hover:bg-secondary shadow-[0_4px_24px_rgba(0,0,0,0.1)] transition-all duration-200"
                 >
                   <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary border border-primary/15 group-hover:scale-105 transition-transform">
                     <Icon className="size-5" />
                   </div>
                   <div>
                     <h3 className="font-black text-xs uppercase text-foreground tracking-wide leading-none">
                       {t(`homepage.features.${feat.key}.title`, feat.title)}
                     </h3>
                     <p className="mt-2 text-xs text-foreground/50 leading-relaxed font-medium">
                      {t(`homepage.features.${feat.key}.desc`, feat.desc)}
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
           <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card/85 p-6 sm:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">
             {/* Glowing gold border lines */}
             <div className="absolute inset-y-12 left-0 w-[2px] bg-gradient-to-b from-transparent via-chart-3 to-transparent shadow-[0_0_10px_rgba(248,205,70,0.8)] opacity-70" />

            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center relative z-10">
              {/* Left side: Champion Cup Image */}
              <div className="flex items-center gap-6">
                <div
                  className="size-24 sm:size-28 shrink-0 bg-contain bg-center bg-no-repeat drop-shadow-[0_0_20px_rgba(248,205,70,0.35)]"
                   style={{ backgroundImage: "url('/subscription_trophy.png')" }}
                 />
                 <div className="space-y-1.5">
                   <span className="text-[10px] font-black uppercase tracking-[0.24em] text-chart-3">
                     {t("homepage.newsletter.eyebrow", "Champion Gold Rewards")}
                   </span>
                   <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-foreground leading-tight">
                    {t("homepage.newsletter.title", "Stay Updated")} <br /> {t("homepage.newsletter.titleBreak", "With Horse Racing")}
                  </h3>
                </div>
              </div>

               {/* Right side: Input and Subscribe CTA */}
               <div className="flex flex-col sm:flex-row gap-3 w-full lg:pl-8">
                 <div className="relative flex-1">
                   <Mail className="absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-foreground/30" />
                   <input
                     type="email"
                     required
                     placeholder={t("homepage.newsletter.placeholder", "Enter your email")}
                     className="h-12 w-full rounded-xl border border-border bg-background pl-10.5 pr-4 text-sm text-foreground placeholder:text-foreground/30 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                   />
                 </div>
                 <button
                   type="button"
                   className="h-12 rounded-xl bg-primary hover:bg-primary/90 px-8 text-sm font-black uppercase tracking-widest text-primary-foreground transition hover:scale-[1.01] active:scale-[0.99]"
                 >{t("homepage.newsletter.subscribe", "Subscribe")}</button>
              </div>
            </div>
          </div>
        </div>
      </section>

       {/* 8. Footer Section */}
      <footer className="bg-background border-t border-border py-16 text-xs sm:text-sm text-foreground/40 font-semibold tracking-wide">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-border">
          {/* Logo & Desc */}
          <div className="space-y-4">
             <Link
               href="/"
               className="flex items-center gap-3 group focus:outline-none"
             >
               <Image
                 src="/logo.png"
                 alt="HorseTrack Logo"
                 width={44}
                 height={44}
                 className="size-11 rounded-2xl object-cover border border-border shadow-[0_0_20px_rgba(225,6,0,0.25)] transition group-hover:scale-105"
               />
               <span className="text-xl font-black uppercase tracking-[0.16em]">
                 Horse<span className="text-primary">Track</span>
               </span>
             </Link>
             <p className="text-xs text-foreground/40 leading-relaxed font-medium max-w-xs">
              {t("homepage.footer.desc", "The complete management system for horse racing tournaments.")}
            </p>
          </div>

           {/* Quick Links */}
           <div className="space-y-3.5">
             <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">{t("homepage.footer.quickLinks", "Quick Links")}</h4>
             <div className="flex flex-col gap-2 text-xs">
               {["Tournaments", "Races", "Rankings", "Predictions"].map(
                 (link) => (
                   <Link
                     key={link}
                     href={`/${link.toLowerCase()}`}
                     className="text-foreground/40 hover:text-foreground transition"
                   >
                     {link}
                   </Link>
                 ),
               )}
             </div>
           </div>

           {/* Support */}
           <div className="space-y-3.5">
             <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">{t("homepage.footer.support", "Support")}</h4>
             <div className="flex flex-col gap-2 text-xs">
               {["Help Center", "Guides", "FAQ", "Contact Us"].map((link) => (
                 <Link
                   key={link}
                   href={`/support`}
                   className="text-foreground/40 hover:text-foreground transition"
                 >
                   {link}
                 </Link>
               ))}
             </div>
           </div>

           {/* Follow Us */}
           <div className="space-y-3.5">
             <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">{t("homepage.footer.followUs", "Follow Us")}</h4>
             <div className="flex items-center gap-3">
               <Link
                 href="https://facebook.com"
                 className="flex size-9 items-center justify-center rounded-xl bg-secondary border border-border text-foreground/40 hover:text-primary hover:border-primary/30 transition"
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
                 className="flex size-9 items-center justify-center rounded-xl bg-secondary border border-border text-foreground/40 hover:text-primary hover:border-primary/30 transition"
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
                 className="flex size-9 items-center justify-center rounded-xl bg-secondary border border-border text-foreground/40 hover:text-primary hover:border-primary/30 transition"
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
                 className="flex size-9 items-center justify-center rounded-xl bg-secondary border border-border text-foreground/40 hover:text-primary hover:border-primary/30 transition"
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
             {t("homepage.footer.copyright", "© 2026 Horse Racing Tournament Management System. All rights reserved.")}
           </span>
           <div className="flex gap-4">
             <Link href="/privacy" className="hover:text-foreground transition">{t("homepage.footer.privacy", "Privacy Policy")}</Link>
             <Link href="/terms" className="hover:text-foreground transition">{t("homepage.footer.terms", "Terms of Service")}</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
