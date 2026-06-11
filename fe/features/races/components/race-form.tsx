"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarClock, Flag, Milestone, Trophy, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { racesApi, tournamentsApi, type TournamentItem } from "@/lib/api-client";
import { toast } from "sonner";

export function RaceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetTournamentId = searchParams.get("tournamentId") || "";

  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [tournamentId, setTournamentId] = useState(presetTournamentId);
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [distanceMeters, setDistanceMeters] = useState(1000);
  const [lapCount, setLapCount] = useState(1);
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [prize, setPrize] = useState(0);
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
      });
      toast.success(`Đã tạo trận đua "${name}" thành công!`);
      router.push(presetTournamentId ? `/admin/tournaments/${presetTournamentId}` : "/admin/races");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Tạo trận đua thất bại");
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
        <div className="grid gap-2">
          <Label className="inline-flex items-center gap-2">
            <Trophy className="size-4 text-primary" />
            Giải đấu chính <span className="text-primary">*</span>
          </Label>
          {loadingTournaments ? (
            <div className="h-11 rounded-lg border border-border bg-muted flex items-center px-3 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin mr-2" /> Đang tải...
            </div>
          ) : (
            <Select
              required
              value={tournamentId}
              onValueChange={setTournamentId}
              disabled={!!presetTournamentId}
            >
              <SelectTrigger className="h-11 text-sm">
                <SelectValue placeholder="-- Chọn giải đấu --" />
              </SelectTrigger>
              <SelectContent>
                {tournaments.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name} ({t.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {selectedTournament && (
            <span className="text-[10px] text-muted-foreground font-normal">
              Thời gian: {selectedTournament.startDate ? new Date(selectedTournament.startDate).toLocaleDateString("vi-VN") : "?"} – {selectedTournament.endDate ? new Date(selectedTournament.endDate).toLocaleDateString("vi-VN") : "?"} · Quỹ thưởng: {selectedTournament.prize?.toLocaleString() || 0} pts
            </span>
          )}
        </div>

        {/* Race name */}
        <div className="grid gap-2">
          <Label className="inline-flex items-center gap-2">
            <Flag className="size-4 text-primary" />
            Tên trận đua <span className="text-primary">*</span>
          </Label>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Vòng loại 100m, Bán kết 1000m..."
          />
        </div>

        {/* Start Time */}
        <div className="grid gap-2">
          <Label className="inline-flex items-center gap-2">
            <CalendarClock className="size-4 text-primary" />
            Thời gian xuất phát <span className="text-primary">*</span>
          </Label>
          <Input
            type="datetime-local"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        {/* Distance */}
        <div className="grid gap-2">
          <Label className="inline-flex items-center gap-2">
            <Milestone className="size-4 text-primary" />
            Cự ly thi đấu (mét) <span className="text-primary">*</span>
          </Label>
          <Input
            type="number"
            min={100}
            required
            value={distanceMeters}
            onChange={(e) => setDistanceMeters(parseInt(e.target.value) || 0)}
            className="font-mono"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {/* Max Participants */}
        <div className="grid gap-2">
          <Label className="inline-flex items-center gap-2">
            <Users className="size-4 text-primary" />
            Số ngựa tối đa
          </Label>
          <Input
            type="number"
            min={2}
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 8)}
            className="font-mono"
          />
        </div>

        {/* Prize */}
        <div className="grid gap-2">
          <Label>Giải thưởng (Points)</Label>
          <Input
            type="number"
            min={0}
            value={prize}
            onChange={(e) => setPrize(parseInt(e.target.value) || 0)}
            className="font-mono"
          />
        </div>

        {/* Laps */}
        <div className="grid gap-2">
          <Label>Số vòng (Laps)</Label>
          <Input
            type="number"
            min={1}
            value={lapCount}
            onChange={(e) => setLapCount(parseInt(e.target.value) || 1)}
            className="font-mono"
          />
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <Label>Mô tả ngắn</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả thêm về trận đua..."
          />
        </div>
      </div>
    </form>
  );
}
