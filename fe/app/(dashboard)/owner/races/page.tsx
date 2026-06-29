"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Flag, Loader2, ArrowRight, Timer, MapPin, Users, Award, Trophy,
  ChevronRight, Search, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import { OwnerRegistrationTable, type Registration } from "@/features/registrations/components/owner-registration-table";
import { tournamentsApi, racesApi } from "@/lib/api-client";

type Tournament = {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  maxHorses?: number;
  prize?: number;
};

type Race = {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  distanceMeters: number;
  trackCondition?: string;
  startTime: string;
  maxParticipants?: number;
  participantsCount?: number;
  prize?: number;
  status: string;
  tournamentId: { _id: string; name: string; startDate?: string; endDate?: string } | string;
};

const tournamentStatusLabel: Record<string, { label: string; tone: "green" | "yellow" | "red" | "slate" | "teal" }> = {
  DRAFT: { label: "Bản nháp", tone: "slate" },
  OPEN_REGISTRATION: { label: "Mở ghi danh", tone: "green" },
  ONGOING: { label: "Đang diễn ra", tone: "yellow" },
  COMPLETED: { label: "Hoàn tất", tone: "teal" },
  CANCELLED: { label: "Đã hủy", tone: "red" },
};

export default function OwnerRacesBrowserPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [loadingRaces, setLoadingRaces] = useState(false);
  const [search, setSearch] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [activeTab, setActiveTab] = useState<"browse" | "requests">("browse");

  // Fetch my registrations
  const fetchRegistrations = useCallback(async () => {
    setLoadingRegistrations(true);
    try {
      const response = await fetch("/api/owner/registrations");
      if (response.ok) {
        const resData = await response.json();
        if (resData.success) {
          const rawList = resData.data?.data || resData.data || [];
          const mapped: Registration[] = (rawList as Record<string, unknown>[]).map((item) => {
            const tournamentId = item.tournamentId as Record<string, unknown> | null | undefined;
            const raceId = item.raceId as Record<string, unknown> | null | undefined;
            const horseId = item.horseId as Record<string, unknown> | null | undefined;
            const ownerId = item.ownerId as Record<string, unknown> | string | null | undefined;
            return {
              id: (item.id || item._id) as string,
              tournamentId: ((tournamentId?._id || tournamentId?.id) as string) || "",
              tournamentName: (tournamentId?.name as string) || "Giải đấu tự do",
              raceId: ((raceId?._id || raceId?.id) as string) || "",
              raceName: (raceId?.name as string) || "Không rõ trận đua",
              horseId: ((horseId?._id || horseId?.id) as string) || "",
              horseName: (horseId?.name as string) || "Không rõ chiến mã",
              ownerId: (typeof ownerId === "object" && ownerId !== null ? ((ownerId._id || ownerId.id) as string) : ownerId as string) || "",
              status: item.status as "APPROVED" | "REJECTED" | "PENDING" | "CANCELLED" | "WITHDRAWN",
              note: item.note as string | undefined,
              rejectedReason: item.rejectedReason as string | undefined,
              createdAt: (item.createdAt as string) || new Date().toISOString(),
            };
          });
          setRegistrations(mapped);
        }
      }
    } catch (err) {
      console.error("Lỗi lấy lịch sử đăng ký:", err);
    } finally {
      setLoadingRegistrations(false);
    }
  }, []);

  // Fetch all tournaments
  const fetchTournaments = useCallback(async () => {
    setLoadingTournaments(true);
    try {
      const data = await tournamentsApi.list({ limit: 100 });
      setTournaments(data.data || []);
    } catch {
      toast.error("Không thể tải danh sách giải đấu.");
    } finally {
      setLoadingTournaments(false);
    }
  }, []);

  // Fetch races for selected tournament
  const fetchRaces = useCallback(async (tournamentId: string) => {
    setLoadingRaces(true);
    try {
      const data = await racesApi.listByTournament(tournamentId, { limit: 100 });
      setRaces(data.data || []);
    } catch {
      toast.error("Không thể tải danh sách vòng đua.");
    } finally {
      setLoadingRaces(false);
    }
  }, []);

  useEffect(() => {
    void fetchTournaments();
  }, [fetchTournaments]);

  useEffect(() => {
    if (selectedTournamentId) {
      void fetchRaces(selectedTournamentId);
    } else {
      setRaces([]);
    }
  }, [selectedTournamentId, fetchRaces]);

  useEffect(() => {
    if (activeTab === "requests") {
      void fetchRegistrations();
    }
  }, [activeTab, fetchRegistrations]);

  const selectedTournament = tournaments.find(
    (t) => t._id === selectedTournamentId || t.id === selectedTournamentId
  );

  const filteredTournaments = tournaments.filter((t) =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  const isOpenRegistration = selectedTournament?.status === "OPEN_REGISTRATION";

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        eyebrow="Đại hội đua ngựa"
        title="Duyệt Giải Đấu & Ghi Danh"
        description="Chọn một giải đấu chính để xem các vòng đua nhỏ đang tuyển chiến mã. Đăng ký ngựa của bạn vào vòng đua phù hợp."
      />

      {/* Navigation tabs */}
      <div className="flex border-b border-border gap-6 mt-4">
        <button
          onClick={() => setActiveTab("browse")}
          className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === "browse"
            ? "border-[#E10600] text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground/80"
            }`}
        >
          Duyệt Giải Đấu & Đăng Ký
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === "requests"
            ? "border-[#E10600] text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground/80"
            }`}
        >
          Danh Sách Gửi Yêu Cầu
        </button>
      </div>

      {activeTab === "browse" ? (
        /* Two-column Layout */
        <div className="grid gap-6 lg:grid-cols-[380px_1fr] items-start">
          {/* LEFT: Tournament List */}
          <aside className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Giải đấu chính</h3>
              <button onClick={fetchTournaments} className="rounded-full p-1.5 hover:bg-muted text-muted-foreground/60 hover:text-foreground transition">
                <RefreshCw className="size-3.5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm giải đấu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-muted/50 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary"
              />
            </div>

            {loadingTournaments ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
                <p className="mt-3 text-[10px] font-mono uppercase tracking-widest">Đang tải giải đấu...</p>
              </div>
            ) : filteredTournaments.length === 0 ? (
              <div className="rounded-xl border border-border bg-card/60 p-6 text-center">
                <Trophy className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Không tìm thấy giải đấu nào.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1 custom-scrollbar">
                {filteredTournaments.map((t) => {
                  const tid = t._id || t.id!;
                  const isSelected = selectedTournamentId === tid;
                  const sInfo = tournamentStatusLabel[t.status] || { label: t.status, tone: "slate" as const };

                  return (
                    <button
                      key={tid}
                      onClick={() => setSelectedTournamentId(isSelected ? null : tid)}
                      className={`w-full text-left rounded-xl border p-4 transition duration-200 group ${isSelected
                        ? "border-primary/40 bg-primary/5 shadow-sm"
                        : "border-border bg-card hover:border-primary/25 hover:bg-muted/50"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className={`text-sm font-black uppercase tracking-tight leading-tight transition ${isSelected ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                          {t.name}
                        </h4>
                        <ChevronRight className={`size-4 shrink-0 transition ${isSelected ? "text-primary rotate-90" : "text-muted-foreground/40 group-hover:text-muted-foreground/60"}`} />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge label={sInfo.label} tone={sInfo.tone} />
                        {t.startDate && (
                          <span className="text-[10px] text-muted-foreground/60">
                            {new Date(t.startDate).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                      </div>
                      {t.prize != null && (
                        <div className="mt-2 text-[10px] text-muted-foreground/60">
                          🏆 Quỹ thưởng: <strong className="text-teal-400 font-mono">{t.prize.toLocaleString()} pts</strong>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          {/* RIGHT: Races of selected tournament */}
          <section className="space-y-4">
            {!selectedTournamentId ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/40 p-16 text-center">
                <Trophy className="size-16 text-foreground/[0.06] mx-auto mb-4 stroke-[1]" />
                <h3 className="text-lg font-black text-muted-foreground/60 uppercase tracking-tight mb-2">Chọn một giải đấu</h3>
                <p className="text-xs text-foreground/25 max-w-sm mx-auto">
                  Chọn giải đấu chính từ bảng bên trái để xem danh sách các vòng đua nhỏ và đăng ký chiến mã tham gia.
                </p>
              </div>
            ) : (
              <>
                {/* Tournament Summary Banner */}
                {selectedTournament && (
                  <div className="rounded-2xl border border-border bg-card/85 p-5 relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary to-transparent" />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Giải đấu đang xem</p>
                        <h3 className="text-xl font-black uppercase text-foreground tracking-tight mt-1">{selectedTournament.name}</h3>
                        {selectedTournament.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{selectedTournament.description}</p>
                        )}
                      </div>
                      <StatusBadge
                        label={tournamentStatusLabel[selectedTournament.status]?.label || selectedTournament.status}
                        tone={tournamentStatusLabel[selectedTournament.status]?.tone || "slate"}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4 text-xs text-muted-foreground border-t border-border pt-3">
                      <div>
                        <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">Thời gian</span>
                        <span className="font-bold text-foreground text-[11px]">
                          {selectedTournament.startDate ? new Date(selectedTournament.startDate).toLocaleDateString("vi-VN") : "?"} – {selectedTournament.endDate ? new Date(selectedTournament.endDate).toLocaleDateString("vi-VN") : "?"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">Quỹ thưởng</span>
                        <span className="font-bold text-teal-400 font-mono text-[11px]">{selectedTournament.prize?.toLocaleString() || 0} pts</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">Trạng thái</span>
                        <span className="font-bold text-foreground text-[11px]">
                          {isOpenRegistration ? "🟢 Mở đăng ký" : "🔴 Đóng đăng ký"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Races Cards */}
                {loadingRaces ? (
                  <div className="flex flex-col items-center justify-center py-16 text-foreground/55">
                    <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
                    <p className="mt-3 text-[10px] font-mono uppercase tracking-widest">Đang tải danh sách vòng đua...</p>
                  </div>
                ) : races.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-card/60 p-12 text-center shadow-xl">
                    <Flag className="size-12 text-muted-foreground/30 mx-auto mb-3 stroke-[1.5]" />
                    <h4 className="text-base font-bold text-foreground uppercase tracking-wider mb-1">Chưa có vòng đua nào</h4>
                    <p className="text-xs text-foreground/55 max-w-sm mx-auto">
                      Giải đấu này chưa có vòng đua nào được lên lịch. Vui lòng quay lại sau!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {races.map((race) => {
                      const raceId = race._id || race.id!;
                      const isFull = (race.participantsCount || 0) >= (race.maxParticipants || 20);

                      return (
                        <article
                          key={raceId}
                          className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[0_18px_56px_rgba(0,0,0,0.28)] transition duration-200 hover:border-primary/40 hover:bg-muted/50 flex flex-col justify-between min-h-[260px]"
                        >
                          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-white/20 to-transparent" />
                          <div className="absolute -right-12 -top-12 size-36 rounded-full bg-primary/5 blur-3xl transition group-hover:bg-primary/15" />

                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              {isOpenRegistration ? (
                                <StatusBadge label="Mở ghi tên" tone="green" />
                              ) : (
                                <StatusBadge label="Đóng đăng ký" tone="slate" />
                              )}
                              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${race.status === "SCHEDULED" ? "text-blue-400 bg-blue-400/10 border-blue-400/20" :
                                race.status === "LIVE" ? "text-rose-400 bg-rose-400/10 border-rose-400/20 animate-pulse" :
                                  race.status === "FINISHED" ? "text-purple-400 bg-purple-400/10 border-purple-400/20" :
                                    "text-muted-foreground/60 bg-muted border-border"
                                }`}>
                                {race.status}
                              </span>
                            </div>

                            <h2 className="mt-3 text-lg font-black uppercase tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition">
                              {race.name}
                            </h2>
                            {race.description && (
                              <p className="text-[11px] text-muted-foreground/60 line-clamp-1 mt-1">{race.description}</p>
                            )}

                            <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-2">
                                <Timer className="size-4 text-primary shrink-0" />
                                Khởi tranh: {new Date(race.startTime).toLocaleString("vi-VN", {
                                  day: "2-digit", month: "2-digit", year: "numeric",
                                  hour: "2-digit", minute: "2-digit",
                                })}
                              </span>
                              <span className="inline-flex items-center gap-2">
                                <MapPin className="size-4 text-primary shrink-0" />
                                Cự ly: {race.distanceMeters}m · Mặt sân: {race.trackCondition || "Dry turf"}
                              </span>
                              <span className="inline-flex items-center gap-2">
                                <Users className="size-4 text-primary shrink-0" />
                                Số lượng: {race.participantsCount || 0}/{race.maxParticipants || 20} chiến mã
                              </span>
                              {race.prize != null && (
                                <span className="inline-flex items-center gap-2">
                                  <Award className="size-4 text-teal-400 shrink-0" />
                                  Giải thưởng: <strong className="text-teal-400 font-mono">{race.prize.toLocaleString()} pts</strong>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-5 pt-4 border-t border-border flex gap-2">
                            {isOpenRegistration ? (
                              isFull ? (
                                <Button disabled className="rounded-xl flex-1 text-xs py-2 h-9 bg-muted text-muted-foreground/60 border border-border">
                                  Trận đấu đã đầy
                                </Button>
                              ) : (
                                <Button asChild className="rounded-xl flex-1 text-xs py-2 h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider">
                                  <Link href={`/owner/races/${raceId}/register`}>
                                    Ghi danh ngay <ArrowRight className="size-3.5 ml-1" />
                                  </Link>
                                </Button>
                              )
                            ) : (
                              <Button disabled className="rounded-xl flex-1 text-xs py-2 h-9 bg-muted text-muted-foreground/60 border border-border">
                                Ngừng tiếp nhận hồ sơ
                              </Button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.15em] text-foreground/85">Yêu cầu đã gửi</h3>
              <p className="text-xs text-muted-foreground/60 mt-1">Danh sách chi tiết các hồ sơ đăng ký tham gia vòng đua đã được gửi.</p>
            </div>
            <Button
              onClick={fetchRegistrations}
              variant="outline"
              size="sm"
              className="rounded-xl bg-muted hover:bg-muted/60 border-border h-8"
              disabled={loadingRegistrations}
            >
              {loadingRegistrations ? (
                <Loader2 className="size-3.5 animate-spin mr-2" />
              ) : (
                <RefreshCw className="size-3.5 mr-2" />
              )}
              Làm mới
            </Button>
          </div>

          {loadingRegistrations ? (
            <div className="flex flex-col items-center justify-center py-20 text-foreground/55">
              <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
              <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải danh sách gửi yêu cầu...</p>
            </div>
          ) : (
            <OwnerRegistrationTable
              registrations={registrations}
              onRefresh={fetchRegistrations}
            />
          )}
        </div>
      )}
    </main>
  );
}
