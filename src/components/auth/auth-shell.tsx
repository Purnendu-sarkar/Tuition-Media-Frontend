import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Layers3, Shield } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";

interface AuthShellProps {
  badge: string;
  title: string;
  description: string;
  children: ReactNode;
}

const supportItems = [
  {
    icon: Layers3,
    title: "Reusable components",
    description: "Shared UI building blocks make future auth, posting, and dashboard work faster.",
  },
  {
    icon: Shield,
    title: "Secure-first setup",
    description: "Validation, password hashing, JWT issuance, and session protection are all in place.",
  },
  {
    icon: CheckCircle2,
    title: "Production-ready structure",
    description: "Frontend and backend stay isolated while scripts, env files, and Prisma remain easy to manage.",
  },
];

export function AuthShell({ badge, title, description, children }: AuthShellProps) {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-10 px-6 py-8 md:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-12">
      <section className="flex flex-col justify-between rounded-[2rem] border border-border bg-[linear-gradient(145deg,rgba(15,118,110,0.98),rgba(17,24,39,0.94))] p-7 text-white shadow-[0_36px_90px_-44px_rgba(15,23,42,0.7)]">
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-4">
            <Logo tone="inverse" />
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              Back home
            </Link>
          </div>

          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80">
              {badge}
            </span>
            <div className="space-y-3">
              <h1 className="max-w-xl font-[var(--font-space-grotesk)] text-4xl font-semibold tracking-tight md:text-5xl">
                {title}
              </h1>
              <p className="max-w-xl text-base leading-7 text-white/75">{description}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4">
          {supportItems.map((item) => (
            <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-start gap-4">
                <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-semibold text-white">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/70">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center">
        <Card className="w-full border-white/60 bg-surface p-6 md:p-8">{children}</Card>
      </section>
    </main>
  );
}
