"use client";

import { CalendarDays, Flag, MapPin, Sparkles, Trophy, Users, ShieldAlert, Award } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function TournamentForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Form Fields State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [registrationStartDate, setRegistrationStartDate] = useState("");
  const [registrationEndDate, setRegistrationEndDate] = useState("");
  const [maxHorses, setMaxHorses] = useState<number>(20);
  const [prizePool, setPrizePool] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên giải đấu.");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Vui lòng nhập ngày bắt đầu và ngày kết thúc giải đấu.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      toast.error("Ngày bắt đầu phải trước ngày kết thúc giải đấu.");
      return;
    }

    if (registrationStartDate && registrationEndDate) {
      const regStart = new Date(registrationStartDate);
      const regEnd = new Date(registrationEndDate);

      if (regStart >= regEnd) {
        toast.error("Ngày bắt đầu đăng ký phải trước ngày đóng đăng ký.");
        return;
      }

      if (regEnd >= start) {
        toast.error("Thời hạn đăng ký phải kết thúc trước khi giải đấu bắt đầu.");
        return;
      }
    }

    if (maxHorses < 2) {
      toast.error("Số lượng ngựa tối đa tham gia phải ít nhất là 2.");
      return;
    }

    if (prizePool < 0) {
      toast.error("Tổng giải thưởng (Prize Pool) không được âm.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name,
        description: description || undefined,
        location: location || undefined,
        startDate,
        endDate,
        registrationStartDate: registrationStartDate || undefined,
        registrationEndDate: registrationEndDate || undefined,
        maxHorses,
        prizePool,
      };

      const res = await fetch("/api/admin/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Đã xảy ra lỗi khi tạo giải đấu.");
      }

      toast.success(`Giải đấu "${name}" đã được tạo thành công!`);
      
      // Redirect back to Admin dashboard
      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Tạo giải đấu thất bại. Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5 shadow-[0_24px_64px_rgba(0,0,0,0.48)] sm:p-6 lg:p-8"
    >
      {/* Decorative Gradients */}
      <div className="absolute inset-0 -z-10 dark:bg-[linear-gradient(135deg,rgba(225,6,0,0.12),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(6,126,106,0.1),transparent_30rem)] bg-card" />
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b dark:border-white/10 border-border pb-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary flex items-center gap-1.5">
            <Trophy className="size-4 animate-pulse" /> Tournament Management Deck
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight dark:text-white text-foreground sm:text-3xl">
            Tạo giải đấu mới
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Thiết lập bình chứa giải đấu để tổ chức các trận đua ngựa kịch tính sắp tới.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin")}
            disabled={isLoading}
            className="rounded-full dark:border-white/10 border-border dark:text-white text-foreground bg-transparent hover:dark:bg-white/5 bg-muted/50"
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="rounded-full font-black uppercase tracking-wider text-white bg-primary hover:bg-[#B80500] shadow-[0_4px_16px_rgba(225,6,0,0.35)]"
          >
            {isLoading ? "Đang xử lý..." : "Lưu giải đấu"}
          </Button>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {/* Row 1: Tên & Địa điểm */}
        <div className="grid gap-6 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold dark:text-white text-foreground">
            <span className="inline-flex items-center gap-2">
              <Flag className="size-4 text-primary" />
              Tên giải đấu <span className="text-primary">*</span>
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              className="h-12 w-full rounded-xl border dark:border-white/10 border-border dark:bg-black/35 bg-muted/20 px-4 text-sm dark:text-white text-foreground outline-none transition placeholder:dark:text-white/20 text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Ví dụ: Spring Velocity Cup 2026"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold dark:text-white text-foreground">
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              Địa điểm tổ chức
            </span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isLoading}
              className="h-12 w-full rounded-xl border dark:border-white/10 border-border dark:bg-black/35 bg-muted/20 px-4 text-sm dark:text-white text-foreground outline-none transition placeholder:dark:text-white/20 text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Ví dụ: Trường đua Phú Thọ, TPHCM"
            />
          </label>
        </div>

        {/* Row 2: Thời gian giải đấu */}
        <div className="grid gap-6 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold dark:text-white text-foreground">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              Ngày bắt đầu giải đấu <span className="text-primary">*</span>
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              disabled={isLoading}
              className="h-12 w-full rounded-xl border dark:border-white/10 border-border dark:bg-black/35 bg-muted/20 px-4 text-sm dark:text-white text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold dark:text-white text-foreground">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              Ngày kết thúc giải đấu <span className="text-primary">*</span>
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              disabled={isLoading}
              className="h-12 w-full rounded-xl border dark:border-white/10 border-border dark:bg-black/35 bg-muted/20 px-4 text-sm dark:text-white text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
            />
          </label>
        </div>

        {/* Section divider */}
        <div className="border-t dark:border-white/5 border-border pt-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Sparkles className="size-3.5 text-primary" /> Thiết lập giai đoạn đăng ký & Thông số phụ
          </h3>
        </div>

        {/* Row 3: Thời gian mở/đóng đăng ký */}
        <div className="grid gap-6 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold dark:text-white text-foreground">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4 text-teal-400" />
              Ngày bắt đầu nhận đăng ký
            </span>
            <input
              type="date"
              value={registrationStartDate}
              onChange={(e) => setRegistrationStartDate(e.target.value)}
              disabled={isLoading}
              className="h-12 w-full rounded-xl border dark:border-white/10 border-border dark:bg-black/35 bg-muted/20 px-4 text-sm dark:text-white text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold dark:text-white text-foreground">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4 text-teal-400" />
              Ngày đóng cổng đăng ký
            </span>
            <input
              type="date"
              value={registrationEndDate}
              onChange={(e) => setRegistrationEndDate(e.target.value)}
              disabled={isLoading}
              className="h-12 w-full rounded-xl border dark:border-white/10 border-border dark:bg-black/35 bg-muted/20 px-4 text-sm dark:text-white text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
            />
          </label>
        </div>

        {/* Row 4: Sức chứa & Giải thưởng */}
        <div className="grid gap-6 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold dark:text-white text-foreground">
            <span className="inline-flex items-center gap-2">
              <Users className="size-4 text-primary" />
              Số ngựa tối đa tham gia giải
            </span>
            <input
              type="number"
              min={2}
              value={maxHorses}
              onChange={(e) => setMaxHorses(parseInt(e.target.value) || 0)}
              disabled={isLoading}
              className="h-12 w-full rounded-xl border dark:border-white/10 border-border dark:bg-black/35 bg-muted/20 px-4 font-mono text-sm dark:text-white text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Mặc định: 20"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold dark:text-white text-foreground">
            <span className="inline-flex items-center gap-2">
              <Award className="size-4 text-primary" />
              Tổng giải thưởng (Prize Pool - Points)
            </span>
            <input
              type="number"
              min={0}
              value={prizePool}
              onChange={(e) => setPrizePool(parseInt(e.target.value) || 0)}
              disabled={isLoading}
              className="h-12 w-full rounded-xl border dark:border-white/10 border-border dark:bg-black/35 bg-muted/20 px-4 font-mono text-sm dark:text-white text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Mặc định: 0"
            />
          </label>
        </div>

        {/* Row 5: Mô tả giải đấu */}
        <label className="grid gap-2 text-sm font-bold dark:text-white text-foreground">
          <span>Mô tả giải đấu</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            rows={4}
            className="w-full rounded-xl border dark:border-white/10 border-border dark:bg-black/35 bg-muted/20 p-4 text-sm dark:text-white text-foreground outline-none transition placeholder:dark:text-white/20 text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y"
            placeholder="Mô tả tóm tắt về thể lệ giải đấu, giải thưởng hoặc thông tin ban tổ chức..."
          />
        </label>

        {/* Information box */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground flex gap-3 items-start">
          <ShieldAlert className="size-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-bold dark:text-white text-foreground uppercase tracking-wider text-xs">Ràng buộc hệ thống (Scope Guard)</p>
            <p className="mt-1 text-xs">
              Mặc định khi giải đấu được tạo thành công, trạng thái ban đầu sẽ là <span className="font-bold dark:text-white text-foreground">DRAFT</span>. 
              Bạn có thể cập nhật trạng thái sang <span className="font-bold text-teal-400">OPEN REGISTRATION</span> trong trang chi tiết để các chủ ngựa có thể đăng ký tham gia.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
