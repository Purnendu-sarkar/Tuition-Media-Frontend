"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Briefcase,
  FileText,
  CheckCircle2,
  User,
  SlidersHorizontal,
  X,
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowRight
} from "lucide-react";
import { useSession } from "next-auth/react";

import { publicApi, PublicJob, Pagination } from "@/lib/api/public";
import { jobApi } from "@/lib/api/job";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PublicNavbar } from "@/components/layouts/public-navbar";
import Link from "next/link";
import { div } from "framer-motion/client";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function PublicJobsPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [filters, setFilters] = useState({
    query: "",
    location: "",
    minBudget: "",
    maxBudget: "",
    page: 1,
  });

  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  // Apply Modal States
  const [selectedJob, setSelectedJob] = useState<PublicJob | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await publicApi.getJobs(filters);
      setJobs(res.jobs);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.message || "Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleApplyClick = (job: PublicJob) => {
    setSelectedJob(job);
    setCoverLetter("");
    setApplyError(null);
    setApplySuccess(null);
    setIsApplyModalOpen(true);
  };

  const submitApplication = async () => {
    if (!session?.accessToken || !selectedJob) return;

    try {
      setIsApplying(true);
      setApplyError(null);
      await jobApi.applyForJob(selectedJob.id, session.accessToken, { coverLetter });
      setApplySuccess("Application submitted successfully!");

      setJobs(prev => prev.map(j => j.id === selectedJob.id ? {
        ...j,
        _count: { applications: j._count.applications + 1 }
      } : j));

      setTimeout(() => {
        setIsApplyModalOpen(false);
      }, 2000);
    } catch (err: any) {
      setApplyError(err.message || "Failed to submit application");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <PublicNavbar />
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="mb-12 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2"
          >
            <TrendingUp className="h-3 w-3" /> Trending Circulars
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight"
          >
            Tuition <span className="text-primary italic">Circulars</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Browse high-quality tuition opportunities posted by verified guardians.
            Connect with students and start teaching today.
          </motion.p>
        </div>

        {/* Top Search Bar (Mobile & Desktop) */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by subject, student grade, or keywords..."
              className="pl-12 h-14 text-base rounded-2xl border-border bg-surface shadow-sm focus-visible:ring-primary/20"
              value={filters.query}
              onChange={(e) => handleFilterChange("query", e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="h-14 px-6 rounded-2xl md:hidden flex items-center gap-2 border-border bg-surface shadow-sm"
            onClick={() => setIsFilterSidebarOpen(true)}
          >
            <SlidersHorizontal className="h-5 w-5" /> Filters
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden md:block w-72 space-y-8 shrink-0">
            <div className="space-y-6 sticky top-28 p-6 bg-surface border border-border rounded-3xl shadow-sm">
              <div className="flex items-center gap-2 font-bold text-lg mb-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" /> Filter Jobs
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g. Uttara"
                    className="pl-9"
                    value={filters.location}
                    onChange={(e) => handleFilterChange("location", e.target.value)}
                  />
                </div>
              </div>

              {/* Budget Range */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Budget (৳/mo)</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">৳</span>
                    <Input
                      type="number"
                      placeholder="Min"
                      className="pl-6 text-sm"
                      value={filters.minBudget}
                      onChange={(e) => handleFilterChange("minBudget", e.target.value)}
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">৳</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      className="pl-6 text-sm"
                      value={filters.maxBudget}
                      onChange={(e) => handleFilterChange("maxBudget", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full text-primary hover:text-primary hover:bg-primary/5 rounded-xl font-bold"
                onClick={() => setFilters({ query: "", location: "", minBudget: "", maxBudget: "", page: 1 })}
              >
                Reset All Filters
              </Button>
            </div>
          </aside>

          {/* Jobs Feed */}
          <div className="flex-1">
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-48 rounded-3xl bg-muted/20 animate-pulse border border-border" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-red-500/5 rounded-3xl border border-red-500/20 max-w-xl mx-auto">
                <p className="text-red-500 font-medium mb-4">{error}</p>
                <Button onClick={fetchJobs}>Try Again</Button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-24 bg-surface rounded-3xl border border-border shadow-sm">
                <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-10" />
                <h3 className="text-2xl font-bold mb-2">No Matching Openings</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Try adjusting your keywords or filters to find more tuition circulars.
                </p>
              </div>
            ) : (
              <>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-6"
                >
                  {jobs.map((job) => (
                    <motion.div key={job.id} variants={item}>
                      <Card className="group p-6 md:p-8 bg-surface border-border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 rounded-3xl overflow-hidden relative">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110">
                                <Briefcase className="h-7 w-7" />
                              </div>
                              <div>
                                <h2 className="text-xl md:text-2xl font-bold group-hover:text-primary transition-colors">
                                  {job.title}
                                </h2>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1 font-medium">
                                  <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-primary" /> {job.guardian.name}</span>
                                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" /> {job.location || "Online"}</span>
                                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-primary" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            <p className="text-muted-foreground leading-relaxed line-clamp-2 max-w-3xl text-sm md:text-base">
                              {job.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-3">
                              <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-black text-xs py-1 px-3">
                                ৳{job.budget ? job.budget.toLocaleString() : 'Negotiable'} / mo
                              </Badge>
                              <Badge variant="outline" className="gap-1 font-bold text-xs py-1 px-3 bg-background">
                                <FileText className="h-3 w-3" /> {job._count.applications} Applicants
                              </Badge>
                              {job.guardian.isVerified && (
                                <Badge className="bg-emerald-500 text-white border-none gap-1 font-bold text-xs py-1 px-3">
                                  <CheckCircle2 className="h-3 w-3" /> Verified Guardian
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 flex md:flex-col items-center justify-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-border/50">
                            <Button
                              size="lg"
                              className="w-full md:w-36 rounded-2xl shadow-xl shadow-primary/20 font-bold tracking-tight h-12"
                              onClick={() => handleApplyClick(job)}
                              disabled={session?.user?.role !== "TUTOR" && session !== null}
                            >
                              Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            {!session && (
                              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest text-center">
                                Login as Tutor
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="mt-12 flex justify-center gap-2">
                    {Array.from({ length: pagination.pages }).map((_, i) => (
                      <Button
                        key={i}
                        variant={filters.page === i + 1 ? "default" : "outline"}
                        className="w-12 h-12 p-0 rounded-2xl font-bold text-lg"
                        onClick={() => handleFilterChange("page", i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter Sidebar (Mobile Overlay) */}
      <AnimatePresence>
        {isFilterSidebarOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterSidebarOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xs bg-surface border-l border-border p-8 shadow-2xl h-full overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-black">Filters</h2>
                <button onClick={() => setIsFilterSidebarOpen(false)} className="p-2 rounded-full hover:bg-muted transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-10">
                <div className="space-y-3">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Keywords</label>
                  <Input
                    placeholder="e.g. Physics"
                    value={filters.query}
                    onChange={(e) => handleFilterChange("query", e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. Banani"
                      value={filters.location}
                      onChange={(e) => handleFilterChange("location", e.target.value)}
                      className="pl-9 h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Monthly Budget</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">৳</span>
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minBudget}
                        onChange={(e) => handleFilterChange("minBudget", e.target.value)}
                        className="pl-6 h-12 rounded-xl text-xs"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">৳</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxBudget}
                        onChange={(e) => handleFilterChange("maxBudget", e.target.value)}
                        className="pl-6 h-12 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-6">
                  <Button
                    className="w-full h-14 rounded-2xl shadow-lg shadow-primary/20 font-bold text-lg"
                    onClick={() => setIsFilterSidebarOpen(false)}
                  >
                    Apply Filters
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full h-12 text-primary hover:bg-primary/5 rounded-xl font-bold"
                    onClick={() => {
                      setFilters({ query: "", location: "", minBudget: "", maxBudget: "", page: 1 });
                      setIsFilterSidebarOpen(false);
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Apply Modal */}
      <AnimatePresence>
        {isApplyModalOpen && selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isApplying && setIsApplyModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-[2.5rem] border border-border bg-surface p-8 md:p-12 shadow-2xl overflow-hidden"
            >
              {applySuccess ? (
                <div className="text-center py-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8"
                  >
                    <CheckCircle2 className="h-12 w-12" />
                  </motion.div>
                  <h3 className="text-3xl font-black mb-4 tracking-tight">Success!</h3>
                  <p className="text-muted-foreground text-lg">Your application has been sent to the guardian. You will be notified of any updates.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 mb-2">Apply for Job</Badge>
                      <h2 className="text-3xl font-black tracking-tight">{selectedJob.title}</h2>
                      <p className="text-muted-foreground flex items-center gap-1.5 font-medium">
                        <MapPin className="h-4 w-4" /> {selectedJob.location}
                      </p>
                    </div>
                    <button onClick={() => setIsApplyModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {applyError && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm font-medium">
                      {applyError}
                    </div>
                  )}

                  {!session ? (
                    <div className="text-center py-10 space-y-8 bg-muted/50 rounded-3xl">
                      <div className="space-y-2">
                        <p className="text-xl font-bold">Sign in required</p>
                        <p className="text-muted-foreground text-sm">Please login as a Tutor to apply for this tuition job.</p>
                      </div>
                      <div className="flex gap-4 px-6">
                        <Link href="/signin" className="flex-1">
                          <Button className="w-full h-12 rounded-xl">
                            Sign In
                          </Button>
                        </Link>

                        <Link href="/signup" className="flex-1">
                          <Button variant="outline" className="w-full h-12 rounded-xl">
                            Sign Up
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : session.user.role !== "TUTOR" ? (
                    <div className="text-center py-12 p-8 bg-amber-500/5 border border-amber-500/20 rounded-3xl">
                      <p className="text-amber-600 font-bold text-lg">Account Type Error</p>
                      <p className="text-amber-600/80 text-sm mt-2">Only Tutor accounts can apply for jobs. You are currently logged in as a {session.user.role}.</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Application Message</label>
                        <textarea
                          className="flex min-h-[180px] w-full rounded-3xl border border-border bg-background/50 px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner"
                          placeholder="Introduce yourself and explain why you're perfect for this role. Mention your relevant experience and teaching style..."
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button
                          variant="ghost"
                          className="flex-1 h-14 rounded-2xl font-bold text-lg"
                          onClick={() => setIsApplyModalOpen(false)}
                          disabled={isApplying}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1 h-14 rounded-2xl shadow-2xl shadow-primary/20 font-black text-lg"
                          onClick={submitApplication}
                          disabled={isApplying || !coverLetter.trim()}
                        >
                          {isApplying ? "Sending..." : "Submit Application"}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
