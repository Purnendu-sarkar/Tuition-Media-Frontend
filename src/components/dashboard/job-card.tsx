import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock, Users, BrainCircuit, CheckCircle2, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Job } from "@/lib/api/job";

interface JobCardProps {
  job: Job;
  hasApplied: boolean;
  onApplyClick: (job: Job) => void;
  matchScore?: number;
}

export function JobCard({ job, hasApplied, onApplyClick, matchScore = 0 }: JobCardProps) {
  const postedDate = new Date(job.createdAt).toLocaleDateString("en-BD", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const isHighMatch = matchScore >= 85;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
      <Card className={`h-full flex flex-col p-5 sm:p-6 border-border bg-surface shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden ${
        isHighMatch ? 'ring-2 ring-primary/20 bg-gradient-to-br from-surface to-primary/5' : ''
      }`}>
        
        {/* Match Score Indicator Background */}
        {matchScore > 0 && (
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all duration-500">
            <BrainCircuit className="h-32 w-32 text-primary" />
          </div>
        )}

        {isHighMatch && (
          <div className="absolute top-0 left-0">
            <div className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-br-lg flex items-center gap-1 shadow-sm">
              <Sparkles className="h-3 w-3" />
              Top Match
            </div>
          </div>
        )}

        <div className="relative z-10 flex-1">
          <div className="flex justify-between items-start gap-4 mb-5 mt-2">
            <div className="flex-1">
              <h3 className="font-bold text-xl text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                {job.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border">
                  {job.guardian.name.charAt(0)}
                </span>
                Posted by <span className="text-foreground font-medium">{job.guardian.name}</span>
              </p>
            </div>
            
            {matchScore > 0 && (
              <div className="flex flex-col items-end">
                <div className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold border shadow-sm transition-all ${
                  matchScore >= 80 ? 'bg-primary/10 text-primary border-primary/20 ring-4 ring-primary/5' : 
                  matchScore >= 60 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                  'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                }`}>
                  <BrainCircuit className="h-3.5 w-3.5 animate-pulse" />
                  {matchScore}% Match
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground bg-muted/30 p-2 rounded-xl border border-border/50">
              <MapPin className="h-4 w-4 text-rose-500" />
              <span className="truncate">{job.location || "Negotiable"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground bg-muted/30 p-2 rounded-xl border border-border/50">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="truncate font-semibold text-foreground">
                {job.budget ? `৳${job.budget.toLocaleString()}` : "Negotiable"}
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-6 italic opacity-80">
            "{job.description}"
          </p>
        </div>

        <div className="relative z-10 mt-auto pt-5 border-t border-border/60 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              job.status === "OPEN" ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${job.status === "OPEN" ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
              {job.status}
            </span>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1 px-1">
              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {job._count.applications} applicants</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {postedDate}</span>
            </div>
          </div>

          {hasApplied ? (
            <div className="inline-flex items-center text-sm font-bold text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 shadow-inner">
              <CheckCircle2 className="mr-2 h-4 w-4" /> Applied
            </div>
          ) : (
            <Button 
              onClick={() => onApplyClick(job)}
              disabled={job.status !== "OPEN"}
              size="lg"
              className={`rounded-xl px-6 shadow-lg transition-all active:scale-95 ${
                isHighMatch ? 'bg-primary hover:bg-primary/90 shadow-primary/20' : ''
              }`}
              variant={isHighMatch ? "default" : "outline"}
            >
              Apply Now
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
