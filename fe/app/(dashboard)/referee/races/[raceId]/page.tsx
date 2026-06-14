"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { raceChecksApi, racesApi, type RaceCheckItem } from "@/lib/api-client";
import {
  ArrowLeft,
  Edit2,
  Flag,
  Play,
  Save,
  ShieldAlert,
  Siren,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Types
type Race = {
  _id: string;
  name: string;
  startTime: string;
  status:
    | "SCHEDULED"
    | "CHECKING"
    | "READY"
    | "LIVE"
    | "FINISHED"
    | "RESULT_PUBLISHED"
    | "CANCELLED";
  tournamentId: string;
  description?: string;
  distanceMeter: number;
  trackCondition?: string;
  weatherSnapshot?: string;
};

type AuthUser = {
  _id?: string;
  id?: string;
};

type Assignment = {
  refereeUserId: { _id?: string; id?: string } | string;
  role: string;
  salary?: number;
  status: string;
  assignedBy?: { fullName?: string };
  createdAt?: string;
};

export default function RefereeRaceDetailPage() {
  const params = useParams();
  const raceId = params.raceId as string;
  const router = useRouter();

  const [race, setRace] = useState<Race | null>(null);
  const [checks, setChecks] = useState<RaceCheckItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const currentUserRef = useRef<AuthUser | null>(null);
  const [myAssignment, setMyAssignment] = useState<Assignment | null>(null);

  // Conditions form state
  const [trackCondition, setTrackCondition] = useState("");
  const [weatherSnapshot, setWeatherSnapshot] = useState("");
  const [isSubmittingConditions, setIsSubmittingConditions] = useState(false);

  // Editing state for checklist items
  const [editingCheckId, setEditingCheckId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<"pending" | "passed" | "failed">(
    "pending",
  );
  const [editHealthNote, setEditHealthNote] = useState("");
  const [editEquipmentNote, setEditEquipmentNote] = useState("");
  const [editJockeyCheckedIn, setEditJockeyCheckedIn] = useState(false);
  const [editJockeyNote, setEditJockeyNote] = useState("");
  const [isSavingCheck, setIsSavingCheck] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch user info
      let activeUser = currentUserRef.current;
      if (!activeUser) {
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          activeUser = userData.user as AuthUser;
          currentUserRef.current = activeUser;
        }
      }

      // 2. Fetch race info
      const raceRes = await fetch(`/api/referee/races/${raceId}`);
      if (!raceRes.ok) throw new Error("Không thể tải thông tin cuộc đua");
      const raceData = await raceRes.json();
      const raceInfo = raceData.data;
      setRace(raceInfo);
      setTrackCondition(raceInfo?.trackCondition || "");
      setWeatherSnapshot(raceInfo?.weatherSnapshot || "");

      // 3. Fetch pre-race checks
      const checksData = await raceChecksApi.listByRace(raceId);
      setChecks(checksData || []);

      // 4. Fetch assignments for this race
      if (activeUser) {
        const assRes = await fetch(
          `/api/referee/referee-assignments/race/${raceId}`,
        );
        if (assRes.ok) {
          const assData = await assRes.json();
          const rawData = assData.data;
          const assignmentsList: Assignment[] = Array.isArray(rawData)
            ? rawData
            : rawData?.data || [];
          const userId = activeUser._id || activeUser.id;
          const match = assignmentsList.find((a) => {
            const refUserId =
              typeof a.refereeUserId === "object"
                ? a.refereeUserId._id || a.refereeUserId.id
                : a.refereeUserId;
            return String(refUserId) === String(userId);
          });
          setMyAssignment(match || null);
        }
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  }, [raceId]);

  useEffect(() => {
    if (!raceId || raceId === "undefined") return;
    fetchData();
  }, [raceId, fetchData]);

  const handleInitializeChecks = async () => {
    setIsInitializing(true);
    try {
      await raceChecksApi.initialize(raceId);
      toast.success("Khởi tạo danh sách kiểm tra ngựa thành công!");
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi khởi tạo.");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleUpdateRaceStatus = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/referee/races/${raceId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(
          resData.message || "Không thể chuyển trạng thái trận đấu",
        );
      }

      toast.success(`Chuyển trạng thái trận đấu sang ${newStatus} thành công!`);
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi thay đổi trạng thái.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdateConditions = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingConditions(true);
    try {
      await racesApi.updateConditions(raceId, {
        trackCondition,
        weatherSnapshot,
      });
      toast.success("Cập nhật điều kiện đường đua thành công!");
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi cập nhật điều kiện.");
    } finally {
      setIsSubmittingConditions(false);
    }
  };

  const startEdit = (check: RaceCheckItem) => {
    setEditingCheckId(check._id);
    setEditStatus(check.status);
    setEditHealthNote(check.healthNote || "");
    setEditEquipmentNote(check.equipmentNote || "");
    setEditJockeyCheckedIn(check.jockeyCheckedIn || false);
    setEditJockeyNote(check.jockeyNote || "");
  };

  const cancelEdit = () => {
    setEditingCheckId(null);
  };

  const saveCheckEdit = async (checkId: string) => {
    setIsSavingCheck(true);
    try {
      await raceChecksApi.update(checkId, {
        status: editStatus,
        healthNote: editHealthNote,
        equipmentNote: editEquipmentNote,
        jockeyCheckedIn: editJockeyCheckedIn,
        jockeyNote: editJockeyNote,
      });
      toast.success("Cập nhật kết quả kiểm tra thành công!");
      setEditingCheckId(null);
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi lưu.");
    } finally {
      setIsSavingCheck(false);
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "Chưa xác định";
    const d = new Date(dateStr);
    return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ngày ${d.toLocaleDateString("vi-VN")}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!race) {
    return (
      <main className="max-w-4xl mx-auto p-8 space-y-4 text-center">
        <h2 className="text-xl font-bold text-white">
          Không tìm thấy cuộc đua
        </h2>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </main>
    );
  }

  const allPassed =
    checks.length > 0 && checks.every((c) => c.status === "passed");
  return (
    <main className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Back link */}
      <Link
        href="/referee"
        className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="size-3.5 mr-1" /> Quay lại bàn làm việc
      </Link>

      <PageHeader
        eyebrow="Tác nghiệp trọng tài"
        title={race.name}
        description={`Kiểm duyệt an toàn thiết bị bảo hộ, sức khỏe chiến mã và điểm danh nài ngựa trước khi xuất phát.`}
        actions={
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full"
            >
              <Link href={`/referee/races/${raceId}/violations`}>
                <Siren className="size-4 mr-1 text-primary" /> Lỗi vi phạm
              </Link>
            </Button>
            <Button
              asChild
              className="h-11 rounded-full bg-[#E10600] hover:bg-[#B80500] text-white"
            >
              <Link href={`/referee/races/${raceId}/result-entry`}>
                <Flag className="size-4 mr-1" /> Nhập kết quả
              </Link>
            </Button>
          </div>
        }
      />

      {/* Thông tin phân công từ Admin */}
      {myAssignment && (
        <section className="rounded-2xl border border-teal-200 dark:border-teal-500/30 bg-teal-50/50 dark:bg-[linear-gradient(135deg,rgba(20,184,166,0.08),rgba(21,21,30,0.95))] p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="size-10 rounded-xl bg-teal-100/50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/25 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 mt-0.5">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <span className="text-[9px] font-black tracking-widest text-teal-600 dark:text-teal-400 uppercase">
                Quyết định phân công nhiệm vụ
              </span>
              <h4 className="text-sm font-black text-foreground mt-0.5">
                Bạn đã được chỉ định làm:{" "}
                <span className="text-teal-600 dark:text-teal-400 uppercase">
                  {myAssignment.role === "main"
                    ? "Trọng tài chính"
                    : "Trọng tài phụ"}
                </span>
              </h4>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Mức lương giám sát vòng đua:{" "}
                <strong className="text-foreground font-mono">
                  {myAssignment.salary?.toLocaleString("vi-VN") || 0} Điểm
                  thưởng
                </strong>
                {myAssignment.assignedBy && (
                  <>
                    {" "}
                    · Người phân công:{" "}
                    <strong className="text-foreground">
                      {myAssignment.assignedBy.fullName || "Ban tổ chức"}
                    </strong>
                  </>
                )}
                {myAssignment.createdAt && (
                  <>
                    {" "}
                    · Ngày phân công:{" "}
                    <strong className="text-muted-foreground">
                      {new Date(myAssignment.createdAt).toLocaleDateString(
                        "vi-VN",
                      )}
                    </strong>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                myAssignment.status === "accepted"
                  ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 border-emerald-200 dark:border-emerald-400/20"
                  : myAssignment.status === "declined"
                    ? "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-400/10 border-red-200 dark:border-red-400/20"
                    : "text-amber-700 dark:text-yellow-400 bg-amber-50 dark:bg-yellow-400/10 border-amber-200 dark:border-yellow-400/20"
              }`}
            >
              {myAssignment.status === "accepted"
                ? "Đã nhận nhiệm vụ"
                : myAssignment.status === "declined"
                  ? "Đã từ chối"
                  : "Đang chờ phê duyệt"}
            </span>
          </div>
        </section>
      )}

      {/* Race Status Control Panel */}
      <section className="relative overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-card p-5 shadow-md">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              TRẠNG THÁI CUỘC ĐUA HIỆN TẠI
            </span>
            <div className="mt-1 flex items-center gap-3">
              <StatusBadge
                label={
                  race.status === "SCHEDULED"
                    ? "Đã lên lịch"
                    : race.status === "CHECKING"
                      ? "Đang kiểm duyệt"
                      : race.status === "READY"
                        ? "SẴN SÀNG"
                        : race.status === "LIVE"
                          ? "ĐANG CHẠY"
                          : race.status === "FINISHED"
                            ? "ĐÃ XONG"
                            : "ĐÃ CÔNG BỐ"
                }
                tone={
                  race.status === "LIVE"
                    ? "red"
                    : race.status === "READY"
                      ? "green"
                      : race.status === "CHECKING"
                        ? "yellow"
                        : "slate"
                }
                pulse={race.status === "LIVE" || race.status === "CHECKING"}
              />
              <span className="text-sm font-black text-foreground uppercase">
                {race.name}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Giờ xuất phát dự kiến: {formatDateTime(race.startTime)} · Cự ly:{" "}
              {race.distanceMeter}m
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {race.status === "SCHEDULED" && (
              <Button
                onClick={() => handleUpdateRaceStatus("CHECKING")}
                disabled={isUpdatingStatus}
                className="h-10 px-5 rounded-full bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-black uppercase"
              >
                Mở đợt kiểm duyệt ngựa
              </Button>
            )}

            {race.status === "CHECKING" && (
              <Button
                onClick={() => handleUpdateRaceStatus("READY")}
                disabled={isUpdatingStatus || !allPassed}
                className={`h-10 px-5 rounded-full text-xs font-black uppercase ${
                  allPassed
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "bg-muted border border-border text-muted-foreground/50 cursor-not-allowed"
                }`}
              >
                {!allPassed
                  ? "Chờ duyệt tất cả ngựa qua"
                  : "Thiết lập Sẵn sàng xuất phát"}
              </Button>
            )}

            {race.status === "READY" && (
              <Button
                onClick={() => handleUpdateRaceStatus("LIVE")}
                disabled={isUpdatingStatus}
                className="h-10 px-5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase flex items-center gap-1.5 animate-pulse"
              >
                <Play className="size-3.5 fill-current" /> Xuất phát trận đấu!
              </Button>
            )}

            {race.status === "LIVE" && (
              <p className="text-xs text-primary font-bold animate-pulse uppercase">
                Trận đấu đang diễn ra trực tiếp. Vui lòng chuyển sang tab Nhập
                kết quả khi ngựa hoàn thành!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Race Conditions */}
      {race.status !== "LIVE" &&
        race.status !== "FINISHED" &&
        race.status !== "RESULT_PUBLISHED" &&
        race.status !== "CANCELLED" && (
          <section className="rounded-2xl border border-border dark:border-white/10 bg-card p-5 space-y-4">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                ĐIỀU KIỆN ĐƯỜNG ĐUA
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ghi nhận tình trạng mặt đường và thời tiết trước khi xuất phát.
              </p>
            </div>
            <form
              onSubmit={handleUpdateConditions}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                  Tình trạng mặt đường (Track Condition)
                </label>
                <select
                  value={trackCondition}
                  onChange={(e) => setTrackCondition(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground focus:border-teal-500 focus:outline-none"
                >
                  <option value="" className="bg-card">-- Chưa xác định --</option>
                  <option value="Dry turf" className="bg-card">Dry turf (Cỏ khô)</option>
                  <option value="Wet turf" className="bg-card">Wet turf (Cỏ ướt)</option>
                  <option value="Muddy" className="bg-card">Muddy (Bùn đất)</option>
                  <option value="Synthetic" className="bg-card">Synthetic (Nhân tạo)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                  Thời tiết (Weather Snapshot)
                </label>
                <select
                  value={weatherSnapshot}
                  onChange={(e) => setWeatherSnapshot(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground focus:border-teal-500 focus:outline-none"
                >
                  <option value="" className="bg-card">-- Chưa xác định --</option>
                  <option value="Sunny" className="bg-card">Sunny (Nắng)</option>
                  <option value="Cloudy" className="bg-card">Cloudy (Mây)</option>
                  <option value="Rainy" className="bg-card">Rainy (Mưa)</option>
                  <option value="Windy" className="bg-card">Windy (Gió)</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmittingConditions}
                  className="h-9 px-5 rounded-full bg-teal-500 hover:bg-teal-600 text-teal-950 dark:text-black text-xs font-black uppercase"
                >
                  {isSubmittingConditions ? "Đang lưu..." : "Lưu điều kiện"}
                </Button>
              </div>
            </form>
          </section>
        )}

      {/* Pre-race checklist items */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black uppercase tracking-wider text-foreground">
              Báo cáo kiểm duyệt ngựa trước Race
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Đảm bảo tất cả ngựa đều đủ tiêu chuẩn sức khỏe (PASSED) và Jockey
              đã có mặt điểm danh.
            </p>
          </div>

          {checks.length === 0 && race.status === "CHECKING" && (
            <Button
              onClick={handleInitializeChecks}
              disabled={isInitializing}
              className="h-10 px-5 rounded-full bg-primary hover:bg-primary/90 text-xs font-black uppercase"
            >
              {isInitializing
                ? "Đang xử lý..."
                : "Khởi tạo danh sách kiểm duyệt"}
            </Button>
          )}
        </div>

        {checks.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-muted/40 text-muted-foreground text-xs">
            {race.status === "SCHEDULED"
              ? "Cuộc đua chưa mở đợt kiểm duyệt. Vui lòng bấm 'Mở đợt kiểm duyệt ngựa' ở trên."
              : "Danh sách kiểm duyệt chưa được khởi tạo. Vui lòng bấm 'Khởi tạo danh sách kiểm duyệt'."}
          </div>
        ) : (
          <div className="grid gap-4">
            {checks.map((check) => {
              const horse =
                typeof check.horseId === "object" ? check.horseId : null;
              const isEditing = editingCheckId === check._id;
              return (
                <article
                  key={check._id}
                  className={`rounded-2xl border p-5 transition ${
                    isEditing
                      ? "border-primary bg-secondary/50 dark:bg-[#1C1C28]"
                      : check.status === "passed"
                        ? "border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/10"
                        : check.status === "failed"
                          ? "border-red-500/20 bg-red-50/30 dark:bg-red-950/10"
                          : "border-border bg-card"
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-4">
                      {/* Editing Header */}
                      <div className="flex justify-between items-center pb-3 border-b border-border">
                        <div>
                          <h4 className="text-xs font-black uppercase text-primary">
                            Cập nhật kiểm tra sức khỏe
                          </h4>
                          <h3 className="text-sm font-bold text-foreground uppercase mt-0.5">
                            {horse?.name}
                          </h3>
                        </div>
                        <StatusBadge
                          label={
                            editStatus === "passed"
                              ? "ĐẠT"
                              : editStatus === "failed"
                                ? "K. ĐẠT"
                                : "Chờ duyệt"
                          }
                          tone={
                            editStatus === "passed"
                              ? "green"
                              : editStatus === "failed"
                                ? "red"
                                : "yellow"
                          }
                        />
                      </div>

                      {/* Edit Fields */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">
                            Trạng thái duyệt
                          </label>
                          <select
                            value={editStatus}
                            onChange={(e) =>
                              setEditStatus(e.target.value as "pending" | "passed" | "failed")
                            }
                            className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                          >
                            <option value="pending" className="bg-card">
                              Chờ duyệt (PENDING)
                            </option>
                            <option value="passed" className="bg-card">
                              Đạt chuẩn (PASSED)
                            </option>
                            <option value="failed" className="bg-card">
                              Không đạt (FAILED)
                            </option>
                          </select>
                        </div>

                        <div className="flex items-center gap-3 sm:pt-6">
                          <input
                            type="checkbox"
                            id="jockeyCheckedIn"
                            checked={editJockeyCheckedIn}
                            onChange={(e) =>
                              setEditJockeyCheckedIn(e.target.checked)
                            }
                            className="size-4 rounded border-border bg-muted text-primary focus:ring-0 focus:ring-offset-0"
                          />
                          <label
                            htmlFor="jockeyCheckedIn"
                            className="text-xs font-bold text-foreground uppercase cursor-pointer selection:bg-transparent"
                          >
                            Jockey đã có mặt (Checked in)
                          </label>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">
                            Ghi chú sức khỏe ngựa
                          </label>
                          <input
                            type="text"
                            value={editHealthNote}
                            onChange={(e) => setEditHealthNote(e.target.value)}
                            placeholder="Nhịp tim bình thường, cơ đùi săn chắc..."
                            className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">
                            Ghi chú thiết bị/giáp ngựa
                          </label>
                          <input
                            type="text"
                            value={editEquipmentNote}
                            onChange={(e) =>
                              setEditEquipmentNote(e.target.value)
                            }
                            placeholder="Yên ngựa chắc chắn, móng sắt đầy đủ..."
                            className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">
                            Ghi chú nài ngựa (Jockey Note)
                          </label>
                          <input
                            type="text"
                            value={editJockeyNote}
                            onChange={(e) => setEditJockeyNote(e.target.value)}
                            placeholder="Trang phục bảo hộ hợp lệ, cân nặng đạt chuẩn..."
                            className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Edit Actions */}
                      <div className="flex justify-end gap-3 pt-3 border-t border-border">
                        <Button
                          onClick={cancelEdit}
                          disabled={isSavingCheck}
                          variant="outline"
                          className="rounded-full text-xs h-9 uppercase font-bold"
                        >
                          Hủy
                        </Button>
                        <Button
                          onClick={() => saveCheckEdit(check._id)}
                          disabled={isSavingCheck}
                          className="rounded-full bg-primary hover:bg-primary/90 text-xs h-9 uppercase font-bold text-primary-foreground flex items-center gap-1.5"
                        >
                          <Save className="size-3.5" /> Lưu kết quả
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      {/* Check Display */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <StatusBadge
                            label={
                              check.status === "passed"
                                ? "ĐẠT"
                                : check.status === "failed"
                                  ? "KHÔNG ĐẠT"
                                  : "Chờ kiểm"
                            }
                            tone={
                              check.status === "passed"
                                ? "green"
                                : check.status === "failed"
                                  ? "red"
                                  : "yellow"
                            }
                            pulse={check.status === "pending"}
                          />
                          <h4 className="text-sm font-black uppercase text-foreground">
                            {horse?.name}
                          </h4>
                          <span className="text-[10px] text-muted-foreground">
                            ({horse?.breed})
                          </span>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
                          <p>
                            Sức khỏe ngựa:{" "}
                            <strong className="text-foreground">
                              {check.healthNote || "Chưa ghi nhận"}
                            </strong>
                          </p>
                          <p>
                            Giáp sắt/Yên:{" "}
                            <strong className="text-foreground">
                              {check.equipmentNote || "Chưa ghi nhận"}
                            </strong>
                          </p>
                          <p className="sm:col-span-2 flex items-center gap-1.5">
                            Nài ngựa (Jockey):
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                check.jockeyCheckedIn
                                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                                  : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20"
                              }`}
                            >
                              {check.jockeyCheckedIn
                                ? "Có mặt (Checked In)"
                                : "Vắng mặt"}
                            </span>
                            {check.jockeyNote && (
                              <span className="text-muted-foreground">
                                ({check.jockeyNote})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Edit trigger */}
                      {race.status === "CHECKING" && (
                        <Button
                          onClick={() => startEdit(check)}
                          variant="outline"
                          className="h-9 rounded-full text-xs font-bold uppercase shrink-0"
                        >
                          <Edit2 className="size-3.5 mr-1" /> Cập nhật
                        </Button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
