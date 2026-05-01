"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Briefcase, SlidersHorizontal, AlertCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/dashboard/job-card";
import { ApplyJobModal } from "@/components/dashboard/apply-job-modal";
import { jobApi, Job } from "@/lib/api/job";

export default function BrowseJobsPage() {
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
  }, []);

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

  // Memoized Filtering Logic
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Basic Search
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            job.location?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Basic mock for "AI Matched" filter (In production, this comes from backend)
      // We will pretend jobs with budgets > 5000 are "matches" just for UI demonstration
      const isMatched = job.budget && job.budget > 5000;
      const matchesFilter = activeFilter === "ALL" || (activeFilter === "MATCHED" && isMatched);

      return matchesSearch && matchesFilter;
    });
  }, [jobs, searchQuery, activeFilter]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold font-[var(--font-space-grotesk)] text-foreground">Find Tuition Jobs</h1>
        <p className="text-muted-foreground mt-2">Browse open positions and apply to jobs that match your skills.</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-surface p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by subject, class, or location..." 
            className="pl-10 h-12 bg-background/50 border-border/50 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant={activeFilter === "ALL" ? "default" : "outline"} 
            className={`flex-1 sm:flex-none h-12 ${activeFilter === "ALL" ? "bg-primary text-primary-foreground" : ""}`}
            onClick={() => setActiveFilter("ALL")}
          >
            All Jobs
          </Button>
          <Button 
            variant={activeFilter === "MATCHED" ? "default" : "outline"}
            className={`flex-1 sm:flex-none h-12 gap-2 ${activeFilter === "MATCHED" ? "bg-primary text-primary-foreground" : ""}`}
            onClick={() => setActiveFilter("MATCHED")}
          >
            <Filter className="h-4 w-4" /> AI Matches
          </Button>
          <Button variant="outline" size="icon" className="h-12 w-12 shrink-0 hidden sm:flex">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>
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
              // Simulated AI Match Score for UI completeness
              const mockScore = job.budget && job.budget > 5000 ? Math.floor(Math.random() * 20) + 80 : 0;
              const hasApplied = appliedJobIds.has(job.id);
              
              return (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  hasApplied={hasApplied}
                  onApplyClick={handleApplyClick}
                  matchScore={mockScore}
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
