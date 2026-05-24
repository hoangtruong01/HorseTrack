import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <AuthCard
      eyebrow="Login"
      title="Enter race control"
      description="Use the demo credentials, choose a role cockpit, and continue through a mock session redirect. No API call, no token storage."
      footerLabel="New to the paddock?"
      footerHref="/register"
      footerCta="Create mock profile"
    >
      <LoginForm />
    </AuthCard>
  );
}
