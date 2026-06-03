"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Award,
  Calendar,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Eye,
  Flag,
  Info,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Users,
  X,
  XCircle,
  TrendingDown,
  CheckCircle,
  HelpCircle,
  DollarSign
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/data-display/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { normalizeLanguage } from "@/lib/i18n-language";
import { toast } from "sonner";

// Types
type JockeyStats = {
  races: {
    participated: number;
    wins: number;
    winRate: number;
  };
  totalPoints: number;
  invitations: {
    pendingCount: number;
  };
};

type OwnerInfo = {
  fullName: string;
  email: string;
  phone?: string;
};

type HorseInfoCompact = {
  _id: string;
  name: string;
  breed: string;
};

type RaceInfoCompact = {
  _id: string;
  name: string;
  startTime: string;
  status: string;
};

type Invitation = {
  _id: string;
  registrationId: string;
  raceId: RaceInfoCompact;
  horseId: HorseInfoCompact;
  ownerId: OwnerInfo;
  jockeyUserId: string;
  message?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "EXPIRED";
  expiredAt?: string;
  createdAt: string;
  respondedAt?: string;
};

type HorseDetail = {
  _id: string;
  name: string;
  breed: string;
  age: number;
  gender: string;
  color?: string;
  weightKg: number;
  heightCm: number;
  healthStatus: "HEALTHY" | "INJURED" | "SICK";
  status: "active" | "inactive";
  description?: string;
  image?: string;
  baseSpeed?: number;
  staminaScore?: number;
  ownerId?: string | { _id: string; fullName: string };
};

