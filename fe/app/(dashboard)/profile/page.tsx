"use client";

import { useRef, useState, useEffect } from "react";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  Camera,
  Loader2,
  X,
  Moon,
  Sun,
  Globe,
} from "lucide-react";

import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [localTheme, setLocalTheme] = useState<string | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    setLocalTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = localTheme === "dark" ? "light" : "dark";
    setLocalTheme(nextTheme);
    setTheme(nextTheme);
  };

  if (!user) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Vui lòng đăng nhập để xem thông tin hồ sơ.
        </p>
        <Button asChild>
          <Link href="/login">Đăng nhập</Link>
        </Button>
      </div>
    );
  }

  // Format date of birth nicely
  const formattedDob = user.dob
    ? new Date(user.dob).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "Chưa cập nhật";

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/\/(jpg|jpeg|png|webp|gif)$/)) {
      toast.error("Vui lòng chọn file hình ảnh (jpg, png, webp, gif)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file tối đa là 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Upload image
      const uploadRes = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.message || "Lỗi khi tải ảnh lên");
      }

      const imageUrl = uploadData.url;

      // Update user
      const updateRes = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: imageUrl }),
      });
      const updateData = await updateRes.json();

      if (!updateRes.ok) {
        throw new Error(updateData.message || "Lỗi khi cập nhật hồ sơ");
      }

      updateUser({ avatar: imageUrl });
      toast.success("Cập nhật ảnh đại diện thành công");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <main className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <PageHeader
          eyebrow="Tài khoản cá nhân"
          title="Thông tin hồ sơ"
          description="Quản lý và xem thông tin tài khoản của bạn trên hệ thống HorseTrack."
        />
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={`/${user.roles[0]?.toLowerCase() || "spectator"}`}>
            <ArrowLeft className="mr-2 size-4" /> Quay lại Dashboard
          </Link>
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card/80 p-8 shadow-2xl backdrop-blur-xl">
        {/* Glow accent */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 size-48 rounded-full bg-[#E10600]/10 blur-3xl" />
        <div className="absolute left-0 bottom-0 -ml-16 -mb-16 size-48 rounded-full bg-[#F8CD46]/5 blur-3xl" />

        <div className="relative z-10 space-y-8">
          {/* Avatar and main header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-white/5">
            <div className="relative group">
              <div
                onClick={() => setIsAvatarModalOpen(true)}
                className="cursor-pointer"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="size-20 rounded-full object-cover shadow-[0_8px_30px_rgba(225,6,0,0.3)] border-2 border-[#E10600]/30 transition hover:border-[#E10600]"
                  />
                ) : (
                  <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#E10600] to-[#B80500] text-white shadow-[0_8px_30px_rgba(225,6,0,0.3)] transition hover:opacity-90">
                    <User className="size-10" />
                  </div>
                )}
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-white border border-gray-200 text-zinc-700 shadow-sm transition-transform hover:scale-110 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 dark:shadow-lg"
                title="Thay đổi ảnh đại diện"
              >
                {isUploading ? (
                  <Loader2 className="size-3.5 animate-spin text-current" />
                ) : (
                  <Camera className="size-3.5 text-current" />
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="text-center sm:text-left space-y-2">
              <h2 className="text-2xl font-black uppercase text-foreground tracking-wide">
                {user.fullName}
              </h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1 rounded-full border border-[#E10600]/30 bg-[#E10600]/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-foreground"
                  >
                    <Shield className="size-3 text-[#E10600]" />
                    {role}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Trạng thái: Hoạt động
                </span>
              </div>
            </div>
          </div>

          {/* Grid fields */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Email field */}
            <div className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition">
              <div className="flex items-center gap-3 text-muted-foreground group-hover:text-[#E10600] transition">
                <Mail className="size-4.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Địa chỉ Email
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-foreground break-all">
                {user.email}
              </p>
            </div>

            {/* Phone field */}
            <div className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition">
              <div className="flex items-center gap-3 text-muted-foreground group-hover:text-[#E10600] transition">
                <Phone className="size-4.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Số điện thoại
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-foreground">
                {user.phone || "Chưa cập nhật"}
              </p>
            </div>

            {/* DOB field */}
            <div className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition">
              <div className="flex items-center gap-3 text-muted-foreground group-hover:text-[#E10600] transition">
                <Calendar className="size-4.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Ngày sinh
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-foreground">
                {formattedDob}
              </p>
            </div>

            {/* Address field */}
            <div className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition sm:col-span-2">
              <div className="flex items-center gap-3 text-muted-foreground group-hover:text-[#E10600] transition">
                <MapPin className="size-4.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Địa chỉ thường trú
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-foreground leading-relaxed">
                {user.address || "Chưa cập nhật"}
              </p>
            </div>
          </div>

          {/* Settings Section */}
          <div className="pt-8 border-t border-white/5 space-y-6">
            <h3 className="text-lg font-black uppercase tracking-wider text-foreground">
              Cài đặt hệ thống
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Language toggle */}
              <div className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition flex items-center justify-between">
                <div className="flex items-center gap-3 text-muted-foreground group-hover:text-[#E10600] transition">
                  <Globe className="size-4.5" />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Ngôn ngữ
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className={cn("text-xs font-bold transition-colors", mounted && i18n.language === "vi" ? "text-foreground" : "text-muted-foreground")}>
                    VI
                  </span>
                  <button
                    role="switch"
                    aria-checked={mounted ? i18n.language === "en" : false}
                    onClick={() => i18n.changeLanguage(i18n.language === "vi" ? "en" : "vi")}
                    className={cn(
                      "w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer relative",
                      mounted && i18n.language === "en" ? "bg-[#E10600]" : "bg-muted-foreground/30"
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                        mounted && i18n.language === "en" ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                  <span className={cn("text-xs font-bold transition-colors", mounted && i18n.language === "en" ? "text-foreground" : "text-muted-foreground")}>
                    EN
                  </span>
                </div>
              </div>

              {/* Theme toggle */}
              <div className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition flex items-center justify-between">
                <div className="flex items-center gap-3 text-muted-foreground group-hover:text-[#E10600] transition">
                  {mounted && localTheme === "dark" ? <Moon className="size-4.5" /> : <Sun className="size-4.5" />}
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Giao diện
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className={cn("text-xs font-bold transition-colors", mounted && localTheme === "light" ? "text-foreground" : "text-muted-foreground")}>
                    Sáng
                  </span>
                  <button
                    role="switch"
                    aria-checked={mounted ? localTheme === "dark" : false}
                    onClick={toggleTheme}
                    className={cn(
                      "w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer relative",
                      mounted && localTheme === "dark" ? "bg-[#E10600]" : "bg-muted-foreground/30"
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                        mounted && localTheme === "dark" ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                  <span className={cn("text-xs font-bold transition-colors", mounted && localTheme === "dark" ? "text-foreground" : "text-muted-foreground")}>
                    Tối
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Preview Modal */}
      {isAvatarModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsAvatarModalOpen(false)}
        >
          <button
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            onClick={() => setIsAvatarModalOpen(false)}
          >
            <X className="size-6" />
          </button>
          <div
            className="relative max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-auto h-auto max-w-full max-h-[90vh] object-contain"
              />
            ) : (
              <div className="flex size-64 sm:size-96 items-center justify-center bg-gradient-to-br from-[#E10600] to-[#B80500] text-white">
                <User className="size-32" />
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
