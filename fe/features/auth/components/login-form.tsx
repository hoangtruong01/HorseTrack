"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { useTranslation } from "react-i18next";

import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const fieldClass =
  "h-11 w-full rounded-xl border border-border bg-background/70 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-[#E10600] focus:ring-4 focus:ring-[#E10600]/15 disabled:cursor-not-allowed disabled:opacity-60";
const labelClass =
  "text-xs font-black uppercase tracking-[0.16em] text-muted-foreground";

export function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState("owner@horsetrack.local");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState<string>("owner");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleCredentialResponse = async (response: any) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const user = await loginWithGoogle(response.credential);
      let firstRole = user.roles[0] || "spectator";
      if (firstRole === "counter_staff") {
        firstRole = "counter-staff";
      }
      toast.success(t("auth.loginForm.loginSuccess", { name: user.fullName }));
      window.location.href = `/${firstRole}`;
    } catch (err: any) {
      const errMsg = err.message || t("auth.loginForm.googleAuthFailed");
      setErrorMsg(errMsg);
      toast.error(errMsg);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if ((window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: "721959779344-gdt1a37c0eb8999p2g1g5a1g12g12g12.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById("google-native-btn"),
          {
            theme: "outline",
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
      let targetRole = user.roles.includes(selectedDemoRole)
        ? selectedDemoRole
        : (user.roles[0] || "spectator");

      if (targetRole === "counter_staff") {
        targetRole = "counter-staff";
      }

      toast.success(t("auth.loginForm.loginSuccess", { name: user.fullName }));
      window.location.href = `/${targetRole}`;
    } catch (err: any) {
      const errMsg = err.message || t("auth.loginForm.loginFailed");
      setErrorMsg(errMsg);
      toast.error(errMsg);
      setIsSubmitting(false);
    }
  }

  const handleSelectDemo = (role: string, roleEmail: string) => {
    setSelectedDemoRole(role);
    setEmail(roleEmail);
    setPassword("password123");
    setErrorMsg("");
  };

  const demoRoles = [
    { role: "admin", email: "admin@horsetrack.local", icon: CalendarDays },
    { role: "owner", email: "owner@horsetrack.local", icon: Compass },
    { role: "jockey", email: "jockey@horsetrack.local", icon: User },
    { role: "referee", email: "referee@horsetrack.local", icon: ShieldCheck },
    { role: "spectator", email: "spectator@horsetrack.local", icon: Tv },
    { role: "counter_staff", email: "counter@horsetrack.local", icon: Wallet },
  ] as const;

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {errorMsg && (
        <div className="flex items-start gap-3 rounded-xl border border-[#E10600] bg-[#E10600]/10 p-4 shadow-[0_0_15px_rgba(225,6,0,0.15)] animate-[shake_0.4s_ease-in-out]">
          <AlertTriangle className="size-5 shrink-0 text-[#E10600] mt-0.5" />
          <div>
            <p className="text-xs font-black uppercase text-[#E10600] tracking-[0.1em]">{t("auth.loginForm.accessError")}</p>
            <p className="mt-1 text-sm text-foreground leading-5">{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className={labelClass}>{t("auth.loginForm.emailLabel")}</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              placeholder={t("auth.loginForm.emailPlaceholder")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>{t("auth.loginForm.passwordLabel")}</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
              placeholder={t("auth.loginForm.passwordPlaceholder")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
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

      <div className="flex items-center justify-between text-xs sm:text-sm">
        <label className="flex items-center gap-2 text-muted-foreground font-semibold cursor-pointer">
          <input
            type="checkbox"
            defaultChecked
            className="size-4 rounded border-border bg-background/70 accent-[#E10600] focus:ring-offset-0 focus:ring-0"
          />
          {t("auth.loginForm.rememberMe")}
        </label>
        <Link
          href="/forgot-password"
          className="font-bold text-[#E10600] hover:underline"
        >
          {t("auth.loginForm.forgotPassword")}
        </Link>
      </div>

      <div className="space-y-4 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#E10600] text-sm font-black uppercase tracking-[0.16em] text-white hover:bg-[#B80500] hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4.5 animate-spin" />
              {t("auth.loginForm.signingIn")}
            </>
          ) : (
            <>
              <ArrowRight className="size-4.5" />
              {t("auth.loginForm.signIn")}
            </>
          )}
        </button>

        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <span className="relative bg-card px-4 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t("auth.loginForm.or")}
          </span>
        </div>

        <div className="relative flex justify-center w-full min-h-[44px]">
          <div className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card/70 text-sm font-bold text-foreground hover:bg-muted transition-all pointer-events-none">
            <svg className="size-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {t("auth.loginForm.continueWithGoogle")}
          </div>
          <div id="google-native-btn" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer overflow-hidden z-10 [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:cursor-pointer"></div>
        </div>

        <div className="space-y-3 pt-3">
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border"></div>
            <span className="absolute bg-card px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {t("auth.loginForm.tryDemoAccount")}
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {demoRoles.map(({ role, email: roleEmail, icon: Icon }) => (
              <button
                key={role}
                type="button"
                onClick={() => handleSelectDemo(role, roleEmail)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-xl border p-2 transition-all duration-200",
                  selectedDemoRole === role
                    ? "border-[#E10600] bg-[#E10600]/8 text-[#E10600] shadow-[0_0_10px_rgba(225,6,0,0.15)]"
                    : "border-border bg-card/60 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="text-[8px] font-black uppercase tracking-wider leading-none text-center">
                  {t(`roles.${role}`)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-2 text-center text-xs sm:text-sm text-muted-foreground font-semibold">
        {t("auth.loginForm.newToHorseTrack")}{" "}
        <Link
          href="/register"
          className="font-black text-[#E10600] hover:underline"
        >
          {t("auth.loginForm.createAccount")}
        </Link>
      </div>
    </form>
  );
}
