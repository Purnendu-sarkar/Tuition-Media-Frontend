import Link from "next/link";
import { HelpCircle, MessageSquare, AlertTriangle } from "lucide-react";
import { PublicNavbar } from "@/components/layouts/public-navbar";
import { PublicFooter } from "@/components/layouts/public-footer";

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col pt-24">
      <PublicNavbar />
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-4 flex flex-col gap-2 shadow-sm">
            <h2 className="px-4 mb-2 text-lg font-semibold text-foreground">Support & Safety</h2>
            <Link
              href="/support"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">Help Center & FAQ</span>
            </Link>
            <Link
              href="/support/chat"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Live Support Chat</span>
            </Link>
            <Link
              href="/support/report"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Report System</span>
            </Link>
          </div>
        </aside>
        <main className="flex-1">
          {children}
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}
