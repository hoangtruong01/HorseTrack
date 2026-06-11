"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { racesApi, registrationsApi, type RaceItem, type RegistrationItem } from "@/lib/api-client";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  CloudSun,
  Flag,
  Layers,
  Loader2,
  Milestone,
  RefreshCw,
  Save,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  CHECKING: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  READY: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  LIVE: "text-rose-400 bg-rose-400/10 border-rose-400/20 animate-pulse",
  FINISHED: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  RESULT_PUBLISHED: "text-teal-400 bg-teal-400/10 border-teal-400/20",
  CANCELLED: "text-red-400 bg-red-400/10 border-red-400/20",
};

const STATUS_OPTIONS = [
  "SCHEDULED",
  "CHECKING",
  "READY",
  "LIVE",
  "FINISHED",
  "RESULT_PUBLISHED",
  "CANCELLED",
];

const LOCKED_STATUSES = ["LIVE", "FINISHED", "RESULT_PUBLISHED"];

export default function AdminRaceDetailPage() {
  const params = useParams();
  const raceId = params.raceId as string;

  const [race, setRace] = useState<RaceItem | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);
  const [conditionsForm, setConditionsForm] = useState({
    trackCondition: "",
    weatherSnapshot: "",
  });
  const [savingConditions, setSavingConditions] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [raceRes, regRes] = await Promise.all([
        racesApi.get(raceId),
        registrationsApi.list({ raceId, limit: 100 }),
      ]);
      setRace(raceRes);
      setConditionsForm({
        trackCondition: raceRes.trackCondition || "",
        weatherSnapshot: raceRes.weatherSnapshot || "",
      });
      setRegistrations(regRes.data || []);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Không thể tải thông tin vòng đua",
      );
    } finally {
      setLoading(false);
    }
  }, [raceId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleStatusChange = async (newStatus: string) => {
    if (!race) return;
    setChangingStatus(true);
    try {
      await racesApi.updateStatus(race._id, newStatus);
      toast.success(`Trạng thái đã đổi thành: ${newStatus}`);
      await loadData();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Cập nhật trạng thái thất bại",
      );
    } finally {
      setChangingStatus(false);
    }
  };

  const handleSaveConditions = async () => {
    if (!race) return;
    setSavingConditions(true);
    try {
      const updated = await racesApi.updateConditions(race._id, conditionsForm);
      setRace(updated);
      toast.success("Đã cập nhật điều kiện thực địa");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Cập nhật điều kiện thất bại",
      );
    } finally {
      setSavingConditions(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-[#E10600]" />
        <p className="mt-4 text-xs font-mono uppercase tracking-widest">
          Đang tải thông tin vòng đua...
        </p>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center max-w-xl mx-auto shadow-2xl">
        <AlertCircle className="size-16 text-red-500 mx-auto mb-4 stroke-[1.5]" />
        <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">
          Vòng đua không tồn tại
        </h3>
        <Button
          asChild
          className="rounded-full bg-white/5 text-foreground mt-4"
        >
          <Link href="/admin/races">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  const isLocked = LOCKED_STATUSES.includes(race.status);
  const tournamentName =
    typeof race.tournamentId === "object" ? race.tournamentId?.name : "—";

  return (
    <main className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <Link
          href="/admin/races"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition mb-3"
        >
          <ChevronLeft className="size-4" /> Quay lại danh sách trận đua
        </Link>
        <PageHeader
          eyebrow="Chi tiết vòng đua"
          title={race.name}
          description="Thông tin chi tiết, điều kiện thực địa và danh sách chiến mã đăng ký tham gia."
          actions={
            <Button
              asChild
              variant="outline"
              className="rounded-full text-xs font-bold uppercase tracking-wider h-10 px-5"
            >
              <Link
                href={`/admin/races/${race._id}/participants`}
                className="flex items-center gap-1.5"
              >
                <Users className="size-4" /> Quản lý Participants
              </Link>
            </Button>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Race Info Card */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-[0_18px_56px_rgba(0,0,0,0.28)] relative overflow-hidden p-6 space-y-5">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary to-transparent" />

          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#E10600] flex items-center gap-1.5">
              <Flag className="size-4" /> Hồ Sơ Vòng Đua
            </h3>
            <span
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${STATUS_COLORS[race.status] || "text-muted-foreground border-border bg-white/5"}`}
            >
              {race.status}
            </span>
          </div>

          {race.description && (
            <p className="text-sm text-foreground/70 leading-relaxed">
              {race.description}
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs pt-4 border-t border-border">
            <div>
              <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">
                Giải đấu
              </span>
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Trophy className="size-3.5 text-primary" /> {tournamentName}
              </span>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">
                Thời gian xuất phát
              </span>
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5 text-primary" />
                {new Date(race.startTime).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">
                Cự ly thi đấu
              </span>
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Milestone className="size-3.5 text-primary" />{" "}
                {race.distanceMeters} mét
              </span>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">
                Mặt sân
              </span>
              <span
                className={`font-bold ${race.trackCondition ? "text-foreground" : "text-muted-foreground/50 italic"}`}
              >
                {race.trackCondition || "Chưa xác định"}
              </span>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">
                Thời tiết
              </span>
              <span
                className={`font-bold ${race.weatherSnapshot ? "text-foreground" : "text-muted-foreground/50 italic"}`}
              >
                {race.weatherSnapshot || "Chưa xác định"}
              </span>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">
                Chiến mã
              </span>
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Users className="size-3.5 text-primary" />
                {race.participantsCount || 0} / {race.maxParticipants || 8}
              </span>
            </div>
          </div>
        </div>

        {/* Right column: Status + Conditions */}
        <div className="space-y-4">
          {/* Status Control */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-[0_18px_56px_rgba(0,0,0,0.28)] relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-500 to-transparent" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 flex items-center justify-between">
              Trạng Thái
              <Button
                onClick={loadData}
                variant="ghost"
                className="size-6 p-0 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="size-3.5" />
              </Button>
            </h3>
            <select
              value={race.status}
              disabled={changingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-wider bg-muted focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-50 cursor-pointer ${STATUS_COLORS[race.status] || "text-muted-foreground border-border"}`}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option
                  key={opt}
                  value={opt}
                  className="bg-card text-foreground"
                >
                  {opt}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-muted-foreground/60">
              Giải thưởng:{" "}
              <span className="font-bold text-teal-400">
                {(race.prize || 0).toLocaleString()} pts
              </span>
            </p>
          </div>

          {/* Conditions Form */}
          {!isLocked && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-[0_18px_56px_rgba(0,0,0,0.28)] relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-amber-500 to-transparent" />
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-400 flex items-center gap-1.5">
                  <CloudSun className="size-3.5" /> Điều Kiện Thực Địa
                </h3>
                {race.status === "CHECKING" &&
                  (!race.trackCondition || !race.weatherSnapshot) && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-400 border border-amber-500/30 bg-amber-500/10 rounded-full px-2 py-0.5">
                      <AlertTriangle className="size-3" /> Cần điền
                    </span>
                  )}
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
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
                <div className="space-y-1">
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

              <Button
                onClick={handleSaveConditions}
                disabled={savingConditions}
                size="sm"
                className="w-full rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-wider text-[10px] h-8"
              >
                {savingConditions ? (
                  <>
                    <Loader2 className="size-3 animate-spin mr-1" /> Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="size-3 mr-1" /> Lưu điều kiện
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Registrations */}
      <section className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-tight text-foreground flex items-center gap-2 border-b border-border pb-3">
          <Users className="size-4 text-primary" /> Chiến Mã Đã Đăng Ký (
          {registrations.length})
        </h3>

        {registrations.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-2xl bg-card/50 text-xs text-muted-foreground/70">
            Chưa có chiến mã nào được ghi danh tham gia vòng đua này.
          </div>
        ) : (
          <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-white/[0.02] text-muted-foreground font-black uppercase tracking-wider">
                    <th className="p-3.5 w-10">#</th>
                    <th className="p-3.5">Chiến mã</th>
                    <th className="p-3.5">Chủ ngựa</th>
                    <th className="p-3.5">Nài ngựa</th>
                    <th className="p-3.5 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-foreground/70">
                  {registrations.map((reg, idx) => (
                    <tr key={reg._id} className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-mono font-bold text-muted-foreground/70">
                        #{idx + 1}
                      </td>
                      <td className="p-3.5 font-bold text-foreground">
                        {(typeof reg.horseId === "object" ? reg.horseId?.name : null) || "Chiến mã ẩn"}
                        {typeof reg.horseId === "object" && reg.horseId?.breed && (
                          <span className="block text-[10px] text-muted-foreground/60 font-normal">
                            {reg.horseId.breed}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {(typeof reg.ownerId === "object" ? reg.ownerId?.fullName : null) || "N/A"}
                        {typeof reg.ownerId === "object" && reg.ownerId?.email && (
                          <span className="block text-[10px] text-muted-foreground/60">
                            {reg.ownerId.email}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {(typeof reg.jockeyUserId === "object" ? reg.jockeyUserId?.fullName : null) || "Chưa gán"}
                      </td>
                      <td className="p-3.5 text-right">
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
          </div>
        )}
      </section>
    </main>
  );
}
