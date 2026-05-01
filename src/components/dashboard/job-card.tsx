"use client";

import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock, Users, BrainCircuit, CheckCircle2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Job } from "@/lib/api/job";

interface JobCardProps {
  job: Job;
  hasApplied: boolean;
  onApplyClick: (job: Job) => void;
  matchScore?: number; // Simulated AI score for UI completeness
}

export function JobCard({ job, hasApplied, onApplyClick, matchScore = 0 }: JobCardProps) {
  // Format date nicely
  const postedDate = new Date(job.createdAt).toLocaleDateString("en-BD", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col p-5 sm:p-6 border-border bg-surface shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
        
        {/* Match Score Indicator (Visual Flairs) */}
        {matchScore > 0 && (
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BrainCircuit className="h-24 w-24 text-primary" />
          </div>
        )}

        <div className="relative z-10 flex-1">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-lg text-foreground line-clamp-2 leading-snug">
                {job.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                Posted by {job.guardian.name}
              </p>
            </div>
            
            {matchScore > 0 && (
              <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                matchScore >= 80 ? 'bg-primary/10 text-primary border-primary/20' : 
                matchScore >= 60 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
              }`}>
                <BrainCircuit className="h-3 w-3" />
                {matchScore}% Match
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm">
            <span className="flex items-center text-muted-foreground">
              <MapPin className="mr-1.5 h-4 w-4 text-rose-500" />
              {job.location || "Negotiable Location"}
            </span>
            <span className="flex items-center text-muted-foreground">
              <DollarSign className="mr-1.5 h-4 w-4 text-emerald-500" />
              {job.budget ? `৳${job.budget.toLocaleString()}` : "Negotiable"}
            </span>
            <span className="flex items-center text-muted-foreground">
              <Clock className="mr-1.5 h-4 w-4 text-blue-500" />
              {postedDate}
            </span>
            <span className="flex items-center text-muted-foreground">
              <Users className="mr-1.5 h-4 w-4 text-amber-500" />
              {job._count.applications} applied
            </span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-6">
            {job.description}
          </p>
        </div>

        <div className="relative z-10 mt-auto pt-4 border-t border-border flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            job.status === "OPEN" ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${job.status === "OPEN" ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
            {job.status}
          </span>

          {hasApplied ? (
            <span className="inline-flex items-center text-sm font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-md">
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Applied
            </span>
          ) : (
            <Button 
              onClick={() => onApplyClick(job)}
              disabled={job.status !== "OPEN"}
              variant={matchScore >= 80 ? "default" : "outline"}
            >
              Apply Now
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
