import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignUpPage() {
  return (
    <AuthShell
      badge="New account"
      title="Create a trusted profile for tutoring or finding a tutor."
      description="Signup is connected to the Express API, Prisma user model, and NextAuth credentials flow."
    >
      <SignupForm />
    </AuthShell>
  );
}
