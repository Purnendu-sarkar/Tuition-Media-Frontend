import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  ShieldCheck,
  Sparkles,
  Search,
  Users,
  Target,
  GraduationCap,
  MessageCircle,
  Star,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  Shield
} from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PublicNavbar } from "@/components/layouts/public-navbar";
import { publicApi } from "@/lib/api/public";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  const session = await auth();

  // Fetch initial data for sections
  const tutorsRes = await publicApi.getTutors({ limit: 4 }).catch(() => ({ tutors: [] }));
  const jobsRes = await publicApi.getJobs({ limit: 3 }).catch(() => ({ jobs: [] }));

  const stats = [
    { label: "Verified Tutors", value: "2,000+", icon: Users },
    { label: "Successful Matches", value: "5,000+", icon: Target },
    { label: "Tuition Jobs", value: "850+", icon: GraduationCap },
  ];

  const categories = [
    "Mathematics", "Physics", "English", "Chemistry", "Biology", "ICT", "Arts", "Music"
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-[10%] right-[5%] w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-[40%] left-[5%] w-96 h-96 bg-secondary-soft rounded-full blur-3xl opacity-50" />

      <PublicNavbar />

      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-bold text-primary animate-in fade-in slide-in-from-top-4 duration-700">
              <Sparkles className="h-4 w-4" />
              #1 AI-Powered Tuition Marketplace in Bangladesh
            </div>

            <h1 className="text-5xl md:text-7xl font-black font-[var(--font-space-grotesk)] tracking-tight text-balance leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Find the Perfect <span className="gradient-text">Tutor</span> with <span className="relative inline-block">
                AI Precision
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-secondary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              The smartest way to connect verified tutors with students. Personalized matches, secure payments, and a safer community for everyone.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto glass p-2 rounded-2xl flex flex-col md:flex-row gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Subject (e.g. Physics, Math)"
                  className="w-full h-14 pl-12 pr-4 bg-transparent border-none focus:outline-none text-foreground font-medium"
                />
              </div>
              <div className="w-px h-8 bg-border hidden md:block self-center" />
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Location (e.g. Dhaka, Dhanmondi)"
                  className="w-full h-14 pl-12 pr-4 bg-transparent border-none focus:outline-none text-foreground font-medium"
                />
              </div>
              <Button size="lg" className="h-14 px-8 rounded-xl font-bold">
                Find Tutor
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {categories.map(cat => (
                <Badge key={cat} variant="secondary" className="px-4 py-1.5 rounded-full cursor-pointer hover:bg-primary hover:text-white transition-colors">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="py-12 bg-surface/50 border-y border-border">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 space-y-2 group">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-4xl font-black font-[var(--font-space-grotesk)]">{stat.value}</div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. AI Matching Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="h-14 w-14 rounded-3xl bg-secondary-soft flex items-center justify-center text-primary">
                <BrainCircuit className="h-8 w-8" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black font-[var(--font-space-grotesk)] leading-tight">
                Not just another marketplace. <br />
                It's <span className="text-primary">Intelligence</span> applied.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our AI algorithm analyzes hundreds of data points—from subject expertise to teaching style and past performance—to ensure you find the one perfect match.
              </p>

              <ul className="space-y-4">
                {[
                  "Subject-specific skill matching",
                  "Verified background checks",
                  "AI-driven schedule optimization",
                  "Risk-free escrow payment system"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-semibold">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Button size="lg" className="rounded-xl h-14 px-8 font-bold gap-2">
                Learn how it works
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-[4rem] blur-3xl rotate-12 scale-90" />
              <Card className="relative glass p-8 rounded-[3rem] border-primary/20 overflow-hidden shadow-2xl animate-float">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 border-b border-border pb-6">
                    <div className="h-16 w-16 rounded-3xl bg-surface-strong shadow-lg border border-border flex items-center justify-center text-primary font-bold text-xl">AI</div>
                    <div>
                      <div className="text-sm font-bold text-primary uppercase tracking-widest">Matching Engine</div>
                      <div className="text-xl font-black">Analyzing candidates...</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center justify-between p-4 bg-surface-strong/50 rounded-2xl border border-border">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                          <div className="h-4 w-24 bg-muted rounded-full animate-pulse" />
                        </div>
                        <div className="h-6 w-12 bg-primary/10 rounded-full animate-pulse" />
                      </div>
                    ))}
                  </div>
                  <div className="bg-primary p-4 rounded-2xl text-white text-center font-bold">
                    Match Found: 98% Compatibility
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Tutors */}
      <section className="py-24 px-6 bg-surface/30">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-black font-[var(--font-space-grotesk)] mb-2">Featured Tutors</h2>
              <p className="text-muted-foreground">Highest rated professionals on our platform</p>
            </div>
            <Button variant="outline" href="/tutors" className="rounded-xl font-bold">View all tutors</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tutorsRes.tutors.map((tutor) => (
              <Link key={tutor.id} href={`/tutors/${tutor.id}`}>
                <Card className="h-full hover:shadow-2xl transition-all duration-300 group border-border/50 rounded-3xl overflow-hidden">
                  <div className="aspect-[4/5] relative bg-muted">
                    {tutor.image ? (
                      <img src={tutor.image} alt={tutor.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                        <Users className="h-12 w-12 opacity-20" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-white/90 text-primary hover:bg-white backdrop-blur-md border-none font-bold">
                        <Star className="h-3 w-3 mr-1 fill-primary" />
                        {tutor.averageRating}
                      </Badge>
                      {tutor.isVerified && (
                        <Badge className="bg-primary/90 text-white border-none font-bold">
                          <BadgeCheck className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-lg truncate">{tutor.name}</h3>
                    <div className="flex flex-wrap gap-1">
                      {tutor.tutorProfile.subjects.slice(0, 2).map(sub => (
                        <span key={sub} className="text-[10px] uppercase font-bold px-2 py-0.5 bg-muted rounded-full">
                          {sub}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {tutor.tutorProfile.location || "Location N/A"}
                      </div>
                      <div className="font-bold text-primary">
                        {tutor.tutorProfile.hourlyRate ? `${tutor.tutorProfile.hourlyRate}৳/hr` : "Negotiable"}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Latest Jobs */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-black font-[var(--font-space-grotesk)]">Latest Tuition Jobs</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Browse through recently posted opportunities and apply to start teaching</p>
          </div>

          <div className="grid gap-6">
            {jobsRes.jobs.map((job) => (
              <Card key={job.id} className="p-6 md:p-8 hover:shadow-xl transition-all border-border/50 rounded-[2rem] group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                      <Badge variant="outline" className="rounded-full bg-emerald-500/5 text-emerald-500 border-emerald-500/20 px-3">Active</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5 font-medium">
                        <MapPin className="h-4 w-4 text-primary" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock className="h-4 w-4 text-primary" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Users className="h-4 w-4 text-primary" />
                        {job._count.applications} Applications
                      </div>
                    </div>
                    <p className="text-muted-foreground line-clamp-2 max-w-3xl italic">"{job.description}"</p>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="text-3xl font-black text-primary">
                      {job.budget ? `${job.budget}৳` : "Negotiable"}
                      <span className="text-xs text-muted-foreground font-normal ml-1">/month</span>
                    </div>
                    <Button
                      href={`/jobs/${job.id}`}
                      className="rounded-xl px-8 h-12 font-bold"
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="ghost" href="/jobs" className="font-bold gap-2">
              Browse all jobs
              <TrendingUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* 6. Support & Safety */}
      <section className="py-24 px-6 bg-primary text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent_50%)]" />
        <div className="container mx-auto max-w-7xl relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="h-16 w-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black font-[var(--font-space-grotesk)] leading-tight">
                Your <span className="text-secondary">Safety</span> is <br />
                Our Top Priority.
              </h2>
              <p className="text-lg text-white/70 leading-relaxed">
                We built a comprehensive safety suite so you can focus on learning. From 24/7 support to verified profiles and secure escrow payments.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <div className="font-bold text-xl">24/7 Help Center</div>
                  <p className="text-sm text-white/60 leading-relaxed">Instant answers to your questions and live support chat whenever you need it.</p>
                </div>
                <div className="space-y-2">
                  <div className="font-bold text-xl">Identity Verification</div>
                  <p className="text-sm text-white/60 leading-relaxed">We use advanced AI and document checks to verify every tutor on our platform.</p>
                </div>
              </div>
              <Button variant="outline" href="/support" className="border-white/20 text-white hover:bg-white hover:text-primary rounded-xl h-14 px-8 font-bold">
                Explore Safety Features
              </Button>
            </div>

            <div className="relative hidden md:block">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6 rounded-3xl -rotate-6 animate-float">
                  <MessageCircle className="h-10 w-10 text-secondary mb-4" />
                  <div className="font-bold">Live Chat</div>
                  <p className="text-xs text-white/50 mt-1">Talk to our experts anytime.</p>
                </Card>
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6 rounded-3xl translate-y-12 rotate-3">
                  <ShieldCheck className="h-10 w-10 text-emerald-400 mb-4" />
                  <div className="font-bold">Verified</div>
                  <p className="text-xs text-white/50 mt-1">Trusted profiles only.</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-5xl">
          <Card className="p-12 md:p-20 rounded-[4rem] bg-surface border-border/50 text-center space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />

            <h2 className="text-4xl md:text-6xl font-black font-[var(--font-space-grotesk)] tracking-tighter">
              Ready to find your <br />
              <span className="gradient-text">Academic Match?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students and tutors who are already transforming education in Bangladesh.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button href="/signup" size="lg" className="h-16 px-10 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
                Join Now for Free
              </Button>
              <Button href="/signin" variant="outline" size="lg" className="h-16 px-10 rounded-2xl font-bold text-lg">
                Sign In to Account
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer (Simplified for homepage) */}
      <footer className="py-12 border-t border-border bg-surface/50">
        <div className="container mx-auto max-w-7xl px-6 text-center">
          <div className="text-sm text-muted-foreground font-medium">
            © 2026 AI-Based Tuition Media. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
