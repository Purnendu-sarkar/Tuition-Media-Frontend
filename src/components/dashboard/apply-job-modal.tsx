"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { jobApi, Job } from "@/lib/api/job";

interface ApplyJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onSuccess: (jobId: string) => void;
}

export function ApplyJobModal({ isOpen, onClose, job, onSuccess }: ApplyJobModalProps) {
  const { data: session } = useSession();
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await jobApi.applyForJob(job.id, session.accessToken, { 
        coverLetter: coverLetter.trim() !== "" ? coverLetter : undefined 
      });
      onSuccess(job.id);
      setCoverLetter(""); // Reset
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to apply for this job. You might have already applied.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Apply for Job</h2>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{job.title}</p>
              </div>
              <button 
                onClick={onClose} 
                className="self-start rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="coverLetter" className="text-sm font-medium">
                  Cover Letter <span className="text-muted-foreground font-normal">(Optional but recommended)</span>
                </label>
                <textarea 
                  id="coverLetter" 
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Explain why you are the best fit for this tuition..." 
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-border mt-6">
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                  {isSubmitting ? (
                    <div className="animate-spin h-4 w-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full" />
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Apply Now
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
