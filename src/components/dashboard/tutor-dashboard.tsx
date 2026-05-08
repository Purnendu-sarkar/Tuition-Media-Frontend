"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Eye,
  DollarSign,
  Star,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck as ShieldCheckIcon,
  BrainCircuit,
  Sparkles,
  Wand2,
  BookOpen,
  MessageSquare,
  Search,
  Loader2
} from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DashboardStats } from "@/lib/api/tutor";
import { aiApi } from "@/lib/api/ai";

interface TutorDashboardProps {
  data: DashboardStats;
  token: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function TutorDashboard({ data, token }: TutorDashboardProps) {
  // AI Interview States
  const [interviewSubject, setInterviewSubject] = useState("");
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [isInterviewLoading, setIsInterviewLoading] = useState(false);

  // AI Resources States
  const [resourceSubject, setResourceSubject] = useState("");
  const [resourceGuide, setResourceGuide] = useState<string | null>(null);
  const [isResourceLoading, setIsResourceLoading] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "PENDING":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "REJECTED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const handleGenerateInterview = async () => {
    if (!interviewSubject.trim()) return;
    setIsInterviewLoading(true);
    setInterviewQuestions([]);
    try {
      const res = await aiApi.generateInterview(token, interviewSubject);
      setInterviewQuestions(res.questions);
    } catch (err) {
      console.error("Failed to generate interview:", err);
    } finally {
      setIsInterviewLoading(false);
    }
  };