export function JockeyDashboard() {
  const { t, i18n } = useTranslation();
  const dateLocale = normalizeLanguage(i18n.language) === "en" ? "en-US" : "vi-VN";
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "invitations" | "assigned" | "horses" | "performance">("dashboard");

  useEffect(() => {
    if (tabParam === "invitations" || tabParam === "assigned" || tabParam === "horses" || tabParam === "performance") {
      setActiveTab(tabParam);
    } else {
      setActiveTab("dashboard");
    }
  }, [tabParam]);

  // State variables
  const [stats, setStats] = useState<JockeyStats | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingInvs, setIsLoadingInvs] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // Profile status
  const [profile, setProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Selected horse detail for Modal
  const [selectedHorseId, setSelectedHorseId] = useState<string | null>(null);
  const [horseDetail, setHorseDetail] = useState<HorseDetail | null>(null);
  const [isLoadingHorse, setIsLoadingHorse] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    setIsLoadingStats(true);
    setIsLoadingInvs(true);
    setIsLoadingProfile(true);

    try {
      // 1. Fetch Stats
      const statsRes = await fetch("/api/jockey/dashboard");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }

      // 2. Fetch Invitations
      const invsRes = await fetch("/api/jockey/invitations");
      if (invsRes.ok) {
        const invsData = await invsRes.json();
        if (invsData.success) {
          setInvitations(invsData.data || []);
        }
      }

      // 3. Fetch Profile
      const profileRes = await fetch("/api/auth/me");
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success) {
          setProfile(profileData.user);
        }
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu Jockey:", err);
      toast.error(t("jockey.ui.loadError"));
    } finally {
      setIsLoadingStats(false);
      setIsLoadingInvs(false);
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle invitation response (ACCEPT / REJECT)
  const handleRespondInvitation = async (id: string, responseStatus: "ACCEPTED" | "REJECTED") => {
    setSubmittingId(id);
    const actionLabel = responseStatus === "ACCEPTED" ? t("jockey.ui.accept") : t("jockey.ui.reject");

    try {
      const res = await fetch(`/api/jockey/invitations/${id}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: responseStatus }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || `Thao tác ${actionLabel.toLowerCase()} lời mời thất bại.`);
      }

      toast.success(t("jockey.ui.respondSuccess", { action: actionLabel.toLowerCase() }));
      // Reload data to reflect change
      await fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || `Lỗi khi thực hiện thao tác.`);
    } finally {
      setSubmittingId(null);
    }
  };

  // Fetch Horse details and open modal
  const handleViewHorseDetail = async (horseId: string) => {
    setSelectedHorseId(horseId);
    setIsLoadingHorse(true);
    setHorseDetail(null);

    try {
      const res = await fetch(`/api/jockey/horses/${horseId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setHorseDetail(data.data);
        }
      } else {
        toast.error(t("jockey.ui.horseFetchError"));
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin chiến mã:", err);
      toast.error(t("jockey.ui.connectionError"));
    } finally {
      setIsLoadingHorse(false);
    }
  };

  // Filtering invitations for specific sections
  const pendingInvs = invitations.filter((inv) => inv.status === "PENDING");
  const acceptedInvs = invitations.filter((inv) => inv.status === "ACCEPTED");

  // Format Date utility
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return t("jockey.ui.dateUnknown");
    const d = new Date(dateStr);
    return `${d.toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" })} ${t("jockey.ui.dateAt")} ${d.toLocaleDateString(dateLocale)}`;
  };

  // Stats Card Grid Config
  const statsCards = [
    {
      label: t("jockey.stats.races.label"),
      value: isLoadingStats ? "..." : (stats?.races.participated || 0).toString(),
      helper: t("jockey.stats.races.helper"),
      icon: Flag,
      tone: "neutral" as const,
      trend: t("jockey.stats.races.trend"),
    },
    {
      label: t("jockey.stats.wins.label"),
      value: isLoadingStats ? "..." : (stats?.races.wins || 0).toString(),
      helper: `${t("jockey.stats.wins.helper")}: ${isLoadingStats ? "..." : (stats?.races.winRate || 0)}%`,
      icon: Award,
      tone: "red" as const,
      trend: t("jockey.stats.wins.trend"),
    },
    {
      label: t("jockey.stats.points.label"),
      value: isLoadingStats ? "..." : `${stats?.totalPoints || 0} đ`,
      helper: t("jockey.stats.points.helper"),
      icon: ClipboardCheck,
      tone: "teal" as const,
      trend: t("jockey.stats.points.trend"),
    },
  ];

  return (
    <main className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Page Header */}
      <PageHeader
        eyebrow={t("jockey.header.eyebrow")}
        title={isLoadingProfile ? t("jockey.header.titleLoading") : `${t("jockey.header.title")}: ${profile?.fullName}`}
        description={t("jockey.header.description")}
      />

      {/* Profile/Status Alert Banner */}
      <section className="relative overflow-hidden rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E] bg-card p-5 shadow-[0_22px_70px_rgba(0,0,0,0.34)] sm:p-6">
        <div className="absolute inset-0 dark:bg-[linear-gradient(120deg,rgba(225,6,0,0.1),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(6,126,106,0.1),transparent_25rem)] bg-card" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E10600] to-transparent" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                {t("jockey.hero.badge")}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t("jockey.hero.online")}
              </span>
            </div>
            <h2 className="mt-3 text-xl font-black uppercase tracking-tight dark:text-white text-foreground sm:text-2xl">
              {t("jockey.hero.title")}
            </h2>
            <p className="mt-1 text-xs dark:text-white/50 text-muted-foreground leading-relaxed max-w-xl">
              {t("jockey.hero.description")}
            </p>
          </div>

          {pendingInvs.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-3 text-white max-w-sm self-start md:self-auto animate-bounce">
              <ShieldAlert className="size-5 text-primary shrink-0" />
              <div>
                <h4 className="text-xs font-black uppercase dark:text-white text-foreground">{t("jockey.hero.newInvites")}</h4>
                <p className="text-[10px] dark:text-white/70 text-muted-foreground mt-0.5">{t("jockey.hero.newInvitesDesc").replace("{count}", pendingInvs.length.toString())}</p>
              </div>
            </div>
          )}
        </div>
      </section>



      {/* Main Tab Content */}
      <section className="min-h-[400px]">
        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {statsCards.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Box 1: Upcoming Schedule */}
              <div className="rounded-2xl border dark:border-white/5 border-border dark:bg-[#15151E] bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider dark:text-white text-foreground flex items-center gap-2">
                    <Calendar className="size-4 text-teal-400" />
                    {t("jockey.ui.scheduleTitle")}
                  </h3>
                  <button
                    onClick={() => setActiveTab("assigned")}
                    className="text-xs text-primary font-bold hover:underline flex items-center"
                  >
                    {t("jockey.ui.viewAll")} <ChevronRight className="size-3.5" />
                  </button>
                </div>

                {isLoadingInvs ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-16 rounded-xl dark:bg-white/5 bg-muted/50 animate-pulse" />
                    ))}
                  </div>
                ) : acceptedInvs.length === 0 ? (
                  <div className="text-center py-8 rounded-xl border border-dashed dark:border-white/10 border-border dark:text-white/40 text-muted-foreground text-xs">
                    {t("jockey.ui.noAcceptedRaces")}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {acceptedInvs.slice(0, 3).map((inv) => (
                      <div key={inv._id} className="flex justify-between items-center p-3 rounded-xl border dark:border-white/5 border-border dark:bg-black/20 bg-muted/20 hover:dark:border-white/10 border-border transition">
                        <div>
                          <h4 className="text-xs font-bold dark:text-white text-foreground uppercase">{inv.raceId?.name || t("jockey.ui.raceNameFallback")}</h4>
                          <p className="text-[10px] dark:text-white/50 text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="size-3 shrink-0" />
                            {formatDateTime(inv.raceId?.startTime)}
                          </p>
                        </div>
                        <div className="text-right">
                          <button
                            onClick={() => handleViewHorseDetail(inv.horseId._id)}
                            className="text-[10px] px-2 py-1 rounded bg-[#E10600]/10 hover:bg-[#E10600]/20 text-primary border border-[#E10600]/20 transition flex items-center gap-1"
                          >
                            <Eye className="size-3" />
                            {t("jockey.ui.horseLabel", { name: inv.horseId?.name })}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Box 2: Pending Invitations summary */}
              <div className="rounded-2xl border dark:border-white/5 border-border dark:bg-[#15151E] bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider dark:text-white text-foreground flex items-center gap-2">
                    <Mail className="size-4 text-primary" />
                    {t("jockey.ui.inboxTitle", { count: pendingInvs.length })}
                  </h3>
                  <button
                    onClick={() => setActiveTab("invitations")}
                    className="text-xs text-primary font-bold hover:underline flex items-center"
                  >
                    {t("jockey.ui.viewAllInvites")} <ChevronRight className="size-3.5" />
                  </button>
                </div>

                {isLoadingInvs ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-16 rounded-xl dark:bg-white/5 bg-muted/50 animate-pulse" />
                    ))}
                  </div>
                ) : pendingInvs.length === 0 ? (
                  <div className="text-center py-8 rounded-xl border border-dashed dark:border-white/10 border-border dark:text-white/40 text-muted-foreground text-xs">
                    {t("jockey.ui.inboxEmpty")}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingInvs.slice(0, 3).map((inv) => (
                      <div key={inv._id} className="flex justify-between items-center p-3 rounded-xl border border-[#E10600]/20 bg-[#E10600]/5 hover:border-[#E10600]/40 transition">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-primary">{t("jockey.ui.inviteBadge")}</span>
                            <span className="text-[10px] dark:text-white/40 text-muted-foreground">• {inv.ownerId?.fullName}</span>
                          </div>
                          <h4 className="text-xs font-bold dark:text-white text-foreground mt-1 uppercase">{t("jockey.ui.raceLabel", { name: inv.raceId?.name })}</h4>
                          <p className="text-[10px] dark:text-white/50 text-muted-foreground mt-0.5">{t("jockey.ui.horseLabel", { name: inv.horseId?.name })}</p>
                        </div>
                        <button
                          onClick={() => setActiveTab("invitations")}
                          className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 hover:bg-primary hover:text-foreground dark:hover:text-white transition"
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVITATIONS */}
        {activeTab === "invitations" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase tracking-wider dark:text-white text-foreground">{t("jockey.ui.invitationsTitle")}</h3>
              <span className="px-2.5 py-0.5 text-xs bg-primary/10 text-primary border border-primary/20 rounded font-bold uppercase">
                {t("jockey.ui.newInvitesCount", { count: pendingInvs.length })}
              </span>
            </div>

            {isLoadingInvs ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-44 rounded-2xl dark:bg-white/5 bg-muted/50 animate-pulse border dark:border-white/10 border-border" />
                ))}
              </div>
            ) : pendingInvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed dark:border-white/10 border-border dark:bg-[#15151E] bg-card max-w-lg mx-auto space-y-3">
                <div className="size-12 rounded-full border dark:border-white/10 border-border flex items-center justify-center dark:text-white/30 text-muted-foreground">
                  <Mail className="size-6" />
                </div>
                <h4 className="font-bold dark:text-white text-foreground">{t("jockey.ui.inboxEmptyTitle")}</h4>
                <p className="text-xs dark:text-white/40 text-muted-foreground leading-relaxed">
                  {t("jockey.ui.inboxEmptyDesc")}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingInvs.map((inv) => (
                  <div key={inv._id} className="group relative rounded-2xl border dark:border-white/5 border-border dark:bg-[#15151E] bg-card p-5 hover:border-primary/25 dark:hover:bg-[#1C1C25] hover:bg-muted/80 transition flex flex-col justify-between shadow-xl">
                    <div className="absolute top-4 right-4">
                      <StatusBadge label={t("jockey.ui.pendingApproval")} tone="yellow" pulse />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] dark:text-white/40 text-muted-foreground">{t("jockey.ui.sentByOwner")}</p>
                        <h4 className="text-sm font-bold dark:text-white text-foreground mt-0.5 flex items-center gap-1.5">
                          <User className="size-3.5 text-primary" />
                          {inv.ownerId?.fullName}
                          <span className="text-[10px] dark:text-white/35 text-muted-foreground font-normal">({inv.ownerId?.phone || t("jockey.ui.noPhone")})</span>
                        </h4>
                      </div>

                      <div className="p-3 rounded-xl dark:bg-black/20 bg-muted/20 border dark:border-white/5 border-border space-y-2">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] dark:text-white/40 text-muted-foreground">{t("jockey.ui.raceNameLabel")}</p>
                          <p className="text-xs font-black uppercase dark:text-white text-foreground mt-0.5">{inv.raceId?.name}</p>
                          <p className="text-[10px] dark:text-white/50 text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatDateTime(inv.raceId?.startTime)}
                          </p>
                        </div>

                        <div className="h-px dark:bg-white/5 bg-muted/50" />

                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.16em] dark:text-white/40 text-muted-foreground">{t("jockey.ui.assignedHorseLabel")}</p>
                            <button
                              onClick={() => handleViewHorseDetail(inv.horseId._id)}
                              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 text-left mt-0.5"
                            >
                              {inv.horseId?.name} ({inv.horseId?.breed})
                              <Eye className="size-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {inv.message && (
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] dark:text-white/40 text-muted-foreground">{t("jockey.ui.attachedMessageLabel")}</p>
                          <p className="text-xs italic dark:text-white/60 text-muted-foreground mt-1 dark:bg-white/5 bg-muted/50 p-2 rounded-lg leading-relaxed">
                            "{inv.message}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t dark:border-white/5 border-border">
                      <Button
                        onClick={() => handleRespondInvitation(inv._id, "REJECTED")}
                        disabled={submittingId !== null}
                        variant="outline"
                        className="rounded-full dark:border-white/10 border-border hover:dark:bg-white/5 bg-muted/50 text-xs h-9 uppercase font-bold dark:text-white text-foreground hover:dark:text-white text-foreground"
                      >
                        {submittingId === inv._id ? t("jockey.ui.processing") : t("jockey.ui.reject")}
                      </Button>
                      <Button
                        onClick={() => handleRespondInvitation(inv._id, "ACCEPTED")}
                        disabled={submittingId !== null}
                        className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-xs h-9 uppercase font-bold text-white"
                      >
                        {submittingId === inv._id ? t("jockey.ui.processing") : t("jockey.ui.accept")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ASSIGNED RACES */}
        {activeTab === "assigned" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase tracking-wider dark:text-white text-foreground">{t("jockey.ui.assignedScheduleTitle")}</h3>
              <span className="px-2.5 py-0.5 text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded font-bold uppercase">
                {t("jockey.ui.upcomingRacesCount", { count: acceptedInvs.length })}
              </span>
            </div>

            {isLoadingInvs ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-40 rounded-2xl dark:bg-white/5 bg-muted/50 animate-pulse border dark:border-white/10 border-border" />
                ))}
              </div>
            ) : acceptedInvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed dark:border-white/10 border-border dark:bg-[#15151E] bg-card max-w-lg mx-auto space-y-3">
                <div className="size-12 rounded-full border dark:border-white/10 border-border flex items-center justify-center dark:text-white/30 text-muted-foreground">
                  <Calendar className="size-6" />
                </div>
                <h4 className="font-bold dark:text-white text-foreground">{t("jockey.ui.noScheduleTitle")}</h4>
                <p className="text-xs dark:text-white/40 text-muted-foreground leading-relaxed">
                  {t("jockey.ui.noScheduleDesc")}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {acceptedInvs.map((inv) => (
                  <div key={inv._id} className="rounded-2xl border dark:border-white/5 border-border dark:bg-[#15151E] bg-card p-5 shadow-xl hover:border-teal-500/30 dark:hover:bg-[#1C1C25] hover:bg-muted/80 transition flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-teal-400">{t("jockey.ui.assignedBadge")}</span>
                          <h4 className="text-sm font-black uppercase dark:text-white text-foreground mt-1">{inv.raceId?.name}</h4>
                        </div>
                        <StatusBadge
                          label={
                            inv.raceId?.status === "PENDING" ? t("jockey.ui.statusPending") :
                              inv.raceId?.status === "READY" ? t("jockey.ui.statusReady") :
                                inv.raceId?.status === "LIVE" ? t("jockey.ui.statusLive") :
                                  inv.raceId?.status === "FINISHED" ? t("jockey.ui.statusFinished") :
                                    inv.raceId?.status === "RESULT_PUBLISHED" ? t("jockey.ui.statusPublished") : inv.raceId?.status
                          }
                          tone={
                            inv.raceId?.status === "LIVE" ? "red" :
                              inv.raceId?.status === "READY" ? "green" :
                                inv.raceId?.status === "PENDING" ? "yellow" : "slate"
                          }
                          pulse={inv.raceId?.status === "LIVE"}
                        />
                      </div>

                      <div className="p-3 rounded-xl dark:bg-black/20 bg-muted/20 border dark:border-white/5 border-border grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] dark:text-white/40 text-muted-foreground">{t("jockey.ui.departureTimeLabel")}</p>
                          <p className="text-xs font-bold dark:text-white text-foreground mt-0.5 flex items-center gap-1.5">
                            <Clock className="size-3.5 text-teal-400" />
                            {formatDateTime(inv.raceId?.startTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] dark:text-white/40 text-muted-foreground">{t("jockey.ui.ownerLabel")}</p>
                          <p className="text-xs font-bold dark:text-white text-foreground mt-0.5">{inv.ownerId?.fullName}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 rounded-xl border dark:border-white/5 border-border dark:bg-black/10 bg-muted/20">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] dark:text-white/40 text-muted-foreground">{t("jockey.ui.ridingHorseLabel")}</p>
                          <p className="text-xs font-black dark:text-white text-foreground mt-0.5">{inv.horseId?.name}</p>
                        </div>
                        <Button
                          onClick={() => handleViewHorseDetail(inv.horseId._id)}
                          className="rounded-full dark:bg-white/5 bg-muted/50 border dark:border-white/10 border-border hover:dark:bg-white/10 bg-muted/50 hover:dark:border-white/20 border-border text-[10px] h-8 font-black uppercase tracking-wider dark:text-white text-foreground"
                        >
                          <Eye className="size-3 ml-1" />
                          {t("jockey.ui.viewHorseDetail")}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* TAB 4: HORSES */}
        {activeTab === "horses" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase tracking-wider dark:text-white text-foreground">{t("jockey.ui.ridingHorsesTitle")}</h3>
              <span className="px-2.5 py-0.5 text-xs bg-[#067E6A]/10 text-teal-300 border border-[#067E6A]/20 rounded font-bold uppercase">
                {t("jockey.ui.ridingCount", { count: Array.from(new Set(acceptedInvs.map(inv => inv.horseId?._id))).length })}
              </span>
            </div>

            {isLoadingInvs ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 rounded-2xl dark:bg-white/5 bg-muted/50 animate-pulse border dark:border-white/10 border-border" />
                ))}
              </div>
            ) : acceptedInvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed dark:border-white/10 border-border dark:bg-[#15151E] bg-card max-w-lg mx-auto space-y-3">
                <div className="size-12 rounded-full border dark:border-white/10 border-border flex items-center justify-center dark:text-white/30 text-muted-foreground">
                  <ShieldCheck className="size-6" />
                </div>
                <h4 className="font-bold dark:text-white text-foreground">{t("jockey.ui.noHorseAssignedTitle")}</h4>
                <p className="text-xs dark:text-white/40 text-muted-foreground leading-relaxed">
                  {t("jockey.ui.noHorseAssignedDesc")}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Lấy danh sách ngựa duy nhất (unique) từ các lời mời đã chấp nhận */}
                {Array.from(new Map(acceptedInvs.map(inv => [inv.horseId?._id, inv.horseId])).values()).map((horse) => {
                  if (!horse) return null;
                  return (
                    <div key={horse._id} className="group relative rounded-2xl border dark:border-white/5 border-border dark:bg-[#15151E] bg-card p-5 shadow-xl hover:border-primary/30 dark:hover:bg-[#1C1C25] hover:bg-muted/80 transition flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-full border border-primary bg-primary/10 flex items-center justify-center">
                            <Sparkles className="size-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black uppercase dark:text-white text-foreground leading-tight">{horse.name}</h4>
                            <p className="text-[10px] dark:text-white/40 text-muted-foreground uppercase tracking-wider mt-0.5">{horse.breed}</p>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl dark:bg-black/25 bg-muted/20 border dark:border-white/5 border-border text-xs dark:text-white/65 text-muted-foreground space-y-2">
                          <p className="text-[9px] font-bold uppercase tracking-wider dark:text-white/40 text-muted-foreground">{t("jockey.ui.raceRoleLabel")}</p>
                          <p className="text-xs dark:text-white/80 text-muted-foreground">{t("jockey.ui.raceRoleDesc")}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t dark:border-white/5 border-border">
                        <Button
                          onClick={() => handleViewHorseDetail(horse._id)}
                          className="w-full rounded-full bg-[#E10600] hover:bg-[#B80500] text-xs h-9 uppercase font-bold text-white flex items-center justify-center gap-1.5"
                        >
                          <Eye className="size-3.5" />
                          {t("jockey.ui.viewHorseSpecs")}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {/* TAB 4: MY PERFORMANCE */}
        {activeTab === "performance" && (
          <div className="space-y-6">
            {/* Career Metrics & Bio */}
            <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
              {/* Jockey Profile card */}
              <div className="rounded-2xl border dark:border-white/5 border-border dark:bg-[#15151E] bg-card p-5 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider dark:text-white text-foreground border-b dark:border-white/5 border-border pb-2">{t("jockey.ui.profileTitle")}</h3>

                {isLoadingProfile ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="size-16 rounded-full dark:bg-white/5 bg-muted/50 mx-auto" />
                    <div className="h-4 w-32 dark:bg-white/5 bg-muted/50 mx-auto rounded" />
                    <div className="h-20 dark:bg-white/5 bg-muted/50 rounded" />
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    <div className="size-20 rounded-full border-2 border-primary bg-primary/10 mx-auto flex items-center justify-center">
                      {profile?.avatar ? (
                        <img src={profile.avatar} alt={profile.fullName} className="size-full rounded-full object-cover" />
                      ) : (
                        <User className="size-10 text-primary" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-black uppercase dark:text-white text-foreground">{profile?.fullName}</h4>
                      <p className="text-[10px] dark:text-white/50 text-muted-foreground uppercase tracking-widest mt-0.5">{t("jockey.ui.proJockey").toUpperCase()}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-left dark:bg-black/25 bg-muted/20 p-3 rounded-xl border dark:border-white/5 border-border text-xs">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] dark:text-white/40 text-muted-foreground">Email</p>
                        <p className="dark:text-white text-foreground font-bold truncate mt-0.5">{profile?.email}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] dark:text-white/40 text-muted-foreground">{t("jockey.ui.phone")}</p>
                        <p className="dark:text-white text-foreground font-bold mt-0.5">{profile?.phone || t("jockey.ui.notUpdated")}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Box: Performance achievements history */}
              <div className="rounded-2xl border dark:border-white/5 border-border dark:bg-[#15151E] bg-card p-5 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider dark:text-white text-foreground border-b dark:border-white/5 border-border pb-2 flex items-center gap-2">
                  <Award className="size-4 text-primary" />
                  {t("jockey.ui.performanceTitle")}
                </h3>

                {isLoadingStats ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 rounded-xl dark:bg-white/5 bg-muted/50 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="dark:bg-black/35 bg-muted/20 p-3 rounded-xl border dark:border-white/5 border-border text-center">
                        <p className="text-[9px] font-bold uppercase tracking-wider dark:text-white/40 text-muted-foreground">{t("jockey.ui.winsLabel")}</p>
                        <p className="text-xl font-black text-primary mt-1">{stats?.races.wins || 0}</p>
                      </div>
                      <div className="dark:bg-black/35 bg-muted/20 p-3 rounded-xl border dark:border-white/5 border-border text-center">
                        <p className="text-[9px] font-bold uppercase tracking-wider dark:text-white/40 text-muted-foreground">{t("jockey.ui.totalRacesLabel")}</p>
                        <p className="text-xl font-black dark:text-white text-foreground mt-1">{stats?.races.participated || 0}</p>
                      </div>
                      <div className="dark:bg-black/35 bg-muted/20 p-3 rounded-xl border dark:border-white/5 border-border text-center">
                        <p className="text-[9px] font-bold uppercase tracking-wider dark:text-white/40 text-muted-foreground">{t("jockey.ui.winRateLabel")}</p>
                        <p className="text-xl font-black text-teal-400 mt-1">{stats?.races.winRate || 0}%</p>
                      </div>
                      <div className="dark:bg-black/35 bg-muted/20 p-3 rounded-xl border dark:border-white/5 border-border text-center">
                        <p className="text-[9px] font-bold uppercase tracking-wider dark:text-white/40 text-muted-foreground">{t("jockey.ui.pointsLabel")}</p>
                        <p className="text-xl font-black text-yellow-400 mt-1">{stats?.totalPoints || 0}{t("jockey.ui.pointsSuffix")}</p>
                      </div>
                    </div>

                    <div className="h-px dark:bg-white/5 bg-muted/50 my-2" />

                    <div className="dark:text-white/40 text-muted-foreground text-xs py-4 text-center rounded-xl border border-dashed dark:border-white/10 border-border">
                      <Info className="size-4 mx-auto mb-2 dark:text-white/20 text-muted-foreground" />
                      {t("jockey.ui.historyNote")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Horse Detail MODAL Dialog */}
      {selectedHorseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-black/85 bg-muted/20 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl rounded-3xl border dark:border-white/10 border-border bg-[#12121A] overflow-hidden shadow-2xl animate-scale-up">

            {/* Header / Banner decoration */}
            <div className="relative h-28 bg-[#181824] flex items-end p-5">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-teal-500/10" />
              <div className="absolute inset-x-0 bottom-0 h-px dark:bg-white/5 bg-muted/50" />

              <button
                onClick={() => setSelectedHorseId(null)}
                className="absolute top-4 right-4 size-8 rounded-full dark:bg-black/45 bg-muted/20 hover:dark:bg-black/80 bg-muted/20 flex items-center justify-center dark:text-white/70 text-muted-foreground hover:dark:text-white text-foreground transition"
              >
                <X className="size-4" />
              </button>

              <div className="relative flex items-center gap-3">
                <div className="size-14 rounded-full border border-primary bg-primary/10 flex items-center justify-center">
                  <Sparkles className="size-6 text-primary" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary">{t("jockey.ui.modalTitle")}</span>
                  <h3 className="text-lg font-black uppercase dark:text-white text-foreground mt-0.5">
                    {isLoadingHorse ? t("jockey.ui.loadingData") : horseDetail?.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {isLoadingHorse ? (
                <div className="space-y-4 py-8 animate-pulse text-center">
                  <div className="h-4 dark:bg-white/5 bg-muted/50 rounded w-1/3 mx-auto" />
                  <div className="h-2 dark:bg-white/5 bg-muted/50 rounded w-1/2 mx-auto" />
                  <div className="h-10 dark:bg-white/5 bg-muted/50 rounded" />
                </div>
              ) : horseDetail ? (
                <div className="space-y-4">
                  {/* Horse Image Preview */}
                  {horseDetail.image ? (
                    <div className="relative h-44 w-full rounded-2xl overflow-hidden border dark:border-white/5 border-border">
                      <img src={horseDetail.image} alt={horseDetail.name} className="size-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-32 w-full rounded-2xl dark:bg-black/20 bg-muted/20 border border-dashed dark:border-white/10 border-border flex flex-col items-center justify-center dark:text-white/30 text-muted-foreground text-xs">
                      <HelpCircle className="size-8 dark:text-white/20 text-muted-foreground mb-2" />
                      {t("jockey.ui.noImage")}
                    </div>
                  )}

                  {/* Core specifications */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="dark:bg-black/30 bg-muted/20 p-2.5 rounded-xl border dark:border-white/5 border-border">
                      <p className="text-[9px] font-bold uppercase tracking-wider dark:text-white/40 text-muted-foreground">{t("jockey.ui.breed")}</p>
                      <p className="text-xs font-bold dark:text-white text-foreground mt-0.5 truncate">{horseDetail.breed}</p>
                    </div>
                    <div className="dark:bg-black/30 bg-muted/20 p-2.5 rounded-xl border dark:border-white/5 border-border">
                      <p className="text-[9px] font-bold uppercase tracking-wider dark:text-white/40 text-muted-foreground">{t("jockey.ui.age")}</p>
                      <p className="text-xs font-bold dark:text-white text-foreground mt-0.5">{t("jockey.ui.yearsOld", { age: horseDetail.age })}</p>
                    </div>
                    <div className="dark:bg-black/30 bg-muted/20 p-2.5 rounded-xl border dark:border-white/5 border-border">
                      <p className="text-[9px] font-bold uppercase tracking-wider dark:text-white/40 text-muted-foreground">{t("jockey.ui.gender")}</p>
                      <p className="text-xs font-bold dark:text-white text-foreground mt-0.5">{horseDetail.gender === "male" ? t("jockey.ui.male") : t("jockey.ui.female")}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border dark:border-white/5 border-border dark:bg-black/25 bg-muted/20">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] dark:text-white/40 text-muted-foreground">{t("jockey.ui.conditionTitle")}</p>
                      <div className="space-y-2 mt-2">
                        <div>
                          <div className="flex justify-between text-[10px] dark:text-white/60 text-muted-foreground mb-0.5">
                            <span>{t("jockey.ui.speedPower")}</span>
                            <span className="font-bold text-primary">{horseDetail.baseSpeed || 60} / 100</span>
                          </div>
                          <div className="w-full h-1 dark:bg-white/5 bg-muted/50 rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: `${horseDetail.baseSpeed || 60}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[10px] dark:text-white/60 text-muted-foreground mb-0.5">
                            <span>{t("jockey.ui.stamina")}</span>
                            <span className="font-bold text-teal-400">{horseDetail.staminaScore || 70} / 100</span>
                          </div>
                          <div className="w-full h-1 dark:bg-white/5 bg-muted/50 rounded-full overflow-hidden">
                            <div className="bg-teal-400 h-full" style={{ width: `${horseDetail.staminaScore || 70}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] dark:text-white/40 text-muted-foreground">{t("jockey.ui.health")}</p>
                        <div className="mt-1">
                          <StatusBadge
                            label={
                              horseDetail.healthStatus === "HEALTHY" ? t("jockey.ui.healthy") :
                                horseDetail.healthStatus === "INJURED" ? t("jockey.ui.injured") : t("jockey.ui.sick")
                            }
                            tone={horseDetail.healthStatus === "HEALTHY" ? "green" : "red"}
                            pulse={horseDetail.healthStatus === "HEALTHY"}
                          />
                        </div>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] dark:text-white/40 text-muted-foreground">{t("jockey.ui.physicalStats")}</p>
                        <p className="text-xs dark:text-white text-foreground mt-1 leading-relaxed">
                          {t("jockey.ui.weightHeight", { weight: horseDetail.weightKg, height: horseDetail.heightCm })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {horseDetail.description && (
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] dark:text-white/40 text-muted-foreground">{t("jockey.ui.descriptionLabel")}</p>
                      <p className="text-xs dark:text-white/70 text-muted-foreground leading-relaxed dark:bg-white/5 bg-muted/50 p-3 rounded-xl border dark:border-white/5 border-border">
                        {horseDetail.description}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 dark:text-white/40 text-muted-foreground">{t("jockey.ui.horseNotFound")}</div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#181824] border-t dark:border-white/5 border-border flex justify-end">
              <Button
                onClick={() => setSelectedHorseId(null)}
                className="rounded-full dark:bg-white/5 bg-muted/50 border dark:border-white/10 border-border hover:dark:bg-white/10 bg-muted/50 text-xs font-bold uppercase px-6 dark:text-white text-foreground"
              >
                {t("jockey.ui.close")}
              </Button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}

function JockeyLoadingFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-20 dark:text-white/55 text-muted-foreground">
      <div className="size-8 animate-spin border-4 border-primary border-t-transparent rounded-full" />
      <p className="mt-4 text-xs font-mono uppercase tracking-widest">{t("jockey.ui.loadingStation")}</p>
    </div>
  );
}

export default function JockeyDashboardPage() {
  return (
    <Suspense fallback={<JockeyLoadingFallback />}>
      <JockeyDashboard />
    </Suspense>
  );
}
