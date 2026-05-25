import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.05] bg-[#111118]/85 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.62)] sm:p-8 backdrop-blur-xl">
      {/* Glowing F1 Red neon top border line */}
      <div className="absolute inset-x-12 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#E10600] to-transparent shadow-[0_0_15px_rgba(225,6,0,0.8)]" />
      
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase text-white tracking-tight">
            Sign in to Race Control
          </h2>
          <p className="text-sm font-semibold text-white/40">
            Access your account and manage races like a pro.
          </p>
        </div>
        
        <LoginForm />
      </div>
    </section>
  );
}
