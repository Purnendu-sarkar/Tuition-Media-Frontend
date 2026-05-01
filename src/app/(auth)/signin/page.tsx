import { AuthShell } from "@/components/auth/auth-shell";
import { SigninForm } from "@/components/auth/signin-form";
import { isGoogleEnabled } from "@/lib/server-env";

export default function SignInPage() {
  return (
    <AuthShell
      badge="Welcome back"
      title="Continue with your email account or Google login."
      description="Credentials login is fully wired. Google login will appear automatically once provider keys are added."
    >
      <SigninForm allowGoogle={isGoogleEnabled} />
    </AuthShell>
  );
}
