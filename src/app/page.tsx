import Link from "next/link";
import { ArrowRight, BadgeCheck, BrainCircuit, ShieldCheck, Sparkles } from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PublicNavbar } from "@/components/layouts/public-navbar";

const featureItems = [
  {
    icon: BrainCircuit,
    title: "AI-powered matching",
    description: "Match tutors and guardians by subject, budget, area, and schedule without manual guesswork.",
  },
  {
    icon: ShieldCheck,
    title: "Verified onboarding",
    description: "Prepared for document checks, admin moderation, and safer account verification flows.",
  },
  {
    icon: Sparkles,
    title: "Scalable architecture",
    description: "Reusable UI components, typed APIs, Prisma models, and a clean workspace setup for growth.",
  },
];

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 md:px-10 lg:px-12">
      <PublicNavbar />

      <section className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary-soft px-4 py-2 text-sm font-semibold text-foreground">
            <BadgeCheck className="h-4 w-4 text-primary" />
            Bangladesh-ready tutor marketplace
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl font-[var(--font-space-grotesk)] text-5xl font-semibold tracking-tight text-balance md:text-6xl">
              Build trustworthy tutor matching with AI, speed, and clean product architecture.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              This starter ships with a Next.js 16 frontend, Express backend, PostgreSQL-ready Prisma schema,
              JWT-based signup, and NextAuth session handling so we can move fast without losing structure.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href={session?.user ? "/dashboard" : "/signup"} size="lg">
              Start with signup
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/signin" size="lg" variant="secondary">
              Explore login flow
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden border-0 bg-surface p-0 shadow-[0_36px_80px_-40px_rgba(15,23,42,0.5)]">
          <div className="border-b border-border bg-[linear-gradient(135deg,rgba(15,118,110,0.96),rgba(6,95,70,0.92))] px-6 py-7 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">Project baseline</p>
            <h2 className="mt-3 font-[var(--font-space-grotesk)] text-3xl font-semibold">
              Signup is ready for Tutor and Guardian roles
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/80">
              The form is connected to the backend registration API and can immediately sign users in through
              NextAuth credentials after account creation.
            </p>
          </div>

          <div className="grid gap-4 p-6">
            {featureItems.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-border bg-surface-strong p-5 shadow-[0_16px_36px_-30px_rgba(15,23,42,0.32)]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-soft text-primary">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}
