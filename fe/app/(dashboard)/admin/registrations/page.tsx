"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Search,
  Trophy,
  Flag,
  User,
  Calendar,
  LayoutGrid,
  List,
  CheckSquare,
  Square,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  Award,
  ChevronRight,
  ShieldCheck,
  Eye,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  registrationsApi,
  tournamentsApi,
  racesApi,
  type RegistrationItem,
  type TournamentItem,
  type RaceItem,
} from "@/lib/api-client";
import { formatRegistrationStatus, getHorseImage } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function AdminRegistrationsPage() {
  const { i18n } = useTranslation();
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("ALL");
  const [selectedRaceId, setSelectedRaceId] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Tournament & Race list for filter dropdowns
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [races, setRaces] = useState<RaceItem[]>([]);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Registration Detail Modal State
  const [selectedDetailRegistration, setSelectedDetailRegistration] = useState<RegistrationItem | null>(null);

  // Bulk & Single Action Dialog States
  const [bulkActionType, setBulkActionType] = useState<"approve" | "reject" | null>(null);
  const [bulkReason, setBulkReason] = useState("");
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  // Single Item Action State
  const [singleActionTarget, setSingleActionTarget] = useState<{
    id: string;
    action: "approve" | "reject";
    horseName?: string;
  } | null>(null);
  const [singleReason, setSingleReason] = useState("");
  const [isSingleSubmitting, setIsSingleSubmitting] = useState(false);

  // Fetch initial data
  const fetchRegistrations = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await registrationsApi.list({ limit: 100 });
      setRegistrations(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Không thể tải danh sách đăng ký.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const fetchTournamentsAndRaces = useCallback(async () => {
    try {
      const [tRes, rRes] = await Promise.all([
        tournamentsApi.list({ limit: 100 }),
        racesApi.list({ limit: 100 }),
      ]);
      setTournaments(tRes.data || []);
      setRaces(rRes.data || []);
    } catch (e) {
      console.error("Lỗi tải danh sách giải đấu/trận đua:", e);
    }
  }, []);

  useEffect(() => {
    void fetchRegistrations();
    void fetchTournamentsAndRaces();
  }, [fetchRegistrations, fetchTournamentsAndRaces]);

  // Handle Tournament filter change -> Filter Races accordingly
  const handleTournamentFilterChange = (tId: string) => {
    setSelectedTournamentId(tId);
    setSelectedRaceId("ALL");
  };

  // Available races based on selected tournament
  const availableRaces = races.filter((r) => {
    if (selectedTournamentId === "ALL") return true;
    const tourId = typeof r.tournamentId === "object" ? r.tournamentId?._id : r.tournamentId;
    return tourId === selectedTournamentId;
  });

  // Filtered registrations
  const filteredRegistrations = registrations.filter((reg) => {
    // 1. Search Filter
    const horseObj = typeof reg.horseId === "object" ? reg.horseId : null;
    const ownerObj = typeof reg.ownerId === "object" ? reg.ownerId : null;
    const raceObj = typeof reg.raceId === "object" ? reg.raceId : null;
    const tourObj = typeof reg.tournamentId === "object" ? reg.tournamentId : null;

    const horseName = horseObj?.name || "";
    const horseBreed = horseObj?.breed || "";
    const ownerName = ownerObj?.fullName || "";
    const ownerEmail = ownerObj?.email || "";
    const raceName = raceObj?.name || "";
    const tourName = tourObj?.name || "";

    const query = search.toLowerCase();
    const matchesSearch =
      !search ||
      horseName.toLowerCase().includes(query) ||
      horseBreed.toLowerCase().includes(query) ||
      ownerName.toLowerCase().includes(query) ||
      ownerEmail.toLowerCase().includes(query) ||
      raceName.toLowerCase().includes(query) ||
      tourName.toLowerCase().includes(query);

    // 2. Status Filter
    const regStatusUpper = (reg.status || "PENDING").toUpperCase();
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PENDING" && regStatusUpper === "PENDING") ||
      (statusFilter === "APPROVED" && regStatusUpper === "APPROVED") ||
      (statusFilter === "REJECTED" && regStatusUpper === "REJECTED") ||
      (statusFilter === "CANCELLED" && (regStatusUpper === "CANCELLED" || regStatusUpper === "WITHDRAWN"));

    // 3. Tournament Filter
    const tourId = typeof reg.tournamentId === "object" ? reg.tournamentId?._id : reg.tournamentId;
    const matchesTournament = selectedTournamentId === "ALL" || tourId === selectedTournamentId;

    // 4. Race Filter
    const raceId = typeof reg.raceId === "object" ? reg.raceId?._id : reg.raceId;
    const matchesRace = selectedRaceId === "ALL" || raceId === selectedRaceId;

    return matchesSearch && matchesStatus && matchesTournament && matchesRace;
  });

  // KPI Stats
  const counts = registrations.reduce(
    (acc, reg) => {
      const st = (reg.status || "PENDING").toUpperCase();
      if (st === "APPROVED") acc.approved += 1;
      else if (st === "REJECTED") acc.rejected += 1;
      else if (st === "PENDING") acc.pending += 1;
      else acc.other += 1;
      return acc;
    },
    { approved: 0, pending: 0, rejected: 0, other: 0 }
  );

  // Selection Logic
  const pendingItemsInFiltered = filteredRegistrations.filter(
    (r) => (r.status || "PENDING").toUpperCase() === "PENDING"
  );

  const isAllSelected =
    pendingItemsInFiltered.length > 0 &&
    pendingItemsInFiltered.every((r) => selectedIds.includes(r._id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingItemsInFiltered.map((r) => r._id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleConfirmBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkSubmitting(true);
    try {
      const res = await registrationsApi.bulkApprove(selectedIds);
      toast.success(
        `Đã phê duyệt thành công ${res.successful}/${res.total} đơn đăng ký được chọn!`
      );
      setSelectedIds([]);
      setBulkActionType(null);
      await fetchRegistrations();
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Lỗi khi phê duyệt hàng loạt.");
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const handleConfirmBulkReject = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkSubmitting(true);
    try {
      const res = await registrationsApi.bulkReject(selectedIds, bulkReason);
      toast.success(
        `Đã từ chối ${res.successful}/${res.total} đơn đăng ký được chọn!`
      );
      setSelectedIds([]);
      setBulkReason("");
      setBulkActionType(null);
      await fetchRegistrations();
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Lỗi khi từ chối hàng loạt.");
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  // Single Actions
  const handleConfirmSingleAction = async () => {
    if (!singleActionTarget) return;
    setIsSingleSubmitting(true);
    try {
      if (singleActionTarget.action === "approve") {
        await registrationsApi.approve(singleActionTarget.id);
        toast.success(
          `Đã phê duyệt đơn đăng ký của chiến mã ${singleActionTarget.horseName || ""} thành công!`
        );
      } else {
        await registrationsApi.reject(singleActionTarget.id, singleReason);
        toast.success(
          `Đã từ chối đơn đăng ký của chiến mã ${singleActionTarget.horseName || ""} thành công!`
        );
      }
      setSingleActionTarget(null);
      setSingleReason("");
      if (selectedDetailRegistration?._id === singleActionTarget.id) {
        setSelectedDetailRegistration(null);
      }
      await fetchRegistrations();
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Lỗi khi xử lý đơn đăng ký.");
    } finally {
      setIsSingleSubmitting(false);
    }
  };

  return (
    <main className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <PageHeader
        eyebrow="Phê duyệt ghi danh"
        title="Duyệt Đăng Ký Trận Đua"
        description="Quản lý và duyệt hồ sơ đăng ký tham gia vòng đua từ các chủ ngựa. Bấm trực tiếp vào từng thẻ hoặc hàng để xem chi tiết đầy đủ."
        actions={
          <Button
            onClick={fetchRegistrations}
            disabled={isRefreshing}
            variant="outline"
            className="rounded-full gap-2 border-border bg-card text-xs font-bold uppercase tracking-wider"
          >
            <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            Làm mới
          </Button>
        }
      />

      {/* Summary KPI Cards */}
      <section className="grid gap-4 md:grid-cols-4">
        <div
          onClick={() => setStatusFilter("PENDING")}
          className={`cursor-pointer rounded-2xl border p-5 transition duration-200 ${
            statusFilter === "PENDING"
              ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
              : "border-border bg-card hover:border-amber-500/40"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
              Chờ duyệt
            </span>
            <StatusBadge label="Cần xem xét" tone="yellow" pulse={counts.pending > 0} />
          </div>
          <p className="mt-3 font-mono text-3xl font-black text-foreground">
            {isLoading ? "..." : counts.pending}
          </p>
        </div>

        <div
          onClick={() => setStatusFilter("APPROVED")}
          className={`cursor-pointer rounded-2xl border p-5 transition duration-200 ${
            statusFilter === "APPROVED"
              ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
              : "border-border bg-card hover:border-emerald-500/40"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
              Đã duyệt
            </span>
            <StatusBadge label="Sẵn sàng thi đấu" tone="green" />
          </div>
          <p className="mt-3 font-mono text-3xl font-black text-foreground">
            {isLoading ? "..." : counts.approved}
          </p>
        </div>

        <div
          onClick={() => setStatusFilter("REJECTED")}
          className={`cursor-pointer rounded-2xl border p-5 transition duration-200 ${
            statusFilter === "REJECTED"
              ? "border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/10"
              : "border-border bg-card hover:border-rose-500/40"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
              Từ chối
            </span>
            <StatusBadge label="Đã từ chối" tone="red" />
          </div>
          <p className="mt-3 font-mono text-3xl font-black text-foreground">
            {isLoading ? "..." : counts.rejected}
          </p>
        </div>

        <div
          onClick={() => setStatusFilter("ALL")}
          className={`cursor-pointer rounded-2xl border p-5 transition duration-200 ${
            statusFilter === "ALL"
              ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
              : "border-border bg-card hover:border-primary/40"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Tổng số hồ sơ
            </span>
            <StatusBadge label="Toàn bộ" tone="slate" />
          </div>
          <p className="mt-3 font-mono text-3xl font-black text-foreground">
            {isLoading ? "..." : registrations.length}
          </p>
        </div>
      </section>

      {/* Filter Deck & View Switcher */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        {/* Row 1: Search & Dropdowns */}
        <div className="grid gap-4 md:grid-cols-12 items-center">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm tên ngựa, chủ nuôi, email, vòng đua..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-muted pl-10 pr-4 text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition"
            />
          </div>

          {/* Tournament Dropdown */}
          <div className="md:col-span-4 flex items-center gap-2">
            <Trophy className="size-4 text-amber-500 shrink-0" />
            <select
              value={selectedTournamentId}
              onChange={(e) => handleTournamentFilterChange(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-muted px-3 text-xs font-bold text-foreground outline-none focus:border-primary transition cursor-pointer"
            >
              <option value="ALL">🏆 Tất cả Giải đấu lớn</option>
              {tournaments.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Race Dropdown */}
          <div className="md:col-span-4 flex items-center gap-2">
            <Flag className="size-4 text-teal-400 shrink-0" />
            <select
              value={selectedRaceId}
              onChange={(e) => setSelectedRaceId(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-muted px-3 text-xs font-bold text-foreground outline-none focus:border-primary transition cursor-pointer"
            >
              <option value="ALL">🏁 Tất cả Trận đua / Vòng đấu</option>
              {availableRaces.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} ({r.distanceMeters}m)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Status Tabs & View Switcher */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-border pt-4">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { key: "ALL", label: "Tất cả" },
              { key: "PENDING", label: `Chờ duyệt (${counts.pending})` },
              { key: "APPROVED", label: `Đã duyệt (${counts.approved})` },
              { key: "REJECTED", label: `Bị từ chối (${counts.rejected})` },
              { key: "CANCELLED", label: "Đã hủy / Rút" },
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => setStatusFilter(st.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  statusFilter === st.key
                    ? "bg-primary text-foreground border border-primary shadow-sm"
                    : "bg-muted border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Right Toolbar: Select All & View Switcher */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {pendingItemsInFiltered.length > 0 && (
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl"
              >
                {isAllSelected ? <CheckSquare className="size-4 text-primary" /> : <Square className="size-4" />}
                {isAllSelected ? "Bỏ chọn tất cả" : `Chọn tất cả chờ duyệt (${pendingItemsInFiltered.length})`}
              </button>
            )}

            {/* Grid / Table Toggle */}
            <div className="flex items-center rounded-xl border border-border bg-muted p-1 gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "grid" ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Chế độ Thẻ lưới"
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "table" ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Chế độ Bảng"
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Sticky Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-40 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="rounded-2xl border border-primary/50 bg-card/95 backdrop-blur-md p-4 shadow-[0_16px_50px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-black font-mono font-black text-sm">
                {selectedIds.length}
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase text-foreground">
                  Đã chọn {selectedIds.length} đơn đăng ký thi đấu
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Bạn có thể duyệt hoặc từ chối hàng loạt các đơn này cùng một lúc.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button
                onClick={() => setBulkActionType("approve")}
                className="flex-1 sm:flex-none rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-4 gap-1.5 shadow-md"
              >
                <CheckCircle2 className="size-4" /> Duyệt tất cả đã chọn ({selectedIds.length})
              </Button>
              <Button
                onClick={() => setBulkActionType("reject")}
                variant="destructive"
                className="flex-1 sm:flex-none rounded-xl font-bold text-xs h-9 px-4 gap-1.5 shadow-md"
              >
                <XCircle className="size-4" /> Từ chối tất cả ({selectedIds.length})
              </Button>
              <Button
                onClick={() => setSelectedIds([])}
                variant="ghost"
                className="rounded-xl text-xs text-muted-foreground hover:text-foreground h-9"
              >
                Bỏ chọn
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content Rendering */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải danh sách đơn đăng ký...</p>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-xl">
          <AlertCircle className="size-14 text-muted-foreground/30 mx-auto mb-3 stroke-[1.5]" />
          <h3 className="text-lg font-black uppercase text-foreground mb-1">
            Không tìm thấy đơn đăng ký nào
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Không có dữ liệu đăng ký thỏa mãn bộ lọc hiện tại. Thử thay đổi từ khóa hoặc bộ lọc trạng thái.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Card View */
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredRegistrations.map((reg) => {
            const horseObj = typeof reg.horseId === "object" ? reg.horseId : null;
            const ownerObj = typeof reg.ownerId === "object" ? reg.ownerId : null;
            const raceObj = typeof reg.raceId === "object" ? reg.raceId : null;
            const tourObj = typeof reg.tournamentId === "object" ? reg.tournamentId : null;

            const horseName = horseObj?.name || "Chiến mã";
            const horseBreed = horseObj?.breed || "—";
            const horseImage = getHorseImage(horseObj);
            const ownerName = ownerObj?.fullName || "Chưa có tên";
            const ownerEmail = ownerObj?.email || "";
            const raceName = raceObj?.name || "Vòng đua";
            const tourName = tourObj?.name || "Giải đấu";
            const isPending = (reg.status || "PENDING").toUpperCase() === "PENDING";
            const isChecked = selectedIds.includes(reg._id);

            return (
              <div
                key={reg._id}
                onClick={() => setSelectedDetailRegistration(reg)}
                className={`group relative overflow-hidden rounded-2xl border transition duration-300 p-5 flex flex-col justify-between space-y-4 cursor-pointer hover:border-primary/60 hover:shadow-xl ${
                  isChecked
                    ? "border-primary bg-primary/[0.04] ring-2 ring-primary shadow-xl"
                    : isPending
                    ? "border-amber-500/30 bg-card hover:border-amber-500/70 shadow-md"
                    : "border-border bg-card/60"
                }`}
              >
                {/* Header Card with Checkbox & Status */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {isPending && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectItem(reg._id);
                          }}
                          className="shrink-0 cursor-pointer p-1 -m-1 hover:scale-110 transition"
                          title="Tick chọn để duyệt/từ chối hàng loạt"
                        >
                          {isChecked ? (
                            <CheckSquare className="size-5 text-primary animate-in zoom-in-50" />
                          ) : (
                            <Square className="size-5 text-muted-foreground/60 group-hover:text-foreground transition" />
                          )}
                        </div>
                      )}

                      <div className="relative size-12 rounded-xl overflow-hidden bg-muted border border-border shrink-0 flex items-center justify-center shadow-sm">
                        {horseImage ? (
                          <Image src={horseImage} alt={horseName} fill className="object-cover group-hover:scale-105 transition" />
                        ) : (
                          <span className="text-2xl">🐎</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-base font-black text-foreground uppercase tracking-tight group-hover:text-primary transition truncate">
                          {horseName}
                        </h3>
                        <p className="text-[11px] font-mono text-muted-foreground truncate">
                          Giống: <strong className="text-foreground">{horseBreed}</strong>
                        </p>
                      </div>
                    </div>

                    <StatusBadge
                      label={formatRegistrationStatus(reg.status, i18n.language)}
                      tone={
                        (reg.status || "PENDING").toUpperCase() === "APPROVED"
                          ? "green"
                          : (reg.status || "PENDING").toUpperCase() === "REJECTED"
                          ? "red"
                          : (reg.status || "PENDING").toUpperCase() === "PENDING"
                          ? "yellow"
                          : "slate"
                      }
                      pulse={isPending}
                    />
                  </div>

                  {/* Owner & Race Details Deck */}
                  <div className="mt-4 space-y-2 rounded-xl border border-border bg-muted/40 p-3 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <User className="size-3.5 text-primary" />
                        Chủ sở hữu:
                      </span>
                      <span className="font-bold text-foreground truncate max-w-[140px]">{ownerName}</span>
                    </div>
                    {ownerEmail && (
                      <p className="text-[10px] text-muted-foreground/70 text-right truncate">{ownerEmail}</p>
                    )}

                    <div className="border-t border-border/60 pt-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Trophy className="size-3.5 text-amber-500" />
                        Giải / Trận:
                      </span>
                      <span className="font-bold text-foreground truncate max-w-[150px] text-right">
                        {tourName} · {raceName}
                      </span>
                    </div>
                  </div>

                  {/* Timestamp & Fee */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString("vi-VN") : "—"}
                    </span>
                    <span className="font-bold text-teal-400">
                      Phí: {(reg.feePaid || 0).toLocaleString()} điểm
                    </span>
                  </div>

                  {reg.rejectedReason && (
                    <div className="mt-2 text-[11px] text-rose-400 bg-rose-500/5 border border-rose-500/10 rounded-lg p-2 italic">
                      Lý do từ chối: {reg.rejectedReason}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div
                  className="flex items-center gap-2 pt-3 border-t border-border"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    onClick={() => setSelectedDetailRegistration(reg)}
                    variant="outline"
                    className="flex-1 rounded-xl h-9 text-xs font-bold border-border bg-muted hover:bg-card gap-1"
                  >
                    <Eye className="size-3.5" /> Xem chi tiết
                  </Button>

                  {isPending && (
                    <>
                      <Button
                        onClick={() =>
                          setSingleActionTarget({
                            id: reg._id,
                            action: "approve",
                            horseName,
                          })
                        }
                        className="rounded-xl size-9 p-0 bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
                        title="Duyệt đơn đăng ký này"
                      >
                        <CheckCircle2 className="size-4" />
                      </Button>
                      <Button
                        onClick={() =>
                          setSingleActionTarget({
                            id: reg._id,
                            action: "reject",
                            horseName,
                          })
                        }
                        variant="destructive"
                        className="rounded-xl size-9 p-0 shrink-0"
                        title="Từ chối đơn đăng ký này"
                      >
                        <XCircle className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-black uppercase tracking-wider">
                  <th className="p-4 w-10 text-center">
                    {pendingItemsInFiltered.length > 0 && (
                      <button onClick={toggleSelectAll} className="cursor-pointer">
                        {isAllSelected ? (
                          <CheckSquare className="size-4 text-primary" />
                        ) : (
                          <Square className="size-4" />
                        )}
                      </button>
                    )}
                  </th>
                  <th className="p-4">Chiến mã</th>
                  <th className="p-4">Chủ sở hữu</th>
                  <th className="p-4">Giải / Vòng đua</th>
                  <th className="p-4">Ngày đăng ký</th>
                  <th className="p-4">Lệ phí</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRegistrations.map((reg) => {
                  const horseObj = typeof reg.horseId === "object" ? reg.horseId : null;
                  const ownerObj = typeof reg.ownerId === "object" ? reg.ownerId : null;
                  const raceObj = typeof reg.raceId === "object" ? reg.raceId : null;
                  const tourObj = typeof reg.tournamentId === "object" ? reg.tournamentId : null;

                  const horseName = horseObj?.name || "Chiến mã";
                  const horseBreed = horseObj?.breed || "—";
                  const ownerName = ownerObj?.fullName || "—";
                  const ownerEmail = ownerObj?.email || "";
                  const raceName = raceObj?.name || "—";
                  const tourName = tourObj?.name || "—";
                  const isPending = (reg.status || "PENDING").toUpperCase() === "PENDING";
                  const isChecked = selectedIds.includes(reg._id);

                  return (
                    <tr
                      key={reg._id}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest("button") || target.closest("input") || target.closest("a")) return;
                        setSelectedDetailRegistration(reg);
                      }}
                      className={`hover:bg-muted/40 cursor-pointer transition duration-150 ${
                        isChecked ? "bg-primary/[0.04]" : ""
                      }`}
                    >
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        {isPending && (
                          <button onClick={() => toggleSelectItem(reg._id)}>
                            {isChecked ? (
                              <CheckSquare className="size-4 text-primary" />
                            ) : (
                              <Square className="size-4 text-muted-foreground/60" />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="p-4 font-bold text-foreground">
                        <span className="block text-sm">{horseName}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Giống: {horseBreed}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-foreground block">{ownerName}</span>
                        {ownerEmail && (
                          <span className="text-[10px] text-muted-foreground block">{ownerEmail}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-foreground block">{raceName}</span>
                        <span className="text-[10px] text-amber-500 font-semibold block">
                          {tourName}
                        </span>
                      </td>
                      <td className="p-4 font-mono">
                        {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td className="p-4 font-mono font-bold text-teal-400">
                        {(reg.feePaid || 0).toLocaleString()} điểm
                      </td>
                      <td className="p-4">
                        <StatusBadge
                          label={formatRegistrationStatus(reg.status, i18n.language)}
                          tone={
                            (reg.status || "PENDING").toUpperCase() === "APPROVED"
                              ? "green"
                              : (reg.status || "PENDING").toUpperCase() === "REJECTED"
                              ? "red"
                              : (reg.status || "PENDING").toUpperCase() === "PENDING"
                              ? "yellow"
                              : "slate"
                          }
                          pulse={isPending}
                        />
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => setSelectedDetailRegistration(reg)}
                            variant="outline"
                            size="sm"
                            className="rounded-lg text-[11px] h-8 px-2.5 gap-1"
                          >
                            <Eye className="size-3" /> Chi tiết
                          </Button>
                          {isPending && (
                            <>
                              <Button
                                onClick={() =>
                                  setSingleActionTarget({
                                    id: reg._id,
                                    action: "approve",
                                    horseName,
                                  })
                                }
                                className="rounded-lg size-8 p-0 bg-emerald-600 hover:bg-emerald-500 text-white"
                                title="Duyệt"
                              >
                                <CheckCircle2 className="size-3.5" />
                              </Button>
                              <Button
                                onClick={() =>
                                  setSingleActionTarget({
                                    id: reg._id,
                                    action: "reject",
                                    horseName,
                                  })
                                }
                                variant="destructive"
                                className="rounded-lg size-8 p-0"
                                title="Từ chối"
                              >
                                <XCircle className="size-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Registration Detail Modal ── */}
      {selectedDetailRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)] space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200 text-card-foreground">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary via-amber-500 to-teal-500" />

            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase text-foreground tracking-tight">
                    Hồ Sơ Đăng Ký Thi Đấu
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    Mã đơn đăng ký: #{selectedDetailRegistration._id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge
                  label={formatRegistrationStatus(selectedDetailRegistration.status, i18n.language)}
                  tone={
                    (selectedDetailRegistration.status || "PENDING").toUpperCase() === "APPROVED"
                      ? "green"
                      : (selectedDetailRegistration.status || "PENDING").toUpperCase() === "REJECTED"
                      ? "red"
                      : "yellow"
                  }
                />
                <button
                  onClick={() => setSelectedDetailRegistration(null)}
                  className="rounded-full size-8 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center font-bold text-lg transition"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Content Sections */}
            {(() => {
              const reg = selectedDetailRegistration;
              const horseObj = typeof reg.horseId === "object" ? reg.horseId : null;
              const ownerObj = typeof reg.ownerId === "object" ? reg.ownerId : null;
              const jockeyObj = typeof reg.jockeyUserId === "object" ? reg.jockeyUserId : null;
              const raceObj = typeof reg.raceId === "object" ? reg.raceId : null;
              const tourObj = typeof reg.tournamentId === "object" ? reg.tournamentId : null;

              const horseName = horseObj?.name || "Chiến mã";
              const horseImage = getHorseImage(horseObj);
              const isPending = (reg.status || "PENDING").toUpperCase() === "PENDING";

              return (
                <div className="space-y-5 text-xs">
                  {/* Horse Banner */}
                  <div className="rounded-2xl border border-border bg-muted/30 p-4 flex flex-col md:flex-row items-center gap-4">
                    <div className="relative size-20 rounded-xl overflow-hidden bg-black/40 border border-border shrink-0 flex items-center justify-center">
                      {horseImage ? (
                        <Image src={horseImage} alt={horseName} fill className="object-cover" />
                      ) : (
                        <span className="text-3xl">🐎</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1 text-center md:text-left">
                      <span className="text-[10px] font-black uppercase text-primary tracking-widest block">
                        Chiến mã ghi danh
                      </span>
                      <h4 className="text-xl font-black uppercase text-foreground">{horseName}</h4>
                      <p className="text-xs text-muted-foreground">
                        Giống: <strong className="text-foreground">{horseObj?.breed || "—"}</strong> · Giới tính:{" "}
                        <strong className="text-foreground">
                          {horseObj?.gender === "MALE" ? "Đực" : horseObj?.gender === "FEMALE" ? "Cái" : "Thiến"}
                        </strong> · Tuổi: <strong className="text-foreground">{horseObj?.age ?? "—"}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Grid Information Deck */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Race & Tournament Info */}
                    <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2">
                      <h5 className="font-extrabold uppercase text-amber-500 tracking-wider text-[10px] flex items-center gap-1.5">
                        <Trophy className="size-3.5" /> Giải đấu & Trận đua
                      </h5>
                      <div className="space-y-1 pt-1">
                        <p className="font-bold text-foreground text-sm">{raceObj?.name || "Trận đua"}</p>
                        <p className="text-muted-foreground">
                          Giải đấu: <strong className="text-foreground">{tourObj?.name || "—"}</strong>
                        </p>
                        {raceObj?.startTime && (
                          <p className="text-muted-foreground font-mono text-[11px]">
                            Xuất phát: {new Date(raceObj.startTime).toLocaleString("vi-VN")}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Owner Info */}
                    <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2">
                      <h5 className="font-extrabold uppercase text-primary tracking-wider text-[10px] flex items-center gap-1.5">
                        <User className="size-3.5" /> Chủ sở hữu (Owner)
                      </h5>
                      <div className="space-y-1 pt-1">
                        <p className="font-bold text-foreground text-sm">{ownerObj?.fullName || "—"}</p>
                        {ownerObj?.email && <p className="text-muted-foreground text-[11px]">{ownerObj.email}</p>}
                        {ownerObj?.phone && <p className="text-muted-foreground text-[11px]">{ownerObj.phone}</p>}
                      </div>
                    </div>

                    {/* Jockey Info */}
                    <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2">
                      <h5 className="font-extrabold uppercase text-teal-400 tracking-wider text-[10px] flex items-center gap-1.5">
                        <User className="size-3.5 text-teal-400" /> Nài ngựa điều khiển (Jockey)
                      </h5>
                      <div className="space-y-1 pt-1">
                        <p className="font-bold text-foreground text-sm">{jockeyObj?.fullName || "Chưa chọn Jockey"}</p>
                        {jockeyObj?.email && <p className="text-muted-foreground text-[11px]">{jockeyObj.email}</p>}
                      </div>
                    </div>

                    {/* Fee & Submission Info */}
                    <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2">
                      <h5 className="font-extrabold uppercase text-emerald-400 tracking-wider text-[10px] flex items-center gap-1.5">
                        <Info className="size-3.5 text-emerald-400" /> Lệ phí & Ngày nộp
                      </h5>
                      <div className="space-y-1 pt-1">
                        <p className="text-muted-foreground">
                          Lệ phí đã nộp: <strong className="text-teal-400 font-mono font-bold">{(reg.feePaid || 0).toLocaleString()} điểm</strong>
                        </p>
                        <p className="text-muted-foreground font-mono text-[11px]">
                          Ngày đăng ký: {reg.createdAt ? new Date(reg.createdAt).toLocaleString("vi-VN") : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {reg.rejectedReason && (
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-rose-300">
                      <strong className="block text-xs uppercase font-extrabold mb-1">Lý do không duyệt:</strong>
                      <p className="italic">{reg.rejectedReason}</p>
                    </div>
                  )}

                  {/* Modal Action Buttons if PENDING */}
                  {isPending && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <p className="font-extrabold text-foreground text-xs uppercase">Xử lý duyệt đơn đăng ký này?</p>
                        <p className="text-[11px] text-muted-foreground">Bạn có thể phê duyệt ngay hoặc từ chối kèm ghi chú.</p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          onClick={() =>
                            setSingleActionTarget({
                              id: reg._id,
                              action: "approve",
                              horseName,
                            })
                          }
                          className="flex-1 sm:flex-none rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-4 gap-1"
                        >
                          <CheckCircle2 className="size-4" /> Duyệt Đơn
                        </Button>
                        <Button
                          onClick={() =>
                            setSingleActionTarget({
                              id: reg._id,
                              action: "reject",
                              horseName,
                            })
                          }
                          variant="destructive"
                          className="flex-1 sm:flex-none rounded-xl font-bold text-xs h-9 px-4 gap-1"
                        >
                          <XCircle className="size-4" /> Từ Chối
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-border pt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedDetailRegistration(null)}
                className="rounded-full px-6 text-xs font-bold"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Approve / Reject Modal */}
      {bulkActionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-black uppercase text-foreground flex items-center gap-2">
                {bulkActionType === "approve" ? (
                  <>
                    <CheckCircle2 className="size-5 text-emerald-500" /> Phê Duyệt Hàng Loạt ({selectedIds.length} Đơn)
                  </>
                ) : (
                  <>
                    <XCircle className="size-5 text-rose-500" /> Từ Chối Hàng Loạt ({selectedIds.length} Đơn)
                  </>
                )}
              </h3>
              <button
                onClick={() => setBulkActionType(null)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {bulkActionType === "approve" ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-300 leading-relaxed">
                Bạn có chắc chắn muốn phê duyệt đồng loạt <strong>{selectedIds.length}</strong> đơn đăng ký thi đấu đã chọn? Chiến mã tương ứng sẽ chính thức có tên trong danh sách thi đấu của trận đua.
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Nhập lý do từ chối chung cho <strong>{selectedIds.length}</strong> đơn đăng ký thi đấu đã chọn:
                </p>
                <textarea
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  placeholder="Ví dụ: Chiến mã chưa đủ điều kiện sức khỏe hoặc danh sách trận đua đã vượt giới hạn..."
                  className="w-full h-28 rounded-xl border border-border bg-muted p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <Button
                variant="outline"
                onClick={() => setBulkActionType(null)}
                disabled={isBulkSubmitting}
                className="rounded-full text-xs font-bold"
              >
                Hủy
              </Button>
              <Button
                onClick={
                  bulkActionType === "approve"
                    ? handleConfirmBulkApprove
                    : handleConfirmBulkReject
                }
                disabled={isBulkSubmitting}
                variant={bulkActionType === "approve" ? "default" : "destructive"}
                className={`rounded-full text-xs font-bold px-5 ${
                  bulkActionType === "approve" ? "bg-emerald-600 hover:bg-emerald-500 text-white" : ""
                }`}
              >
                {isBulkSubmitting
                  ? "Đang xử lý..."
                  : bulkActionType === "approve"
                  ? `Xác nhận duyệt ${selectedIds.length} đơn`
                  : `Xác nhận từ chối ${selectedIds.length} đơn`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Single Approve / Reject Modal */}
      {singleActionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-black uppercase text-foreground flex items-center gap-2">
                {singleActionTarget.action === "approve" ? (
                  <>
                    <CheckCircle2 className="size-5 text-emerald-500" /> Phê Duyệt Đơn Đăng Ký
                  </>
                ) : (
                  <>
                    <XCircle className="size-5 text-rose-500" /> Từ Chối Đơn Đăng Ký
                  </>
                )}
              </h3>
              <button
                onClick={() => setSingleActionTarget(null)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {singleActionTarget.action === "approve" ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-300 leading-relaxed">
                Xác nhận phê duyệt đơn đăng ký của chiến mã <strong>{singleActionTarget.horseName}</strong> tham gia trận đua?
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Nhập lý do từ chối đơn đăng ký của chiến mã <strong>{singleActionTarget.horseName}</strong>:
                </p>
                <textarea
                  value={singleReason}
                  onChange={(e) => setSingleReason(e.target.value)}
                  placeholder="Nhập lý do từ chối..."
                  className="w-full h-24 rounded-xl border border-border bg-muted p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <Button
                variant="outline"
                onClick={() => setSingleActionTarget(null)}
                disabled={isSingleSubmitting}
                className="rounded-full text-xs font-bold"
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmSingleAction}
                disabled={isSingleSubmitting}
                variant={singleActionTarget.action === "approve" ? "default" : "destructive"}
                className={`rounded-full text-xs font-bold px-5 ${
                  singleActionTarget.action === "approve" ? "bg-emerald-600 hover:bg-emerald-500 text-white" : ""
                }`}
              >
                {isSingleSubmitting ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
