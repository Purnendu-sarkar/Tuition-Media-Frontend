"use client";

import Link from "next/link";
import type { Route } from "next";
import { useSession } from "next-auth/react";
import { Search, Briefcase, User, LogIn, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export function PublicNavbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks: {
    name: string;
    href: Route;
    icon: any;
  }[] = [
      { name: "Find Tutors", href: "/tutors", icon: Search },
      { name: "Tuition Jobs", href: "/jobs", icon: Briefcase },
    ];

  return (
    <header className="fixed top-4 inset-x-4 z-50">
      <div className="container mx-auto max-w-7xl">
        <nav className="flex items-center justify-between rounded-full border border-border bg-surface/80 px-6 py-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-8">
            <Logo />
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-semibold text-muted-foreground transition hover:text-primary flex items-center gap-2"
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <Button href="/dashboard" size="sm" className="hidden sm:flex items-center gap-2 rounded-full">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            ) : (
              <>
                <Link href="/signin" className="hidden sm:block text-sm font-semibold text-muted-foreground transition hover:text-foreground">
                  Sign in
                </Link>
                <Button href="/signup" size="sm" className="rounded-full px-6">
                  Join Now
                </Button>
              </>
            )}

            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-20 inset-x-4 p-6 rounded-3xl border border-border bg-surface shadow-2xl backdrop-blur-xl z-40"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 text-lg font-bold text-muted-foreground hover:text-primary transition-colors"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <link.icon className="h-5 w-5" />
                  </div>
                  {link.name}
                </Link>
              ))}
              <div className="pt-6 border-t border-border flex flex-col gap-4">
                {session ? (
                  <Button href="/dashboard" className="w-full h-12 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
                    Dashboard
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" href="/signin" className="w-full h-12 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign In
                    </Button>
                    <Button href="/signup" className="w-full h-12 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
                      Join Now
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
