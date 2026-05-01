import Link from "next/link";
import { GraduationCap } from "lucide-react";

interface LogoProps {
  tone?: "default" | "inverse";
}

export function Logo({ tone = "default" }: LogoProps) {
  const textClasses =
    tone === "inverse"
      ? {
          title: "text-white",
          subtitle: "text-white/70",
        }
      : {
          title: "text-foreground",
          subtitle: "text-muted-foreground",
        };

  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_16px_32px_-18px_rgba(15,118,110,0.85)]">
        <GraduationCap className="h-5 w-5" />
      </span>
      <span>
        <span className={`block font-[var(--font-space-grotesk)] text-lg font-semibold leading-none ${textClasses.title}`}>
          Tuition Media
        </span>
        <span className={`mt-1 block text-xs uppercase tracking-[0.18em] ${textClasses.subtitle}`}>
          AI Tutor Matching
        </span>
      </span>
    </Link>
  );
}
