"use client";

import Link from "next/link";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Globe,
  ShieldCheck,
  CreditCard
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: "Find Tutors", href: "/tutors" as any },
      { name: "Browse Jobs", href: "/jobs" as any },
      { name: "How it Works", href: "/how-it-works" as any },
      { name: "Pricing", href: "/pricing" as any },
      { name: "Verify Profile", href: "/dashboard/verification" as any },
    ],
    company: [
      { name: "About Us", href: "/about" as any },
      { name: "Success Stories", href: "/stories" as any },
      { name: "Safety Center", href: "/support" as any },
      { name: "Careers", href: "/careers" as any },
      { name: "Contact", href: "/support" as any },
    ],
    support: [
      { name: "Help Center", href: "/support" as any },
      { name: "Guardian Guidelines", href: "/guidelines/guardian" as any },
      { name: "Tutor Guidelines", href: "/guidelines/tutor" as any },
      { name: "Payment Security", href: "/security" as any },
      { name: "Report an Issue", href: "/support/report" as any },
    ],
  };

  const socials = [
    { icon: Facebook, href: "#", name: "Facebook" },
    { icon: Twitter, href: "#", name: "Twitter" },
    { icon: Instagram, href: "#", name: "Instagram" },
    { icon: Linkedin, href: "#", name: "LinkedIn" },
    { icon: Youtube, href: "#", name: "YouTube" },
  ];

  return (
    <footer className="relative bg-surface-strong border-t border-border overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary-strong to-primary" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-24 -right-24 w-72 h-72 bg-secondary-soft rounded-full blur-3xl opacity-50" />

      <div className="container mx-auto max-w-7xl px-6 pt-20 pb-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <Logo />
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              The smartest way to connect verified tutors with students in Bangladesh. 
              Powered by AI to ensure the perfect academic match every single time.
            </p>
            <div className="flex items-center gap-3">
              {socials.map((social, i) => (
                <Link 
                  key={i} 
                  href={social.href as any} 
                  className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all duration-300 group"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-6">
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-foreground/50">Platform</h4>
              <ul className="space-y-4">
                {footerLinks.platform.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center group">
                      <span className="w-0 overflow-hidden group-hover:w-2 transition-all duration-300 bg-primary h-1 rounded-full mr-0 group-hover:mr-2" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-foreground/50">Resources</h4>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center group">
                      <span className="w-0 overflow-hidden group-hover:w-2 transition-all duration-300 bg-primary h-1 rounded-full mr-0 group-hover:mr-2" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6 hidden sm:block">
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-foreground/50">Community</h4>
              <ul className="space-y-4">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center group">
                      <span className="w-0 overflow-hidden group-hover:w-2 transition-all duration-300 bg-primary h-1 rounded-full mr-0 group-hover:mr-2" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3 space-y-8">
            <div className="p-6 rounded-[2rem] bg-surface border border-border shadow-sm space-y-4">
              <h4 className="font-black text-lg">Weekly Insights</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Join 5,000+ members getting career tips and tutoring opportunities.
              </p>
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Your email" 
                    className="pl-10 h-11 rounded-xl bg-background border-border/50 text-xs"
                  />
                </div>
                <Button className="w-full h-11 rounded-xl font-bold text-xs gap-2">
                  Subscribe <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 px-2">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-surface-strong bg-muted animate-pulse" />
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                +2k Active Today
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col md:flex-row items-center gap-6 text-xs font-bold text-muted-foreground">
            <p>© {currentYear} AI Tuition Media. Crafted with precision.</p>
            <div className="flex items-center gap-4">
              <Link href={"/privacy" as any} className="hover:text-primary">Privacy Policy</Link>
              <Link href={"/terms" as any} className="hover:text-primary">Terms of Service</Link>
              <Link href={"/cookies" as any} className="hover:text-primary">Cookie Policy</Link>
            </div>
          </div>
          
          <div className="flex justify-center md:justify-end items-center gap-8">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">ISO Certified</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Secure Payments</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Globe className="h-4 w-4 text-secondary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Global Reach</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
