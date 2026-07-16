"use client";

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
import {
  racesApi,
  tournamentsApi,
  type TournamentItem,
} from "@/lib/api-client";
import {
  CalendarClock,
  Flag,
  Loader2,
  Milestone,
  Trophy,
  Upload,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  const lapCount = 1;
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [prize, setPrize] = useState(0);
  const [minWeightKg, setMinWeightKg] = useState("");
  const [maxWeightKg, setMaxWeightKg] = useState("");
  const [description, setDescription] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const [existingRaces, setExistingRaces] = useState<{ prize?: number }[]>([]);
  const [loadingRaces, setLoadingRaces] = useState(false);

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

  useEffect(() => {
    if (!tournamentId) {
      setExistingRaces([]);
      return;
    }
    async function loadRaces() {
      setLoadingRaces(true);
      try {
        const res = await racesApi.listByTournament(tournamentId, {
          limit: 100,
        });
        setExistingRaces(res.data || []);
      } catch (err) {
        console.error("Failed to load existing races:", err);
      } finally {
        setLoadingRaces(false);
      }
    }
    void loadRaces();
  }, [tournamentId]);

  const selectedTournament = tournaments.find((t) => t._id === tournamentId);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Tải lên ảnh thất bại.");
      }

      setImageUrl(resData.url);
      toast.success("Tải ảnh lên thành công!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi tải ảnh lên.");
      setImagePreview("");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: check if image is still uploading
    if (uploading) {
      toast.error("Vui lòng chờ ảnh tải lên xong trước khi lưu.");
      return;
    }

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
      const tStart = selectedTournament.startDate
        ? new Date(selectedTournament.startDate)
        : null;
      const tEnd = selectedTournament.endDate
        ? new Date(selectedTournament.endDate)
        : null;

      if (tStart && tEnd) {
        const startLimit = new Date(tStart.getTime() - 12 * 60 * 60 * 1000);
        const endLimit = new Date(tEnd.getTime() + 36 * 60 * 60 * 1000);

        if (raceStart < startLimit) {
          toast.error(
            `Thời gian xuất phát vòng đua nằm trước ngày bắt đầu giải đấu! (Cho phép tối đa từ ${startLimit.toLocaleString("vi-VN")})`,
          );
          return;
        }
        if (raceStart > endLimit) {
          toast.error(
            `Thời gian xuất phát vòng đua nằm sau ngày kết thúc giải đấu! (Cho phép tối đa đến ${endLimit.toLocaleString("vi-VN")})`,
          );
          return;
        }
      }

      const totalPrizePool =
        selectedTournament.prizePool || selectedTournament.prize || 0;
      const usedPrize = existingRaces.reduce(
        (sum, r) => sum + (r.prize || 0),
        0,
      );
      if (usedPrize + prize > totalPrizePool) {
        toast.error(
          `Tổng giải thưởng các vòng đua (${(usedPrize + prize).toLocaleString()} pts) vượt quá quỹ thưởng của giải đấu chính (${totalPrizePool.toLocaleString()} pts). Còn lại khả dụng: ${(totalPrizePool - usedPrize).toLocaleString()} pts.`,
        );
        return;
      }
    }

    const minW = minWeightKg.trim() === "" ? undefined : Number(minWeightKg);
    const maxW = maxWeightKg.trim() === "" ? undefined : Number(maxWeightKg);
    if (minW !== undefined && maxW !== undefined && minW > maxW) {
      toast.error("Cân nặng tối thiểu không được lớn hơn cân nặng tối đa.");
      return;
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
        minWeightKg: minW,
        maxWeightKg: maxW,
        imageUrl: imageUrl || undefined,
      });
      toast.success(`Đã tạo trận đua "${name}" thành công!`);
      router.push(
        presetTournamentId
          ? `/admin/tournaments/${presetTournamentId}`
          : "/admin/races",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Tạo trận đua thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPrizePool = selectedTournament
    ? selectedTournament.prizePool || selectedTournament.prize || 0
    : 0;
  const usedPrize = existingRaces.reduce((sum, r) => sum + (r.prize || 0), 0);
  const remainingPrize = totalPrizePool - usedPrize;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-5 shadow-lg sm:p-6 space-y-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Race Setup
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-foreground">
            Tạo Trận Đua Mới
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Điền đầy đủ thông tin để khởi tạo lịch trình vòng đua thuộc một giải
            đấu chính.
          </p>
        </div>
        <Button
          type="submit"
          disabled={submitting || uploading}
          className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-foreground font-bold uppercase tracking-wider text-xs h-10 px-5"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin mr-1" /> Đang xử lý...
            </>
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
            <div className="mt-1 flex flex-col gap-0.5 text-[10px] text-muted-foreground font-normal">
              <span>
                Thời gian giải đấu:{" "}
                <strong className="text-foreground">
                  {selectedTournament.startDate
                    ? new Date(selectedTournament.startDate).toLocaleDateString(
                        "vi-VN",
                      )
                    : "?"}
                </strong>{" "}
                –{" "}
                <strong className="text-foreground">
                  {selectedTournament.endDate
                    ? new Date(selectedTournament.endDate).toLocaleDateString(
                        "vi-VN",
                      )
                    : "?"}
                </strong>
              </span>
              <span>
                Quỹ thưởng giải đấu:{" "}
                <strong className="text-foreground">
                  {totalPrizePool.toLocaleString()} pts
                </strong>{" "}
                · Đã sử dụng:{" "}
                <strong className="text-foreground">
                  {usedPrize.toLocaleString()} pts
                </strong>{" "}
                · Còn lại:{" "}
                <strong className="text-teal-400 font-bold">
                  {remainingPrize.toLocaleString()} pts
                </strong>
              </span>
            </div>
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
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setDistanceMeters(0);
                e.target.value = "";
                return;
              }
              const parsed = parseInt(val, 10);
              if (isNaN(parsed)) {
                setDistanceMeters(0);
                e.target.value = "0";
              } else {
                setDistanceMeters(parsed);
                e.target.value = parsed.toString();
              }
            }}
            className="font-mono"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setMaxParticipants(0);
                e.target.value = "";
                return;
              }
              const parsed = parseInt(val, 10);
              if (isNaN(parsed)) {
                setMaxParticipants(0);
                e.target.value = "0";
              } else {
                setMaxParticipants(parsed);
                e.target.value = parsed.toString();
              }
            }}
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
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setPrize(0);
                e.target.value = "";
                return;
              }
              const parsed = parseInt(val, 10);
              if (isNaN(parsed)) {
                setPrize(0);
                e.target.value = "0";
              } else {
                setPrize(parsed);
                e.target.value = parsed.toString();
              }
            }}
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

      {/* Weight class row */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label className="inline-flex items-center gap-2">
            Cân nặng tối thiểu (kg)
          </Label>
          <Input
            type="number"
            min={0}
            value={minWeightKg}
            onChange={(e) => setMinWeightKg(e.target.value)}
            placeholder="Để trống nếu không giới hạn"
            className="font-mono"
          />
        </div>
        <div className="grid gap-2">
          <Label className="inline-flex items-center gap-2">
            Cân nặng tối đa (kg)
          </Label>
          <Input
            type="number"
            min={0}
            value={maxWeightKg}
            onChange={(e) => setMaxWeightKg(e.target.value)}
            placeholder="Để trống nếu không giới hạn"
            className="font-mono"
          />
        </div>
      </div>

      {/* Image Upload Row */}
      <div className="grid gap-2 text-sm font-bold text-foreground">
        <Label className="inline-flex items-center gap-2">
          <Upload className="size-4 text-primary" />
          Hình ảnh trận đua
        </Label>
        <div
          className={`relative border border-dashed border-border hover:border-primary/50 bg-muted/40 dark:bg-black/20 rounded-xl min-h-[160px] flex flex-col items-center justify-center p-4 transition group cursor-pointer ${uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          {imagePreview ? (
            <div className="relative w-full h-[140px] rounded-lg overflow-hidden">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition">
                <span className="text-foreground text-xs font-black uppercase bg-[#E10600] px-3 py-1.5 rounded-md">
                  Thay đổi ảnh
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              {uploading ? (
                <Loader2 className="size-8 text-primary mx-auto animate-spin" />
              ) : (
                <Upload className="size-8 text-muted-foreground/40 mx-auto group-hover:text-primary transition" />
              )}
              <p className="text-xs font-bold text-foreground">
                {uploading ? "Đang tải lên..." : "Tải lên hình ảnh trận đua"}
              </p>
              <p className="text-[10px] text-muted-foreground/50">
                Cho phép định dạng PNG, JPG, WEBP tối đa 5MB
              </p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploading}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </form>
  );
}
