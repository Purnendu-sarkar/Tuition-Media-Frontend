import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12 md:py-16 mt-auto">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Logo />
            <p className="text-sm text-muted-foreground text-center md:text-left max-w-sm">
              AI-based tuition matching platform making education accessible and secure.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/support" className="hover:text-primary transition-colors">Support & Safety</Link>
            <Link href="/tutors" className="hover:text-primary transition-colors">Find Tutors</Link>
            <Link href="/jobs" className="hover:text-primary transition-colors">Tuition Jobs</Link>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} AI Tuition Media. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
