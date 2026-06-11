"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CalendarDays,
  Compass,
  User,
  ShieldCheck,
  Tv,
  Wallet,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { sileo } from "sileo";

const toast = {
  success: (msg: string) => sileo.success({ title: msg, duration: 1200 }),
  error: (msg: string) => sileo.error({ title: msg, duration: 1200 }),
};

const fieldClass =
  "h-11 w-full rounded-xl border border-border bg-input pl-10 pr-10 text-sm text-foreground placeholder:text-foreground/30 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60";
const labelClass =
  "text-xs font-black uppercase tracking-[0.16em] text-foreground/55";

export function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const [email, setEmail] = useState("owner@horsetrack.local");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState<string>("owner");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleCredentialResponse = async (response: unknown) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const user = await loginWithGoogle((response as { credential: string }).credential);
      let firstRole = user.roles[0] || "spectator";
      if (firstRole === "counter_staff") {
        firstRole = "counter-staff";
      }
      toast.success(t("auth.loginSuccess"));
      router.push(`/${firstRole}`);
    } catch (err) {
      const errMsg = (err as Error).message || t("auth.googleError");
      setErrorMsg(errMsg);
      toast.error(errMsg);
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
      type GoogleSDK = { accounts: { id: { initialize: (c: object) => void; renderButton: (el: HTMLElement | null, c: object) => void } } };
      const g = (window as Window & { google?: GoogleSDK }).google;
      if (g) {
        g.accounts.id.initialize({
          client_id: "721959779344-gdt1a37c0eb8999p2g1g5a1g12g12g12.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        g.accounts.id.renderButton(
          document.getElementById("google-native-btn") as HTMLElement | null,
          {
            theme: "dark",
            size: "large",
            width: "380",
            shape: "pill",
            text: "continue_with"
          }
        );
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      // Điều hướng vào cockpit phù hợp đầu tiên
      let targetRole = user.roles.includes(selectedDemoRole)
        ? selectedDemoRole
        : (user.roles[0] || "spectator");

      if (targetRole === "counter_staff") {
        targetRole = "counter-staff";
      }

      toast.success(t("auth.loginSuccess"));
      router.push(`/${targetRole}`);
    } catch (err) {
      const errMsg = (err as Error).message || t("auth.loginError");
      setErrorMsg(errMsg);
      toast.error(errMsg);
      setIsSubmitting(false);
    }
  }

  // Tiện ích click demo shortcut tự động điền tài khoản
  const handleSelectDemo = (role: string, roleEmail: string) => {
    setSelectedDemoRole(role);
    setEmail(roleEmail);
    setPassword("password123");
    setErrorMsg("");
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {errorMsg && (
        <div className="flex items-start gap-3 rounded-xl border border-primary bg-primary/10 p-4 shadow-[0_0_15px_rgba(225,6,0,0.15)] animate-[shake_0.4s_ease-in-out]">
          <AlertTriangle className="size-5 shrink-0 text-primary mt-0.5" />
          <div>
            <p className="text-xs font-black uppercase text-primary tracking-[0.1em]">Lỗi truy cập</p>
            <p className="mt-1 text-sm text-foreground leading-5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Inputs fields */}
      <div className="space-y-4">

        {/* Email Address */}
        <div className="space-y-2">
          <label className={labelClass}>Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-foreground/30" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              placeholder="Enter your email"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className={labelClass}>Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-foreground/30" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="size-4.5" />
              ) : (
                <Eye className="size-4.5" />
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Remember me & Forgot Password */}
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <label className="flex items-center gap-2 text-foreground/60 font-semibold cursor-pointer">
          <input
            type="checkbox"
            defaultChecked
            className="size-4 rounded border-border bg-input accent-primary focus:ring-offset-0 focus:ring-0"
          />
          Remember me
        </label>
        <Link
          href="/forgot-password"
          className="font-bold text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {/* Main Submit Button */}
      <div className="space-y-4 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-black uppercase tracking-[0.16em] text-primary-foreground hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4.5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <ArrowRight className="size-4.5" />
              Sign in
            </>
          )}
        </button>

        {/* Separator */}
        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <span className="relative bg-background px-4 text-xs font-black uppercase tracking-[0.18em] text-foreground/25">
            OR
          </span>
        </div>

        {/* Google Continue Button wrapper */}
        <div className="relative flex justify-center w-full min-h-[44px]">
          {/* Custom F1 styled Google button */}
          <div className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-border bg-secondary/50 text-sm font-bold text-foreground hover:bg-secondary transition-all pointer-events-none">
            <svg className="size-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </div>
          {/* Invisible Google iframe wrapper overlayed securely on top of custom button */}
          <div id="google-native-btn" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer overflow-hidden z-10 [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:cursor-pointer"></div>
        </div>

        {/* Try demo account section */}
        <div className="space-y-3 pt-3">
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border"></div>
            <span className="absolute bg-background px-3 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
              Try demo account
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {/* Admin Demo Button */}
            <button
              type="button"
              onClick={() => handleSelectDemo("admin", "admin@horsetrack.local")}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border p-2 transition-all duration-200",
                selectedDemoRole === "admin"
                  ? "border-primary bg-primary/8 text-primary shadow-[0_0_10px_rgba(225,6,0,0.15)]"
                  : "border-border bg-secondary/30 text-foreground/40 hover:border-primary/20 hover:text-foreground/70"
              )}
            >
              <CalendarDays className="size-4 shrink-0" />
              <span className="text-[8px] font-black uppercase tracking-wider leading-none">Admin</span>
            </button>

            {/* Owner Demo Button */}
            <button
              type="button"
              onClick={() => handleSelectDemo("owner", "owner@horsetrack.local")}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border p-2 transition-all duration-200",
                selectedDemoRole === "owner"
                  ? "border-primary bg-primary/8 text-primary shadow-[0_0_10px_rgba(225,6,0,0.15)]"
                  : "border-border bg-secondary/30 text-foreground/40 hover:border-primary/20 hover:text-foreground/70"
              )}
            >
              <Compass className="size-4 shrink-0" />
              <span className="text-[8px] font-black uppercase tracking-wide leading-none text-center">Owner</span>
            </button>

            {/* Jockey Demo Button */}
            <button
              type="button"
              onClick={() => handleSelectDemo("jockey", "jockey@horsetrack.local")}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border p-2 transition-all duration-200",
                selectedDemoRole === "jockey"
                  ? "border-primary bg-primary/8 text-primary shadow-[0_0_10px_rgba(225,6,0,0.15)]"
                  : "border-border bg-secondary/30 text-foreground/40 hover:border-primary/20 hover:text-foreground/70"
              )}
            >
              <User className="size-4 shrink-0" />
              <span className="text-[8px] font-black uppercase tracking-wide leading-none">Jockey</span>
            </button>

            {/* Referee Demo Button */}
            <button
              type="button"
              onClick={() => handleSelectDemo("referee", "referee@horsetrack.local")}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border p-2 transition-all duration-200",
                selectedDemoRole === "referee"
                  ? "border-primary bg-primary/8 text-primary shadow-[0_0_10px_rgba(225,6,0,0.15)]"
                  : "border-border bg-secondary/30 text-foreground/40 hover:border-primary/20 hover:text-foreground/70"
              )}
            >
              <ShieldCheck className="size-4 shrink-0" />
              <span className="text-[8px] font-black uppercase tracking-wide leading-none">Referee</span>
            </button>

            {/* Spectator Demo Button */}
            <button
              type="button"
              onClick={() => handleSelectDemo("spectator", "spectator@horsetrack.local")}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border p-2 transition-all duration-200",
                selectedDemoRole === "spectator"
                  ? "border-primary bg-primary/8 text-primary shadow-[0_0_10px_rgba(225,6,0,0.15)]"
                  : "border-border bg-secondary/30 text-foreground/40 hover:border-primary/20 hover:text-foreground/70"
              )}
            >
              <Tv className="size-4 shrink-0" />
              <span className="text-[8px] font-black uppercase tracking-wide leading-none">Spec</span>
            </button>

            {/* Counter Staff Demo Button */}
            <button
              type="button"
              onClick={() => handleSelectDemo("counter_staff", "counter@horsetrack.local")}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border p-2 transition-all duration-200",
                selectedDemoRole === "counter_staff"
                  ? "border-primary bg-primary/8 text-primary shadow-[0_0_10px_rgba(225,6,0,0.15)]"
                  : "border-border bg-secondary/30 text-foreground/40 hover:border-primary/20 hover:text-foreground/70"
              )}
            >
              <Wallet className="size-4 shrink-0" />
              <span className="text-[8px] font-black uppercase tracking-wide leading-none">Desk</span>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2 text-center text-xs sm:text-sm text-foreground/55 font-semibold">
        New to HorseTrack?{" "}
        <Link
          href="/register"
          className="font-black text-primary hover:underline"
        >
          Create an account
        </Link>
      </div>
    </form>
  );
}
