"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  ShieldAlert,
  FileText,
  MessageSquare,
  ShieldCheck,
  Wallet,
  CalendarDays,
  Star,
  Sparkles,
  Heart,
  PlusCircle,
  CreditCard,
  Flag,
  Settings,
  HelpCircle,
  Activity,
  LogOut
} from "lucide-react";
import { signOut } from "next-auth/react";

import { Logo } from "@/components/ui/logo";

interface SidebarProps {
  role: "TUTOR" | "GUARDIAN" | "ADMIN";
  className?: string;
}

export function Sidebar({ role, className = "" }: SidebarProps) {
  const pathname = usePathname();

  const getNavLinks = () => {
    switch (role) {
      case "TUTOR":
        return [
          { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
          { label: "Find Jobs", href: "/dashboard/jobs", icon: Briefcase },
          { label: "AI Matches", href: "/dashboard/jobs/ai", icon: Sparkles },
          { label: "My Applications", href: "/dashboard/applications", icon: FileText },
          { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
          { label: "Schedule", href: "/dashboard/schedule", icon: CalendarDays },
          { label: "Verification", href: "/dashboard/verification", icon: ShieldCheck },
        ];
      case "GUARDIAN":
        return [
          { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
          { label: "Post a Job", href: "/dashboard/posts/new", icon: PlusCircle },
          { label: "My Posts", href: "/dashboard/posts", icon: Briefcase },
          { label: "Applications", href: "/dashboard/hiring", icon: Users },
          { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
          { label: "Saved Tutors", href: "/dashboard/saved", icon: Heart },
          { label: "Verification", href: "/dashboard/verification", icon: ShieldCheck },
        ];
      case "ADMIN":
        return [
          { label: "Command Center", href: "/admin/dashboard", icon: Activity },
          { label: "Tutors", href: "/admin/users/tutors", icon: Users },
          { label: "Guardians", href: "/admin/users/guardians", icon: Users },
          { label: "Verifications", href: "/admin/verifications", icon: ShieldCheck },
          { label: "Moderation", href: "/admin/moderation/reports", icon: Flag },
          { label: "Support Inbox", href: "/admin/support/tickets", icon: HelpCircle },
          { label: "Fraud Detection", href: "/admin/moderation/fraud", icon: ShieldAlert },
          { label: "Finance", href: "/admin/finance", icon: Wallet },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex-col bg-surface border-r border-border ${className || "hidden md:flex"}`}>
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Logo />
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {role} Dashboard
        </div>
        <nav className="space-y-1">
          {navLinks.map((link) => {
            // Precise active logic: exact match OR starts with + slash (to not match /dashboard when at /dashboard/jobs)
            const isActive = 
              pathname === link.href || 
              (link.href !== "/dashboard" && pathname.startsWith(`${link.href}/`)) ||
              (link.href !== "/admin/dashboard" && pathname.startsWith(`${link.href}/`));
            
            return (
              <Link
                key={link.label}
                href={link.href as any}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <link.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-8 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          System
        </div>
        <nav className="space-y-1">
          <Link
            href={(role === "ADMIN" ? "/admin/settings" : "/dashboard/settings") as any}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          <Link
            href={"/support" as any}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
            Help & Support
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
