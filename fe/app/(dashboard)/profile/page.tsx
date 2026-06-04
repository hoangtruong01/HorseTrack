"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

export default function ProfilePage() {
  const { user } = useAuth();

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

  return (
    <main className="space-y-8 max-w-4xl mx-auto">
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
            <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E10600] to-[#B80500] text-white shadow-[0_8px_30px_rgba(225,6,0,0.3)]">
              <User className="size-10" />
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
        </div>
      </div>
    </main>
  );
}
