"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInSchema, type SignInFormValues } from "@/lib/auth-schemas";

interface SigninFormProps {
  allowGoogle: boolean;
}

export function SigninForm({ allowGoogle }: SigninFormProps) {
  const router = useRouter();
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const submitForm = handleSubmit((values) => {
    startTransition(() => {
      void (async () => {
        setSubmissionError(null);

        const result = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (result?.error) {
          setSubmissionError("Invalid email or password.");
          return;
        }

        router.replace("/dashboard");
        router.refresh();
      })();
    });
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-[var(--font-space-grotesk)] text-3xl font-semibold text-foreground">Sign in to continue</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Use your registered email and password. Google sign in can be switched on from environment variables.
        </p>
      </div>

      <form className="space-y-5" onSubmit={submitForm}>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="signin-email">
            Email address
          </label>
          <Input id="signin-email" type="email" placeholder="afiya@example.com" {...register("email")} />
          {errors.email ? <p className="text-sm text-danger">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="signin-password">
            Password
          </label>
          <Input id="signin-password" type="password" placeholder="Enter your password" {...register("password")} />
          {errors.password ? <p className="text-sm text-danger">{errors.password.message}</p> : null}
        </div>

        {submissionError ? (
          <div className="flex items-start gap-3 rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{submissionError}</span>
          </div>
        ) : null}

        <Button className="w-full" size="lg" type="submit" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign in"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      {allowGoogle ? (
        <Button
          className="w-full"
          type="button"
          variant="outline"
          onClick={() => {
            void signIn("google", { callbackUrl: "/dashboard" });
          }}
        >
          Continue with Google
        </Button>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Need an account?{" "}
        <Link href="/signup" className="font-semibold text-primary transition hover:text-primary-strong">
          Create one now
        </Link>
      </p>
    </div>
  );
}
