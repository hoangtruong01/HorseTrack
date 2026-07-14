"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  apiFetch,
  racesApi,
  tournamentsApi,
  type RaceItem,
  type RegistrationItem,
  type TournamentItem,
} from "@/lib/api-client";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  CloudSun,
  Layers,
  Loader2,
  MapPin,
  Milestone,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const raceStatusColors: Record<string, string> = {
  SCHEDULED: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  CHECKING: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  READY: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  LIVE: "text-rose-400 bg-rose-400/10 border-rose-400/20 animate-pulse",
  FINISHED: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  RESULT_PUBLISHED: "text-teal-400 bg-teal-400/10 border-teal-400/20",
  CANCELLED: "text-red-400 bg-red-400/10 border-red-400/20",
};

const raceStatusOptions = [
  "SCHEDULED",
  "CHECKING",
  "READY",
  "LIVE",
  "FINISHED",
  "RESULT_PUBLISHED",
  "CANCELLED",
];

export default function AdminTournamentDetailPage() {
  const params = useParams();
  const tournamentId = params.tournamentId as string;

  const [tournament, setTournament] = useState<TournamentItem | null>(null);
  const [races, setRaces] = useState<RaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Race Details Modal State
  const [selectedRace, setSelectedRace] = useState<RaceItem | null>(null);
  const [raceRegistrations, setRaceRegistrations] = useState<
    RegistrationItem[]
  >([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [conditionsForm, setConditionsForm] = useState({
    trackCondition: "",
    weatherSnapshot: "",
  });
  const [savingConditions, setSavingConditions] = useState(false);

  const handleOpenRaceDetails = async (race: RaceItem) => {
    setSelectedRace(race);
    setConditionsForm({
      trackCondition: race.trackCondition || "",
      weatherSnapshot: race.weatherSnapshot || "",
    });
    setLoadingRegistrations(true);
    try {
      const res = await apiFetch<{ data?: RegistrationItem[] }>(
        `/registrations?raceId=${race._id}&limit=100`,
      );
      setRaceRegistrations(res.data || []);
    } catch {
      toast.error("Không thể tải danh sách đăng ký tham gia vòng đua.");
      setRaceRegistrations([]);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const loadDetails = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, rRes] = await Promise.all([
        tournamentsApi.get(tournamentId),
        racesApi.listByTournament(tournamentId, { limit: 100 }),
      ]);
      setTournament(tRes);
      setRaces(rRes.data || []);
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Không thể tải thông tin chi tiết giải đấu",
      );
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    if (tournamentId) {
      void loadDetails();
    }
  }, [tournamentId, loadDetails]);

  // Handle Race Delete
  const handleDeleteRace = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa vòng đua "${name}"?`)) return;
    setActionLoading(id);
    try {
      await racesApi.delete(id);
      toast.success("Xóa vòng đua thành công");
      void loadDetails();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể xóa vòng đua");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveConditions = async () => {
    if (!selectedRace) return;
    setSavingConditions(true);
    try {
      const updated = await racesApi.updateConditions(
        selectedRace._id,
        conditionsForm,
      );
      setSelectedRace(updated);
      setRaces((prev) =>
        prev.map((r) => (r._id === updated._id ? updated : r)),
      );
      toast.success("Đã cập nhật điều kiện thực địa");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Cập nhật điều kiện thất bại",
      );
    } finally {
      setSavingConditions(false);
    }
  };

  // Handle Race Status Change
  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      await racesApi.updateStatus(id, newStatus);
      toast.success(`Cập nhật trạng thái vòng đua thành: ${newStatus}`);
      void loadDetails();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Cập nhật trạng thái thất bại",
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Image
          src="/skeletonHorse.gif"
          alt="Đang tải..."
          width={80}
          height={80}
          unoptimized
          className="object-contain mx-auto"
        />
        <p className="mt-4 text-xs font-mono uppercase tracking-widest">
          Đang tải thông tin chi tiết giải đấu...
        </p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center max-w-xl mx-auto shadow-2xl">
        <AlertCircle className="size-16 text-red-500 mx-auto mb-4 stroke-[1.5]" />
        <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">
          Giải đấu không tồn tại
        </h3>
        <Button
          asChild
          className="rounded-full bg-white/5 text-foreground mt-4"
        >
          <Link href="/admin/tournaments">Quay lại danh sách giải đấu</Link>
        </Button>
      </div>
    );
  }

  const totalPrizeAllocated = races.reduce((sum, r) => sum + (r.prize || 0), 0);
  const totalBudget = tournament.prizePool || tournament.prize || 0;
  const remainingBudget = totalBudget - totalPrizeAllocated;
  const budgetPercent =
    totalBudget > 0
      ? Math.min(100, Math.max(0, (totalPrizeAllocated / totalBudget) * 100))
      : 0;

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <Link
          href="/admin/tournaments"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition mb-3"
        >
          <ChevronLeft className="size-4" /> Quay lại quản lý giải đấu
        </Link>

        <PageHeader
          eyebrow="Chi tiết giải đấu"
          title={tournament.name}
          description="Quản lý chi tiết hồ sơ giải đấu chính và lập lịch các vòng đua nhỏ tương ứng."
        />
      </div>

      {/* Tournament Info Deck */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Main Details Card */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-[0_18px_56px_rgba(0,0,0,0.28)] relative overflow-hidden flex flex-col md:flex-row">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary to-transparent z-10" />

          {/* Tournament Image on Left */}
          {tournament.imageUrl ? (
            <div className="w-full md:w-64 h-48 md:h-auto relative shrink-0 border-b md:border-b-0 md:border-r border-border bg-muted/80">
              <Image
                src={tournament.imageUrl}
                alt={tournament.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-full md:w-64 h-48 md:h-auto relative shrink-0 flex items-center justify-center border-b md:border-b-0 md:border-r border-border bg-muted">
              <Trophy className="size-16 text-muted-foreground/10" />
            </div>
          )}

          {/* Details on Right */}
          <div className="p-6 flex-1 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#E10600] flex items-center gap-1.5">
                <Trophy className="size-4 animate-pulse" /> Hồ Sơ Giải Đấu Chính
              </h3>
              <span
                className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${
                  tournament.status === "OPEN_REGISTRATION"
                    ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                    : "text-muted-foreground border-border bg-white/5"
                }`}
              >
                {tournament.status}
              </span>
            </div>

            {tournament.description && (
              <p className="text-sm text-foreground/70 leading-relaxed">
                {tournament.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs pt-4 border-t border-border text-muted-foreground">
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">
                  Địa điểm tổ chức
                </span>
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-primary" />{" "}
                  {tournament.location || "Chưa thiết lập"}
                </span>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">
                  Thời gian giải đấu
                </span>
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" />
                  {tournament.startDate
                    ? new Date(tournament.startDate).toLocaleDateString("vi-VN")
                    : "?"}{" "}
                  -{" "}
                  {tournament.endDate
                    ? new Date(tournament.endDate).toLocaleDateString("vi-VN")
                    : "?"}
                </span>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">
                  Thời gian nhận đăng ký
                </span>
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-teal-400" />
                  {tournament.registrationStartDate
                    ? new Date(
                        tournament.registrationStartDate,
                      ).toLocaleDateString("vi-VN")
                    : "Chưa mở"}{" "}
                  -{" "}
                  {tournament.registrationEndDate
                    ? new Date(
                        tournament.registrationEndDate,
                      ).toLocaleDateString("vi-VN")
                    : "Chưa mở"}
                </span>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">
                  Sức chứa tối đa
                </span>
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Users className="size-3.5 text-primary" />{" "}
                  {tournament.maxHorses ?? "?"} chiến mã
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget & Stats card */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-[0_18px_56px_rgba(0,0,0,0.28)] relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-teal-500 to-transparent" />
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-teal-400">
              Ngân Quỹ Giải Đấu
            </h3>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tổng ngân quỹ:</span>
                <span className="font-bold text-foreground">
                  {(
                    tournament.prizePool ||
                    tournament.prize ||
                    0
                  ).toLocaleString()}{" "}
                  điểm
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Đã phân bổ:</span>
                <span className="font-bold text-foreground">
                  {totalPrizeAllocated.toLocaleString()} điểm
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden my-2 border border-border">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${remainingBudget < 0 ? "bg-red-500" : "bg-teal-500"}`}
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-xs border-t border-border pt-1.5 text-muted-foreground">
                <span>Ngân quỹ còn lại:</span>
                <span
                  className={`font-bold ${remainingBudget < 0 ? "text-red-400" : "text-teal-400"}`}
                >
                  {remainingBudget.toLocaleString()} điểm
                </span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground/70 pt-4 border-t border-border">
            Lưu ý: Tổng ngân quỹ các vòng đua nhỏ không được vượt quá quỹ thưởng
            của giải đấu chính.
          </div>
        </div>
      </section>

      {/* Races List */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <h3 className="text-lg font-black uppercase tracking-tight text-foreground flex items-center gap-2">
            Danh sách vòng đua nhỏ ({races.length})
          </h3>
          <div className="flex items-center gap-3">
            <Button
              asChild
              className="rounded-full bg-primary hover:bg-primary/90 text-foreground font-bold uppercase tracking-wider text-xs h-9 px-4"
            >
              <Link
                href={`/admin/races/new?tournamentId=${tournamentId}`}
                className="flex items-center gap-1.5"
              >
                <Plus className="size-3.5" /> Tạo vòng đua mới
              </Link>
            </Button>
            <Button
              onClick={loadDetails}
              variant="ghost"
              className="size-8 p-0 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="size-4" />
            </Button>
          </div>
        </div>

        {races.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card/70 p-12 text-center shadow-xl">
            <Milestone className="size-12 text-muted-foreground/30 mx-auto mb-3 stroke-[1.5]" />
            <h4 className="text-base font-bold text-foreground uppercase tracking-wider mb-1">
              Chưa có vòng đua nào
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Giải đấu chính hiện chưa có vòng đua nhỏ nào.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-white/[0.02] text-muted-foreground font-black uppercase tracking-wider">
                    <th className="p-4 w-12">#</th>
                    <th className="p-4">Tên vòng đua</th>
                    <th className="p-4">Cự ly / Mặt sân</th>
                    <th className="p-4">Thời gian xuất phát</th>
                    <th className="p-4">Giải thưởng</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-foreground/70">
                  {races.map((race, index) => {
                    const isLocked = [
                      "LIVE",
                      "FINISHED",
                      "RESULT_PUBLISHED",
                    ].includes(race.status);
                    return (
                      <tr
                        key={race._id}
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (
                            target.closest("select") ||
                            target.closest("button")
                          )
                            return;
                          void handleOpenRaceDetails(race);
                        }}
                        className="hover:bg-white/[0.03] cursor-pointer transition duration-200"
                        title="Click to view detailed race information"
                      >
                        <td className="p-4 font-mono font-bold text-muted-foreground/70">
                          {index + 1}
                        </td>
                        <td className="p-4 font-bold text-foreground">
                          <span className="block">{race.name}</span>
                          {race.description && (
                            <span className="text-[10px] text-muted-foreground/70 font-normal line-clamp-1">
                              {race.description}
                            </span>
                          )}
                          {race.status === "CHECKING" &&
                            (!race.trackCondition || !race.weatherSnapshot) && (
                              <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold uppercase text-amber-400">
                                <AlertTriangle className="size-3" /> Chưa có
                                điều kiện thực địa
                              </span>
                            )}
                        </td>
                        <td className="p-4">
                          <span className="block font-bold">
                            {race.distanceMeters}m
                          </span>
                          <span className="text-[10px] text-muted-foreground/70">
                            {race.trackCondition || "Dry turf"}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold">
                          {new Date(race.startTime).toLocaleString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="p-4 font-mono font-bold text-teal-400">
                          {(race.prize || 0).toLocaleString()} điểm
                        </td>
                        <td className="p-4">
                          <select
                            value={race.status}
                            disabled={actionLoading === race._id}
                            onChange={(e) =>
                              handleStatusChange(race._id, e.target.value)
                            }
                            className={`rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-muted focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-50 cursor-pointer ${raceStatusColors[race.status] || "text-muted-foreground border-border"}`}
                          >
                            {raceStatusOptions.map((opt) => (
                              <option
                                key={opt}
                                value={opt}
                                className="bg-card text-foreground"
                              >
                                {opt}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() =>
                              handleDeleteRace(race._id, race.name)
                            }
                            disabled={actionLoading === race._id || isLocked}
                            className="rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/20 px-2.5 py-1.5 text-red-400 hover:text-foreground transition disabled:opacity-30 disabled:hover:bg-red-500/5 disabled:hover:text-red-400"
                            title={
                              isLocked
                                ? "Trận đấu đang diễn ra hoặc đã kết thúc, không thể xóa"
                                : "Xóa vòng đua"
                            }
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Race Detail Modal */}
      {selectedRace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary to-teal-500" />

            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${raceStatusColors[selectedRace.status] || "text-muted-foreground border-border bg-white/5"}`}
                >
                  {selectedRace.status}
                </span>
                <h3 className="text-xl font-black uppercase text-foreground mt-1.5">
                  {selectedRace.name}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedRace(null);
                  setRaceRegistrations([]);
                }}
                className="text-muted-foreground/70 hover:text-foreground text-lg font-bold bg-white/5 hover:bg-white/10 rounded-lg size-8 flex items-center justify-center transition"
              >
                &times;
              </button>
            </div>

            {/* General Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-white/[0.02] border border-border rounded-xl p-3">
                <span className="block text-[10px] uppercase text-muted-foreground/70 font-bold mb-1">
                  Cự ly thi đấu
                </span>
                <span className="text-sm font-black text-foreground">
                  {selectedRace.distanceMeters} mét
                </span>
              </div>
              {selectedRace.imageUrl && (
                <div className="bg-white/[0.02] border border-border rounded-xl p-3 flex flex-col justify-between">
                  <span className="block text-[10px] uppercase text-muted-foreground/70 font-bold mb-1">
                    Hình ảnh trận đua
                  </span>
                  <div className="relative w-full h-24 rounded-lg overflow-hidden border border-border">
                    <Image
                      src={selectedRace.imageUrl}
                      alt={selectedRace.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
              <div className="bg-white/[0.02] border border-border rounded-xl p-3">
                <span className="block text-[10px] uppercase text-muted-foreground/70 font-bold mb-1">
                  Mặt sân đua
                </span>
                <span className="text-sm font-black text-foreground">
                  {selectedRace.trackCondition || "Dry turf"}
                </span>
              </div>
              <div className="bg-white/[0.02] border border-border rounded-xl p-3">
                <span className="block text-[10px] uppercase text-muted-foreground/70 font-bold mb-1">
                  Dự báo thời tiết
                </span>
                <span className="text-sm font-black text-foreground">
                  {selectedRace.weatherSnapshot || "Sunny"}
                </span>
              </div>
              <div className="bg-white/[0.02] border border-border rounded-xl p-3">
                <span className="block text-[10px] uppercase text-muted-foreground/70 font-bold mb-1">
                  Quỹ giải thưởng
                </span>
                <span className="text-sm font-black text-teal-400">
                  {(selectedRace.prize || 0).toLocaleString()} điểm
                </span>
              </div>
              <div className="bg-white/[0.02] border border-border rounded-xl p-3">
                <span className="block text-[10px] uppercase text-muted-foreground/70 font-bold mb-1">
                  Giới hạn số ngựa
                </span>
                <span className="text-sm font-black text-foreground">
                  {selectedRace.participantsCount || 0} /{" "}
                  {selectedRace.maxParticipants || 8} chiến mã
                </span>
              </div>
            </div>

            {/* Conditions Form — editable when not LIVE/FINISHED/RESULT_PUBLISHED */}
            {!["LIVE", "FINISHED", "RESULT_PUBLISHED"].includes(
              selectedRace.status,
            ) && (
              <div className="border border-border rounded-xl p-4 space-y-3 bg-white/[0.01]">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                    <CloudSun className="size-3.5 text-amber-400" /> Điều Kiện
                    Thực Địa
                  </h4>
                  {selectedRace.status === "CHECKING" &&
                    (!selectedRace.trackCondition ||
                      !selectedRace.weatherSnapshot) && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase text-amber-400 border border-amber-500/30 bg-amber-500/10 rounded-full px-2 py-0.5">
                        <AlertTriangle className="size-3" /> Cần điền trước khi
                        chuyển READY
                      </span>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground/60 flex items-center gap-1">
                      <Layers className="size-3" /> Mặt sân
                    </label>
                    <select
                      value={conditionsForm.trackCondition}
                      onChange={(e) =>
                        setConditionsForm((f) => ({
                          ...f,
                          trackCondition: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-border bg-muted px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                    >
                      <option value="">-- Chưa xác định --</option>
                      <option value="Dry turf">Dry turf (Cỏ khô)</option>
                      <option value="Wet turf">Wet turf (Cỏ ướt)</option>
                      <option value="Muddy">Muddy (Bùn đất)</option>
                      <option value="Synthetic">Synthetic (Nhân tạo)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground/60 flex items-center gap-1">
                      <CloudSun className="size-3" /> Thời tiết
                    </label>
                    <select
                      value={conditionsForm.weatherSnapshot}
                      onChange={(e) =>
                        setConditionsForm((f) => ({
                          ...f,
                          weatherSnapshot: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-border bg-muted px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                    >
                      <option value="">-- Chưa xác định --</option>
                      <option value="Sunny">Sunny (Nắng)</option>
                      <option value="Cloudy">Cloudy (Mây)</option>
                      <option value="Rainy">Rainy (Mưa)</option>
                      <option value="Windy">Windy (Gió)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveConditions}
                    disabled={savingConditions}
                    size="sm"
                    className="rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-wider text-[10px] h-8 px-3"
                  >
                    {savingConditions ? (
                      <>
                        <Loader2 className="size-3 animate-spin mr-1" /> Đang
                        lưu...
                      </>
                    ) : (
                      <>
                        <Save className="size-3 mr-1" /> Lưu điều kiện
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {selectedRace.description && (
              <div className="bg-white/[0.01] border border-border rounded-xl p-4 text-xs text-foreground/70 space-y-1">
                <span className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                  Thông tin mô tả
                </span>
                <p className="leading-relaxed">{selectedRace.description}</p>
              </div>
            )}

            {/* Registrations/Participants list */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Users className="size-4 text-primary" /> Chiến mã đã đăng ký
                thi đấu ({raceRegistrations.length})
              </h4>

              {loadingRegistrations ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Image
                    src="/skeletonHorse.gif"
                    alt="Đang tải..."
                    width={80}
                    height={80}
                    unoptimized
                    className="object-contain mx-auto"
                  />
                  <p className="mt-2 text-[10px] uppercase tracking-wider font-mono">
                    Đang tải danh sách chiến mã...
                  </p>
                </div>
              ) : raceRegistrations.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-xl bg-white/[0.01] text-xs text-muted-foreground/70">
                  Chưa có chiến mã nào được ghi danh tham gia vòng đua này.
                </div>
              ) : (
                <div className="rounded-xl border border-border overflow-hidden bg-muted max-h-48 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-white/[0.03] border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
                        <th className="p-2.5 w-10">Cổng</th>
                        <th className="p-2.5">Chiến mã</th>
                        <th className="p-2.5">Chủ ngựa (Owner)</th>
                        <th className="p-2.5">Nài ngựa (Jockey)</th>
                        <th className="p-2.5 text-right">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-foreground/70">
                      {raceRegistrations.map((reg, idx) => (
                        <tr key={reg._id} className="hover:bg-white/[0.01]">
                          <td className="p-2.5 font-mono font-bold text-muted-foreground/70">
                            #{idx + 1}
                          </td>
                          <td className="p-2.5 font-bold text-foreground">
                            {(typeof reg.horseId === "object"
                              ? reg.horseId?.name
                              : null) || "Chiến mã ẩn"}
                            {typeof reg.horseId === "object" &&
                              reg.horseId?.breed && (
                                <span className="block text-[9px] text-muted-foreground/60 font-normal">
                                  {reg.horseId.breed}
                                </span>
                              )}
                          </td>
                          <td className="p-2.5">
                            {(typeof reg.ownerId === "object"
                              ? reg.ownerId?.fullName
                              : null) || "N/A"}
                            {typeof reg.ownerId === "object" &&
                              reg.ownerId?.email && (
                                <span className="block text-[9px] text-muted-foreground/60">
                                  {reg.ownerId.email}
                                </span>
                              )}
                          </td>
                          <td className="p-2.5">
                            {(typeof reg.jockeyUserId === "object"
                              ? reg.jockeyUserId?.fullName
                              : null) || "Chưa gán"}
                            {typeof reg.jockeyUserId === "object" &&
                              reg.jockeyUserId?.email && (
                                <span className="block text-[9px] text-muted-foreground/60">
                                  {reg.jockeyUserId.email}
                                </span>
                              )}
                          </td>
                          <td className="p-2.5 text-right">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${
                                reg.status === "APPROVED"
                                  ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                                  : reg.status === "PENDING"
                                    ? "text-amber-400 border-amber-500/20 bg-amber-500/10"
                                    : "text-red-400 border-red-500/20 bg-red-500/10"
                              }`}
                            >
                              {reg.status === "APPROVED"
                                ? "Đã duyệt"
                                : reg.status === "PENDING"
                                  ? "Chờ duyệt"
                                  : reg.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button
                onClick={() => {
                  setSelectedRace(null);
                  setRaceRegistrations([]);
                }}
                className="rounded-xl px-5 h-10 bg-white/5 hover:bg-white/10 text-foreground font-bold uppercase tracking-wider text-xs border border-border"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
