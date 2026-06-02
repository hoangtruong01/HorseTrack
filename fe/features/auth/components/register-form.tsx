"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Loader2,
  AlertTriangle,
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  MapPin,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { defaultDemoRole, rolePreviews } from "../mock-auth-data";
import type { AuthRole } from "../types";
import { toast } from "sonner";

const fieldClass =
  "h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#E10600] focus:ring-4 focus:ring-[#E10600]/15 disabled:cursor-not-allowed disabled:opacity-60";
const labelClass =
  "text-xs font-black uppercase tracking-[0.16em] text-white/55";

export function RegisterForm() {
  const { register } = useAuth();
  const [selectedRole, setSelectedRole] = useState<AuthRole>(defaultDemoRole);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const filteredRolePreviews = useMemo(
    () => rolePreviews.filter((preview) => preview.role !== "admin"),
    []
  );

  const selectedPreview = useMemo(
    () =>
      rolePreviews.find((role) => role.role === selectedRole) ??
      rolePreviews[0],
    [selectedRole],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    const data = new FormData(event.currentTarget);
    const payload = {
      fullName: String(data.get("fullName") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      address: String(data.get("address") ?? ""),
      dob: String(data.get("dob") ?? ""),
      roles: [selectedRole],
      password: String(data.get("password") ?? ""),
    };

    try {
      await register(payload);
      toast.success("Đăng ký tài khoản thành công! Đang chuyển hướng...");
      window.location.href = selectedPreview.entryPath;
    } catch (err: any) {
      const errMsg = err.message || "Đăng ký tài khoản thất bại.";
      setErrorMsg(errMsg);
      toast.error(errMsg);
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {errorMsg && (
        <div className="flex items-start gap-3 rounded-xl border border-[#E10600] bg-[#E10600]/10 p-4 shadow-[0_0_15px_rgba(225,6,0,0.15)] animate-[shake_0.4s_ease-in-out]">
          <AlertTriangle className="size-5 shrink-0 text-[#E10600] mt-0.5" />
          <div>
            <p className="text-xs font-black uppercase text-[#E10600] tracking-[0.1em]">Lỗi đăng ký</p>
            <p className="mt-1 text-sm text-[#E0DEDC] leading-5">{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-2">
          <span className={labelClass}>Họ và tên</span>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-white/30" />
            <input
              name="fullName"
              required
              autoComplete="name"
              className={fieldClass}
              placeholder="Ví dụ: Nguyễn Văn A"
            />
          </div>
        </label>

        <label className="space-y-2">
          <span className={labelClass}>Email</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-white/30" />
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className={fieldClass}
              placeholder="you@horsetrack.local"
            />
          </div>
        </label>

        <label className="space-y-2">
          <span className={labelClass}>Mật khẩu</span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-white/30" />
            <input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className={fieldClass}
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>
        </label>

        <label className="space-y-2">
          <span className={labelClass}>Số điện thoại</span>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-white/30" />
            <input
              name="phone"
              type="tel"
              className={fieldClass}
              placeholder="Ví dụ: 0912345678"
            />
          </div>
        </label>

        <label className="space-y-2">
          <span className={labelClass}>Ngày sinh</span>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-white/30" />
            <input
              name="dob"
              type="date"
              className={cn(fieldClass, "[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert")}
            />
          </div>
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className={labelClass}>Địa chỉ</span>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-white/30" />
            <input
              name="address"
              className={fieldClass}
              placeholder="Ví dụ: Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội"
            />
          </div>
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className={labelClass}>Request role</legend>
        <div className="grid grid-cols-4 gap-2">
          {filteredRolePreviews.map((preview) => {
            const Icon = preview.icon;
            const isSelected = selectedRole === preview.role;
            return (
              <button
                key={preview.role}
                type="button"
                onClick={() => setSelectedRole(preview.role)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-xl border p-2 transition-all duration-200 text-center cursor-pointer",
                  isSelected
                    ? "border-[#E10600] bg-[#E10600]/8 text-[#E10600] shadow-[0_0_10px_rgba(225,6,0,0.15)]"
                    : "border-white/[0.04] bg-white/[0.01] text-white/40 hover:border-white/10 hover:text-white/70"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="text-[9px] font-black uppercase tracking-wide leading-none">
                  {preview.role === "spectator" ? "Spectator" : preview.label.split(" ").pop()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Small Elegant Role Description Card */}
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 text-xs leading-relaxed text-white/60">
          <p className="font-black text-[#E10600] uppercase tracking-wider text-[10px]">
            {selectedPreview.eyebrow} • {selectedPreview.label}
          </p>
          <p className="mt-1 text-white/45 leading-normal font-semibold">
            {selectedPreview.description}
          </p>
        </div>
      </fieldset>

      <div className="pt-1">
        <label className="flex items-start gap-2.5 text-xs text-white/50 cursor-pointer hover:text-white/70 transition-colors">
          <input
            name="acceptPolicy"
            type="checkbox"
            required
            className="mt-0.5 size-4 shrink-0 rounded border-white/10 bg-white/[0.04] accent-[#E10600] focus:ring-offset-0 focus:ring-0"
          />
          <span className="leading-normal font-semibold">
            I understand this is a mock registration with visual-only role assignment.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#E10600] text-sm font-black uppercase tracking-[0.16em] text-white hover:bg-[#B80500] hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4.5 animate-spin" aria-hidden="true" />
            Creating mock profile...
          </>
        ) : (
          <>
            Continue as {selectedPreview.label}
            <ArrowRight className="size-4.5" aria-hidden="true" />
          </>
        )}
      </button>

      <div className="pt-2 text-center text-xs sm:text-sm text-white/55 font-semibold">
        Already staged?{" "}
        <Link
          href="/login"
          className="font-black text-[#E10600] hover:underline"
        >
          Login instead
        </Link>
      </div>
    </form>
  );
}
