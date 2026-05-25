"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Mail, ShieldCheck, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

import { defaultDemoRole, rolePreviews } from "../mock-auth-data";
import type { AuthRole } from "../types";
import { RolePreviewCard } from "./role-preview-card";

const fieldClass =
  "h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#E10600] focus:ring-4 focus:ring-[#E10600]/15 disabled:cursor-not-allowed disabled:opacity-60";
const labelClass =
  "text-xs font-black uppercase tracking-[0.18em] text-white/72";

export function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  const [selectedRole, setSelectedRole] = useState<AuthRole>(defaultDemoRole);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const selectedPreview = useMemo(
    () =>
      rolePreviews.find((role) => role.role === selectedRole) ??
      rolePreviews[0],
    [selectedRole],
  );

  // Google OAuth credential callback
  const handleGoogleCredentialResponse = async (response: any) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const user = await loginWithGoogle(response.credential);
      const firstRole = user.roles[0] || "spectator";
      window.location.href = `/${firstRole}`;
    } catch (err: any) {
      setErrorMsg(err.message || "Xác thực tài khoản Google thất bại.");
      setIsSubmitting(false);
    }
  };

  // Tải Google SDK tự động
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if ((window as any).google) {
        (window as any).google.accounts.id.initialize({
          // Client ID của dự án Google Cloud Platform
          client_id: "721959779344-gdt1a37c0eb8999p2g1g5a1g12g12g12.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { 
            theme: "dark", 
            size: "large", 
            width: "380", 
            shape: "pill",
            text: "signin_with" 
          }
        );
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    try {
      const user = await login(email, password);
      // Tìm cockpit (vai trò) phù hợp đầu tiên
      const targetRole = user.roles.includes(selectedRole) 
        ? selectedRole 
        : (user.roles[0] || "spectator");
      
      window.location.href = `/${targetRole}`;
    } catch (err: any) {
      // Hiển thị lỗi từ backend
      setErrorMsg(err.message || "Thông tin đăng nhập không chính xác hoặc kết nối thất bại.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {errorMsg && (
        <div className="flex items-start gap-3 rounded-xl border border-[#E10600] bg-[#E10600]/10 p-4 shadow-[0_0_15px_rgba(225,6,0,0.15)] animate-[shake_0.4s_ease-in-out]">
          <AlertTriangle className="size-5 shrink-0 text-[#E10600] mt-0.5" />
          <div>
            <p className="text-xs font-black uppercase text-[#E10600] tracking-[0.1em]">Lỗi truy cập</p>
            <p className="mt-1 text-sm text-[#E0DEDC] leading-5">{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-2">
          <span className={labelClass}>Email</span>
          <span className="relative block">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/38" />
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue="owner.demo@horsetrack.local"
              className={cn(fieldClass, "pl-10")}
              placeholder="you@stable.com"
            />
          </span>
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className={labelClass}>Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            defaultValue="demo123"
            className={fieldClass}
            placeholder="••••••••"
          />
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className={labelClass}>Choose demo cockpit</legend>
        <div className="grid gap-3 md:grid-cols-2">
          {rolePreviews.map((role) => (
            <button
              key={role.role}
              type="button"
              className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              onClick={() => setSelectedRole(role.role)}
            >
              <RolePreviewCard
                role={role}
                selectedRole={selectedRole}
                compact
              />
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-3 text-sm text-white/68">
          <input
            name="rememberDemo"
            type="checkbox"
            className="size-4 rounded border-white/20 bg-white/10 accent-[#E10600] focus:ring-primary/40"
          />
          Remember cockpit selection
        </label>
        <Link
          href="/register"
          className="text-sm font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          Need account?
        </Link>
      </div>

      <div className="space-y-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-full bg-primary text-sm font-black uppercase tracking-[0.16em] text-white hover:bg-[#B80500] hover:scale-[1.01] transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Verifying credentials...
            </>
          ) : (
            <>
              Enter {selectedPreview.label} cockpit
              <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </Button>

        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <span className="relative bg-[#111118] px-4 text-xs font-black uppercase tracking-[0.18em] text-white/35">
            Hoặc đăng nhập với
          </span>
        </div>

        <div className="flex justify-center w-full">
          <div id="google-signin-btn" className="w-full flex justify-center min-h-[44px]"></div>
        </div>
      </div>

      <p className="flex items-start gap-2 text-xs leading-5 text-white/48">
        <ShieldCheck
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden="true"
        />
        Hệ thống hỗ trợ Đăng nhập chuẩn mã hóa JWT đính kèm Secure HTTPOnly Cookie.
      </p>
    </form>
  );
}
