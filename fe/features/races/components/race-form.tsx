"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarClock, Flag, MapPin, Milestone, Trophy, Loader2, Layers, CloudSun, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { racesApi, tournamentsApi, type TournamentItem } from "@/lib/api-client";
import { toast } from "sonner";

export function RaceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetTournamentId = searchParams.get("tournamentId") || "";

  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [tournamentId, setTournamentId] = useState(presetTournamentId);
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [distanceMeters, setDistanceMeters] = useState(1000);
  const [lapCount, setLapCount] = useState(1);
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [prize, setPrize] = useState(0);
  const [trackCondition, setTrackCondition] = useState("Dry turf");
  const [weatherSnapshot, setWeatherSnapshot] = useState("Sunny");
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function loadTournaments() {
      try {
        const res = await tournamentsApi.list({ limit: 100 });
        setTournaments(res.data || []);
      } catch {
        toast.error("Không thể tải danh sách giải đấu");
      } finally {
        setLoadingTournaments(false);
      }
    }
    void loadTournaments();
  }, []);

  const selectedTournament = tournaments.find((t) => t._id === tournamentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tournamentId) {
      toast.error("Vui lòng chọn giải đấu chính.");
      return;
    }
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên trận đua.");
      return;
    }
    if (!startTime) {
      toast.error("Vui lòng nhập thời gian xuất phát.");
      return;
    }

    // Date validation
    if (selectedTournament) {
      const raceStart = new Date(startTime);
      const tStartPart = typeof selectedTournament.startDate === "string" ? selectedTournament.startDate.split("T")[0] : "";
      const tEndPart = typeof selectedTournament.endDate === "string" ? selectedTournament.endDate.split("T")[0] : "";

      const localStartLimit = tStartPart ? new Date(`${tStartPart}T00:00:00`) : null;
      const localEndLimit = tEndPart ? new Date(`${tEndPart}T23:59:59.999`) : null;

      if (localStartLimit && raceStart < localStartLimit) {
        toast.error("Thời gian xuất phát vòng đua nằm trước ngày bắt đầu giải đấu!");
        return;
      }
      if (localEndLimit && raceStart > localEndLimit) {
        toast.error("Thời gian xuất phát vòng đua nằm sau ngày kết thúc giải đấu!");
        return;
      }
    }

    setSubmitting(true);
    try {
      await racesApi.create({
        tournamentId,
        name,
        description: description || undefined,
        startTime: new Date(startTime).toISOString(),
        distanceMeters,
        lapCount,
        maxParticipants,
        prize,
        trackCondition,
        weatherSnapshot,
      });
      toast.success(`Đã tạo trận đua "${name}" thành công!`);
      router.push("/admin/races");
    } catch (e: any) {
      toast.error(e.message || "Tạo trận đua thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-5 shadow-lg sm:p-6 space-y-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Race Setup</p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-foreground">
            Tạo Trận Đua Mới
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Điền đầy đủ thông tin để khởi tạo lịch trình vòng đua thuộc một giải đấu chính.
          </p>
        </div>
        <Button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-foreground font-bold uppercase tracking-wider text-xs h-10 px-5"
        >
          {submitting ? (
            <><Loader2 className="size-4 animate-spin mr-1" /> Đang xử lý...</>
          ) : (
            "Lưu trận đua"
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Tournament Selector */}
        <label className="grid gap-2 text-sm font-bold text-foreground">
          <span className="inline-flex items-center gap-2">
            <Trophy className="size-4 text-primary" />
            Giải đấu chính <span className="text-primary">*</span>
          </span>
          {loadingTournaments ? (
            <div className="h-11 rounded-lg border border-border bg-muted flex items-center px-3 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin mr-2" /> Đang tải...
            </div>
          ) : (
            <select
              required
              value={tournamentId}
              onChange={(e) => setTournamentId(e.target.value)}
              className="h-11 rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              <option value="" className="bg-popover">-- Chọn giải đấu --</option>
              {tournaments.map((t) => (
                <option key={t._id} value={t._id} className="bg-popover">
                  {t.name} ({t.status})
                </option>
              ))}
            </select>
          )}
          {selectedTournament && (
            <span className="text-[10px] text-muted-foreground font-normal">
              Thời gian: {selectedTournament.startDate ? new Date(selectedTournament.startDate).toLocaleDateString("vi-VN") : "?"} - {selectedTournament.endDate ? new Date(selectedTournament.endDate).toLocaleDateString("vi-VN") : "?"} · Quỹ thưởng: {selectedTournament.prize?.toLocaleString() || 0} pts
            </span>
          )}
        </label>

        {/* Race name */}
        <label className="grid gap-2 text-sm font-bold text-foreground">
          <span className="inline-flex items-center gap-2">
            <Flag className="size-4 text-primary" />
            Tên trận đua <span className="text-primary">*</span>
          </span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="Ví dụ: Vòng loại 100m, Bán kết 1000m..."
          />
        </label>

        {/* Start Time */}
        <label className="grid gap-2 text-sm font-bold text-foreground">
          <span className="inline-flex items-center gap-2">
            <CalendarClock className="size-4 text-primary" />
            Thời gian xuất phát <span className="text-primary">*</span>
          </span>
          <input
            type="datetime-local"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="h-11 rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 cursor-pointer"
          />
        </label>

        {/* Distance */}
        <label className="grid gap-2 text-sm font-bold text-foreground">
          <span className="inline-flex items-center gap-2">
            <Milestone className="size-4 text-primary" />
            Cự ly thi đấu (mét) <span className="text-primary">*</span>
          </span>
          <input
            type="number"
            min={100}
            required
            value={distanceMeters}
            onChange={(e) => setDistanceMeters(parseInt(e.target.value) || 0)}
            className="h-11 rounded-lg border border-border bg-input px-3 text-sm text-foreground font-mono outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Surface */}
        <label className="grid gap-2 text-sm font-bold text-foreground">
          <span className="inline-flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            Mặt sân
          </span>
          <select
            value={trackCondition}
            onChange={(e) => setTrackCondition(e.target.value)}
            className="h-11 rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            <option value="Dry turf" className="bg-popover">Dry turf (Cỏ khô)</option>
            <option value="Wet turf" className="bg-popover">Wet turf (Cỏ ướt)</option>
            <option value="Muddy" className="bg-popover">Muddy (Bùn đất)</option>
            <option value="Synthetic" className="bg-popover">Synthetic (Nhân tạo)</option>
          </select>
        </label>

        {/* Weather */}
        <label className="grid gap-2 text-sm font-bold text-foreground">
          <span className="inline-flex items-center gap-2">
            <CloudSun className="size-4 text-primary" />
            Thời tiết
          </span>
          <select
            value={weatherSnapshot}
            onChange={(e) => setWeatherSnapshot(e.target.value)}
            className="h-11 rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            <option value="Sunny" className="bg-popover">Sunny (Nắng)</option>
            <option value="Cloudy" className="bg-popover">Cloudy (Mây)</option>
            <option value="Rainy" className="bg-popover">Rainy (Mưa)</option>
            <option value="Windy" className="bg-popover">Windy (Gió)</option>
          </select>
        </label>

        {/* Max Participants */}
        <label className="grid gap-2 text-sm font-bold text-foreground">
          <span className="inline-flex items-center gap-2">
            <Users className="size-4 text-primary" />
            Số ngựa tối đa
          </span>
          <input
            type="number"
            min={2}
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 8)}
            className="h-11 rounded-lg border border-border bg-input px-3 text-sm text-foreground font-mono outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Prize */}
        <label className="grid gap-2 text-sm font-bold text-foreground">
          Giải thưởng (Points)
          <input
            type="number"
            min={0}
            value={prize}
            onChange={(e) => setPrize(parseInt(e.target.value) || 0)}
            className="h-11 rounded-lg border border-border bg-input px-3 text-sm text-foreground font-mono outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </label>

        {/* Laps */}
        <label className="grid gap-2 text-sm font-bold text-foreground">
          Số vòng (Laps)
          <input
            type="number"
            min={1}
            value={lapCount}
            onChange={(e) => setLapCount(parseInt(e.target.value) || 1)}
            className="h-11 rounded-lg border border-border bg-input px-3 text-sm text-foreground font-mono outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </label>

        {/* Description */}
        <label className="grid gap-2 text-sm font-bold text-foreground">
          Mô tả ngắn
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-11 rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="Mô tả thêm về trận đua..."
          />
        </label>
      </div>
    </form>
  );
}