"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";

import { RoleSelector } from "@/components/auth/role-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { signUpSchema, type SignUpFormValues } from "@/lib/auth-schemas";

export function SignupForm() {
  const router = useRouter();
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "TUTOR",
    },
  });

  const submitForm = handleSubmit((values) => {
    startTransition(() => {
      void (async () => {
        setSubmissionError(null);

        if (!isOtpSent) {
           try {
             await apiClient.post("/api/v1/auth/send-otp", { email: values.email });
             setIsOtpSent(true);
           } catch(error: any) {
             setSubmissionError(error.message || "Could not send OTP.");
           }
           return;
        }

        if (isOtpSent && (!otpCode || otpCode.length !== 6)) {
           setSubmissionError("Please enter the 6-digit OTP sent to your email.");
           return;
        }

        try {
          setIsVerifying(true);
          // Verify OTP
          await apiClient.post("/api/v1/auth/verify-otp", { email: values.email, code: otpCode });

          // If OTP verified, sign up
          await apiClient.post("/api/v1/auth/signup", {
            name: values.name,
            email: values.email,
            password: values.password,
            role: values.role,
          });

          const signInResult = await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false,
          });

          if (signInResult?.error) {
            router.push("/signin");
            return;
          }

          router.replace("/dashboard");
          router.refresh();
        } catch (error: any) {
          setSubmissionError(error.message || "Could not verify OTP or create your account.");
        } finally {
          setIsVerifying(false);
        }
      })();
    });
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-[var(--font-space-grotesk)] text-3xl font-semibold text-foreground">Create your account</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Public signup is enabled for tutor and guardian roles. Admin accounts should be created manually later.
        </p>
      </div>

      <form className="space-y-5" onSubmit={submitForm}>
        {isOtpSent ? (
          <div className="space-y-4">
             <div className="p-4 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm text-center">
               We sent a 6-digit code to <strong>{control._formValues.email}</strong>
             </div>
             <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="otpCode">
                Verification Code
              </label>
              <Input 
                id="otpCode" 
                placeholder="123456" 
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                autoFocus
              />
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="name">
                Full name
              </label>
              <Input id="name" placeholder="Purnendu Sarkar" {...register("name")} />
              {errors.name ? <p className="text-sm text-danger">{errors.name.message}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="email">
                Email address
              </label>
              <Input id="email" type="email" placeholder="purnendu@example.com" {...register("email")} />
              {errors.email ? <p className="text-sm text-danger">{errors.email.message}</p> : null}
            </div>

            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">I am joining as</label>
                  <RoleSelector value={field.value} onChange={field.onChange} />
                  {errors.role ? <p className="text-sm text-danger">{errors.role.message}</p> : null}
                </div>
              )}
            />

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="password">
                  Password
                </label>
                <Input id="password" type="password" placeholder="Strong password" {...register("password")} />
                {errors.password ? <p className="text-sm text-danger">{errors.password.message}</p> : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword ? <p className="text-sm text-danger">{errors.confirmPassword.message}</p> : null}
              </div>
            </div>
          </>
        )}

        {submissionError ? (
          <div className="flex items-start gap-3 rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{submissionError}</span>
          </div>
        ) : null}

        <Button className="w-full" size="lg" type="submit" disabled={isPending || isVerifying}>
          {isVerifying ? "Verifying..." : isPending ? "Sending OTP..." : isOtpSent ? "Verify & Create Account" : "Create account"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/signin" className="font-semibold text-primary transition hover:text-primary-strong">
          Sign in here
        </Link>
      </p>
    </div>
  );
}
