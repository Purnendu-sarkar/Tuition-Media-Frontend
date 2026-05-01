"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Briefcase, Clock, FileText, CheckCircle2, User, Building } from "lucide-react";
import { useSession } from "next-auth/react";

import { Job, jobApi } from "@/lib/api/job";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export default function JobsPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const data = await jobApi.getAllJobs();
      setJobs(data);
    } catch (err: any) {
      setError(err.message || "Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyClick = (job: Job) => {
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
      
      // Update local application count
      setJobs(jobs.map(j => j.id === selectedJob.id ? {
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

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12 md:px-10">
      <div className="mb-10 text-center space-y-4">
        <h1 className="font-[var(--font-space-grotesk)] text-4xl md:text-5xl font-bold text-foreground">
          Find Your Next <span className="text-primary">Student</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Browse open tuition jobs posted by guardians and students. Apply easily and start teaching.
        </p>
      </div>

      <div className="mb-8 max-w-xl mx-auto relative">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by subject, location..." 
            className="pl-12 h-14 text-base rounded-full border-border bg-surface shadow-sm focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-10 bg-red-500/10 rounded-2xl border border-red-500/20 max-w-2xl mx-auto">
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchJobs}>Try Again</Button>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center text-muted-foreground py-20">
          <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-semibold mb-2 text-foreground">No jobs found</h3>
          <p>Try adjusting your search criteria or check back later.</p>
        </div>
      ) : (
        <motion.div 
          variants={container} 
          initial="hidden" 
          animate="show" 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-2"
        >
          {filteredJobs.map((job) => (
            <motion.div key={job.id} variants={item}>
              <Card className="h-full flex flex-col p-6 bg-surface border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {job.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{job.guardian.name}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {job.budget ? (
                    <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap text-sm">
                      ৳{job.budget}/mo
                    </div>
                  ) : (
                    <div className="bg-muted/20 text-muted-foreground px-3 py-1.5 rounded-lg font-medium whitespace-nowrap text-sm">
                      Negotiable
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                  {job.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-auto pt-4 border-t border-border/50">
                  {job.location && (
                    <div className="flex items-center gap-1.5 text-xs font-medium bg-muted/10 text-muted-foreground px-2.5 py-1 rounded-md">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs font-medium bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-md">
                    <FileText className="h-3.5 w-3.5" />
                    {job._count.applications} Applicants
                  </div>

                  <div className="ml-auto">
                    <Button 
                      onClick={() => handleApplyClick(job)}
                      disabled={session?.user?.role !== "TUTOR"}
                      title={session?.user?.role !== "TUTOR" ? "Only tutors can apply" : "Apply to this job"}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Apply Modal */}
      <AnimatePresence>
        {isApplyModalOpen && selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
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
              className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-2xl"
            >
              {applySuccess ? (
                <div className="text-center py-8">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 className="h-8 w-8" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Application Sent!</h3>
                  <p className="text-muted-foreground">The guardian will review your application soon.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-2">Apply for Job</h2>
                  <p className="text-muted-foreground mb-6">
                    Applying for <span className="font-semibold text-foreground">{selectedJob.title}</span>
                  </p>

                  {applyError && (
                    <div className="mb-6 rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                      {applyError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cover Letter (Optional)</label>
                      <textarea 
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Introduce yourself and explain why you're a good fit for this student..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setIsApplyModalOpen(false)}
                        disabled={isApplying}
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="w-full"
                        onClick={submitApplication}
                        disabled={isApplying}
                      >
                        {isApplying ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
