"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Briefcase, SlidersHorizontal, AlertCircle, Sparkles } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/dashboard/job-card";
import { ApplyJobModal } from "@/components/dashboard/apply-job-modal";
import { jobApi, Job } from "@/lib/api/job";

export default function BrowseJobsPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "MATCHED">("ALL");

  // Application Modal State
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchJobs();
    if (session?.accessToken) {
      fetchAppliedJobs();
    }
  }, [session?.accessToken]);

  const fetchAppliedJobs = async () => {
    if (!session?.accessToken) return;
    try {
      const jobIds = await jobApi.getAppliedJobs(session.accessToken);
      setAppliedJobIds(new Set(jobIds));
    } catch (err) {
      console.error("Failed to fetch applied jobs:", err);
    }
  };

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await jobApi.getAllJobs();
      setJobs(data);
    } catch (err: any) {
      console.error("Failed to fetch jobs:", err);
      setError("Failed to load jobs. The server might be unreachable.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleApplicationSuccess = (jobId: string) => {
    setAppliedJobIds(prev => {
      const newSet = new Set(prev);
      newSet.add(jobId);
      return newSet;
    });
  };

  // Memoized Filtering & Sorting Logic
  const filteredJobs = useMemo(() => {
    let result = jobs.filter(job => {
      // Basic Search
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            job.location?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter for AI matches (Score > 70)
      const isMatched = (job.matchScore || 0) >= 70;
      const matchesFilter = activeFilter === "ALL" || (activeFilter === "MATCHED" && isMatched);

      return matchesSearch && matchesFilter;
    });

    // If AI Matches filter is on, sort by highest match score
    if (activeFilter === "MATCHED") {
      result = [...result].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    return result;
  }, [jobs, searchQuery, activeFilter]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-[var(--font-space-grotesk)] text-foreground tracking-tight">Find Tuition Jobs</h1>
          <p className="text-muted-foreground mt-2 text-lg">Browse open positions and apply to jobs that match your skills.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface px-6 py-3 rounded-2xl border border-border shadow-sm">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Available Jobs</p>
            <p className="text-2xl font-black text-primary">{jobs.length}</p>
          </div>
          <div className="bg-surface px-6 py-3 rounded-2xl border border-border shadow-sm ring-1 ring-primary/10">
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">AI Matches</p>
            <p className="text-2xl font-black text-primary">{jobs.filter(j => (j.matchScore || 0) >= 70).length}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center bg-surface/50 backdrop-blur-md p-2 rounded-[24px] border border-border shadow-xl ring-1 ring-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
          <Input 
            placeholder="Search by subject, class, or location..." 
            className="pl-12 h-14 bg-background/40 border-none text-lg rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full lg:w-auto p-1 bg-background/40 rounded-2xl">
          <Button 
            variant={activeFilter === "ALL" ? "default" : "ghost"} 
            className={`flex-1 lg:flex-none h-12 px-8 rounded-xl font-bold transition-all ${activeFilter === "ALL" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground"}`}
            onClick={() => setActiveFilter("ALL")}
          >
            All Jobs
          </Button>
          <Button 
            variant={activeFilter === "MATCHED" ? "default" : "ghost"}
            className={`flex-1 lg:flex-none h-12 px-8 gap-2 rounded-xl font-bold transition-all ${activeFilter === "MATCHED" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground"}`}
            onClick={() => setActiveFilter("MATCHED")}
          >
            <Sparkles className="h-4 w-4" /> AI Matches
          </Button>
        </div>
        <Button variant="outline" size="icon" className="h-14 w-14 shrink-0 hidden lg:flex rounded-2xl border-border/50 bg-background/40 hover:bg-background/60">
          <SlidersHorizontal className="h-6 w-6" />
        </Button>
      </div>

      {/* Content Section */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground text-sm">Loading jobs...</p>
          </div>
        ) : error ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-red-500/30 rounded-2xl bg-red-500/5">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4 opacity-80" />
            <h3 className="text-lg font-semibold text-red-500">Connection Error</h3>
            <p className="text-muted-foreground max-w-md mt-2">{error}</p>
            <Button onClick={fetchJobs} variant="outline" className="mt-6 border-red-500/20 text-red-500 hover:bg-red-500/10">
              Try Again
            </Button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-2xl bg-surface/50">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold text-foreground">No jobs found</h3>
            <p className="text-muted-foreground max-w-md mt-2">
              Try adjusting your search or filter criteria to find more opportunities.
            </p>
            {(searchQuery || activeFilter !== "ALL") && (
              <Button 
                onClick={() => { setSearchQuery(""); setActiveFilter("ALL"); }} 
                variant="outline" 
                className="mt-6"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
          >
            {filteredJobs.map((job) => {
              const hasApplied = appliedJobIds.has(job.id);
              
              return (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  hasApplied={hasApplied}
                  onApplyClick={handleApplyClick}
                  matchScore={job.matchScore}
                />
              );
            })}
          </motion.div>
        )}
      </div>

      <ApplyJobModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        job={selectedJob}
        onSuccess={handleApplicationSuccess}
      />
    </div>
  );
}
