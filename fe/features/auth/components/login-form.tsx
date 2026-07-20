"use client";

import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Compass,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Tv,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const fieldClass =
  "h-11 w-full rounded-xl border border-border bg-input pl-10 pr-10 text-sm text-foreground placeholder:text-foreground/30 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60";
const labelClass =
  "text-xs font-black uppercase tracking-[0.16em] text-foreground/55";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const [email, setEmail] = useState("owner@horsetrack.local");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState<string>("owner");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      // Điều hướng vào cockpit phù hợp đầu tiên
      let targetRole = user.roles.includes(selectedDemoRole)
        ? selectedDemoRole
        : user.roles[0] || "spectator";

      if (targetRole === "counter_staff") {
        targetRole = "counter-staff";
      }

      toast.success(t("auth.loginForm.loginSuccess"), {
        description: t("auth.loginForm.loginSuccessDescription", {
          userName: user.fullName,
        }),
      });
      router.push(`/${targetRole}`);
    } catch (err) {
      const defaultErr = t("auth.loginForm.loginError");
      const errMsg = (err as Error).message || defaultErr;
      setErrorMsg(errMsg);
      toast.error(
        defaultErr,
        errMsg !== defaultErr ? { description: errMsg } : undefined,
      );
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
            <p className="text-xs font-black uppercase text-primary tracking-[0.1em]">
              Lỗi truy cập
            </p>
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
              onClick={() =>
                handleSelectDemo("admin", "admin@horsetrack.local")
              }
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border p-2 transition-all duration-200",
                selectedDemoRole === "admin"
                  ? "border-primary bg-primary/8 text-primary shadow-[0_0_10px_rgba(225,6,0,0.15)]"
                  : "border-border bg-secondary/30 text-foreground/40 hover:border-primary/20 hover:text-foreground/70",
              )}
            >
              <CalendarDays className="size-4 shrink-0" />
              <span className="text-[8px] font-black uppercase tracking-wider leading-none">
                Admin
              </span>
            </button>

            {/* Owner Demo Button */}
            <button
              type="button"
              onClick={() =>
                handleSelectDemo("owner", "owner@horsetrack.local")
              }
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border p-2 transition-all duration-200",
                selectedDemoRole === "owner"
                  ? "border-primary bg-primary/8 text-primary shadow-[0_0_10px_rgba(225,6,0,0.15)]"
                  : "border-border bg-secondary/30 text-foreground/40 hover:border-primary/20 hover:text-foreground/70",
              )}
            >
              <Compass className="size-4 shrink-0" />
              <span className="text-[8px] font-black uppercase tracking-wide leading-none text-center">
                Owner
              </span>
            </button>

            {/* Jockey Demo Button */}
            <button
              type="button"
              onClick={() =>
                handleSelectDemo("jockey", "jockey@horsetrack.local")
              }
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border p-2 transition-all duration-200",
                selectedDemoRole === "jockey"
                  ? "border-primary bg-primary/8 text-primary shadow-[0_0_10px_rgba(225,6,0,0.15)]"
                  : "border-border bg-secondary/30 text-foreground/40 hover:border-primary/20 hover:text-foreground/70",
              )}
            >
              <User className="size-4 shrink-0" />
              <span className="text-[8px] font-black uppercase tracking-wide leading-none">
                Jockey
              </span>
            </button>

            {/* Referee Demo Button */}
            <button
              type="button"
              onClick={() =>
                handleSelectDemo("referee", "referee@horsetrack.local")
              }
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border p-2 transition-all duration-200",
                selectedDemoRole === "referee"
                  ? "border-primary bg-primary/8 text-primary shadow-[0_0_10px_rgba(225,6,0,0.15)]"
                  : "border-border bg-secondary/30 text-foreground/40 hover:border-primary/20 hover:text-foreground/70",
              )}
            >
              <ShieldCheck className="size-4 shrink-0" />
              <span className="text-[8px] font-black uppercase tracking-wide leading-none">
                Referee
              </span>
            </button>

            {/* Spectator Demo Button */}
            <button
              type="button"
              onClick={() =>
                handleSelectDemo("spectator", "spectator@horsetrack.local")
              }
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border p-2 transition-all duration-200",
                selectedDemoRole === "spectator"
                  ? "border-primary bg-primary/8 text-primary shadow-[0_0_10px_rgba(225,6,0,0.15)]"
                  : "border-border bg-secondary/30 text-foreground/40 hover:border-primary/20 hover:text-foreground/70",
              )}
            >
              <Tv className="size-4 shrink-0" />
              <span className="text-[8px] font-black uppercase tracking-wide leading-none">
                Spectator
              </span>
            </button>

            {/* Counter Staff Demo Button */}
            <button
              type="button"
              onClick={() =>
                handleSelectDemo("counter_staff", "counter@horsetrack.local")
              }
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border p-2 transition-all duration-200",
                selectedDemoRole === "counter_staff"
                  ? "border-primary bg-primary/8 text-primary shadow-[0_0_10px_rgba(225,6,0,0.15)]"
                  : "border-border bg-secondary/30 text-foreground/40 hover:border-primary/20 hover:text-foreground/70",
              )}
            >
              <Wallet className="size-4 shrink-0" />
              <span className="text-[8px] font-black uppercase tracking-wide leading-none">
                Desk
              </span>
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