  const handleGenerateResources = async () => {
    if (!resourceSubject.trim()) return;
    setIsResourceLoading(true);
    setResourceGuide(null);
    try {
      const res = await aiApi.generateResources(token, resourceSubject);
      setResourceGuide(res.guide);
    } catch (err) {
      console.error("Failed to generate resources:", err);
    } finally {
      setIsResourceLoading(false);
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-20"
    >
      {!data.profileStatus.isProfileComplete && (
        <motion.div variants={item}>
          <Card className="overflow-hidden border-border bg-surface shadow-xl relative group">
            {/* Background Decorative Pattern */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
              <Star className="h-40 w-40 text-primary rotate-12" />
            </div>

            <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center relative z-10">
              {/* Progress Ring Section */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="h-32 w-32 -rotate-90">
                  <circle
                    className="text-muted/20"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="64"
                    cy="64"
                  />
                  <motion.circle
                    className="text-primary"
                    strokeWidth="8"
                    strokeDasharray={364.4}
                    initial={{ strokeDashoffset: 364.4 }}
                    animate={{ strokeDashoffset: 364.4 - (364.4 * data.profileStatus.completenessScore) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-foreground">{data.profileStatus.completenessScore}%</span>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Complete</span>
                </div>
              </div>

              {/* Text & Steps Section */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-black font-[var(--font-space-grotesk)] text-foreground tracking-tight">Complete your profile</h3>
                  <p className="text-muted-foreground mt-1 text-sm max-w-xl">
                    Guardians are <span className="text-foreground font-bold underline decoration-primary/50 underline-offset-4">5x more likely</span> to hire tutors with 100% complete profiles. Boost your visibility today!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.profileStatus.missingSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50">
                      <div className="h-4 w-4 rounded-full border-2 border-primary/30 flex items-center justify-center shrink-0">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/20" />
                      </div>
                      {step}
                    </div>
                  ))}
                  {data.profileStatus.completenessScore >= 80 && (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="h-4 w-4" /> You're almost there!
                    </div>
                  )}
                </div>
              </div>

              {/* Action Section */}
              <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto">
                <Link href="/dashboard/profile" className="w-full">
                  <Button size="lg" className="w-full h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all group">
                    Optimize Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button variant="ghost" className="text-xs font-bold text-muted-foreground hover:text-foreground">
                  Dismiss for now
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Verification Status Banner */}
      {!data.profileStatus.isVerified && (
        <motion.div variants={item}>
          <Card className={`p-4 border-l-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 ${data.profileStatus.verificationStatus === "PENDING"
              ? "border-amber-500 bg-amber-500/5"
              : data.profileStatus.verificationStatus === "REJECTED"
                ? "border-red-500 bg-red-500/5"
                : "border-blue-500 bg-blue-500/5"
            }`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${data.profileStatus.verificationStatus === "PENDING"
                  ? "bg-amber-500/10 text-amber-500"
                  : data.profileStatus.verificationStatus === "REJECTED"
                    ? "bg-red-500/10 text-red-500"
                    : "bg-blue-500/10 text-blue-500"
                }`}>
                {data.profileStatus.verificationStatus === "PENDING" ? (
                  <ShieldCheckIcon className="h-6 w-6" />
                ) : (
                  <ShieldCheckIcon className="h-6 w-6" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {data.profileStatus.verificationStatus === "PENDING"
                    ? "Verification Pending"
                    : data.profileStatus.verificationStatus === "REJECTED"
                      ? "Verification Rejected"
                      : "Get Verified"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {data.profileStatus.verificationStatus === "PENDING"
                    ? "Your documents are under review. This usually takes 1-2 business days."
                    : data.profileStatus.verificationStatus === "REJECTED"
                      ? "Your verification was rejected. Please review and try again."
                      : "Boost your visibility by verifying your identity. Verified tutors get up to 3x more jobs."}
                </p>
              </div>
            </div>
            <Link href="/dashboard/verification" className="shrink-0">
              <Button
                variant={data.profileStatus.verificationStatus === "REJECTED" ? "destructive" : "outline"}
                className={`gap-2 ${data.profileStatus.verificationStatus === null ? 'border-blue-500/50 hover:bg-blue-500/20 text-blue-500' : ''}`}
              >
                {data.profileStatus.verificationStatus === "REJECTED" ? "Try Again" : "Start Verification"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <Card className="p-6 h-full border-border bg-surface shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Active Applications</h3>
              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-semibold mt-4">{data.stats.activeApplications}</p>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6 h-full border-border bg-surface shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Profile Views</h3>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                <Eye className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-semibold mt-4">{data.stats.profileViews}</p>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6 h-full border-border bg-surface shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Total Earnings</h3>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-semibold mt-4">৳{data.stats.totalEarnings.toLocaleString()}</p>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6 h-full border-border bg-surface shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Average Rating</h3>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                <Star className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-semibold mt-4">{data.stats.averageRating}</p>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Applications - Takes 2 cols on large */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="h-full border-border bg-surface overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Applications</h2>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="p-0">
              {data.recentApplications.length > 0 ? (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border">
                      <tr>
                        <th className="px-6 py-4 font-medium">Job Title</th>
                        <th className="px-6 py-4 font-medium">Budget</th>
                        <th className="px-6 py-4 font-medium">Applied Date</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentApplications.map((app) => (
                        <tr key={app.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-4 font-medium text-foreground">{app.jobTitle}</td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {app.budget ? `৳${app.budget.toLocaleString()}` : 'Negotiable'}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClass(app.status)}`}>
                              {getStatusIcon(app.status)}
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>You haven&apos;t applied to any jobs yet.</p>
                  <Button className="mt-4" variant="outline">Browse Jobs</Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* AI Toolkit - Takes 1 col */}
        <motion.div variants={item} className="space-y-6">
          <Card className="p-6 border-primary/20 bg-primary/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl pointer-events-none -mr-10 -mt-10" />
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" /> AI Power Tools
            </h2>

            <div className="space-y-4">
               {/* Interview Prep */}
               <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                     <BrainCircuit className="h-4 w-4 text-primary" /> AI Interview Prep
                  </label>
                  <div className="flex gap-2">
                     <Input 
                        placeholder="Subject (e.g. Physics)" 
                        value={interviewSubject}
                        onChange={e => setInterviewSubject(e.target.value)}
                        className="bg-background/50 h-11"
                     />
                     <Button 
                        size="icon" 
                        className="shrink-0 h-11 w-11"
                        onClick={handleGenerateInterview}
                        disabled={isInterviewLoading || !interviewSubject}
                     >
                        {isInterviewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                     </Button>
                  </div>
                  <AnimatePresence>
                    {interviewQuestions.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-2 mt-4 p-4 rounded-xl bg-background/80 border border-primary/10"
                      >
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Practice Questions</h4>
                        {interviewQuestions.map((q, i) => (
                           <div key={i} className="flex gap-2 text-sm text-muted-foreground group/q">
                              <span className="text-primary font-bold">{i+1}.</span>
                              <p className="group-hover/q:text-foreground transition-colors">{q}</p>
                           </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>

               <div className="h-px bg-primary/10 my-4" />

               {/* Learning Resources */}
               <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                     <BookOpen className="h-4 w-4 text-primary" /> Teaching Guide
                  </label>
                  <div className="flex gap-2">
                     <Input 
                        placeholder="Topic (e.g. Calculus)" 
                        value={resourceSubject}
                        onChange={e => setResourceSubject(e.target.value)}
                        className="bg-background/50 h-11"
                     />
                     <Button 
                        size="icon" 
                        variant="outline"
                        className="shrink-0 h-11 w-11 border-primary/20 hover:bg-primary/5"
                        onClick={handleGenerateResources}
                        disabled={isResourceLoading || !resourceSubject}
                     >
                        {isResourceLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
                     </Button>
                  </div>
                  
                  <AnimatePresence>
                    {resourceGuide && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 p-4 rounded-xl bg-background/80 border border-primary/10 text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed custom-scrollbar max-h-60 overflow-y-auto"
                      >
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">AI Teaching Tips</h4>
                        {resourceGuide}
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </div>
          </Card>

          <Card className="p-6 border-border bg-surface hover:shadow-lg transition-all duration-300">
             <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                   <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                   <h3 className="font-bold">Smart Alerts</h3>
                   <p className="text-xs text-muted-foreground">AI matching is active</p>
                </div>
             </div>
             <p className="text-sm text-muted-foreground">
                You'll automatically receive notifications when jobs matching your skills are posted. 
                <span className="text-primary font-semibold"> 12 matched today.</span>
             </p>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
