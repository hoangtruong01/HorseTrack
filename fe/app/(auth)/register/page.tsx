import { AuthCard } from "@/features/auth/components/auth-card";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <AuthCard
      eyebrow="Register"
      title="Claim your grid slot"
      description="Create a mock profile request, select the intended role, and preview where each cockpit enters the HorseTrack MVP."
      footerLabel="Already have a demo profile?"
      footerHref="/login"
      footerCta="Login"
    >
      <RegisterForm />
    </AuthCard>
  );
}
