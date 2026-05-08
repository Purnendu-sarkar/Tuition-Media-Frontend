"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Plus,
  X,
  MapPin,
  Clock,
  User,
  Star,
  FileText,
  Sparkles,
  Wand2,
  BrainCircuit,
  ShieldCheck,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GuardianDashboardStats, CreateJobData, Application } from "@/lib/api/guardian";
import { guardianApi } from "@/lib/api/guardian";
import { aiApi } from "@/lib/api/ai";

interface GuardianDashboardProps {
  initialData: GuardianDashboardStats;
  token: string;
}

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

export function GuardianDashboard({ initialData, token }: GuardianDashboardProps) {
  const [data, setData] = useState<GuardianDashboardStats>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateJobData>({
    title: "",
    description: "",
    budget: undefined,
    location: ""
  });

  // Application Review States
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [appActionLoading, setAppActionLoading] = useState<string | null>(null);

  // AI Generation States
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "IN_PROGRESS":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "COMPLETED":
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await guardianApi.createJob(token, {
        ...formData,
        budget: formData.budget ? Number(formData.budget) : undefined
      });

      // Refresh dashboard data
      const updatedData = await guardianApi.getDashboardStats(token);
      setData(updatedData);

      setIsModalOpen(false);
      setFormData({ title: "", description: "", budget: undefined, location: "" });
    } catch (err: any) {
      setError(err.message || "Failed to create job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const generated = await aiApi.generateJobPost(token, aiPrompt);
      setFormData(prev => ({
        ...prev,
        title: generated.title,
        description: generated.description,
      }));
    } catch (err: any) {
      console.error("Failed to generate job post with AI:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewApplications = async (jobId: string) => {
    setSelectedJobId(jobId);
    setIsAppModalOpen(true);
    setIsLoadingApps(true);
    try {
      const apps = await guardianApi.getJobApplications(token, jobId);
      setApplications(apps);
    } catch (err: any) {
      console.error("Failed to load applications:", err);
    } finally {
      setIsLoadingApps(false);
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, status: "ACCEPTED" | "REJECTED") => {
    try {
      setAppActionLoading(appId);
      await guardianApi.updateApplicationStatus(token, appId, status);

      // Update local state
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status } : app));

      // Refresh dashboard stats if we accepted (which might change job status)
      if (status === "ACCEPTED") {
        const updatedData = await guardianApi.getDashboardStats(token);
        setData(updatedData);
      }
    } catch (err: any) {
      console.error("Failed to update application:", err);
    } finally {
      setAppActionLoading(null);
    }
  };

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        {/* Verification Status Banner */}
        {!data.stats.isVerified && (
          <motion.div variants={item}>
            <Card className={`p-4 border-l-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 ${data.stats.verificationStatus === "PENDING"
                ? "border-amber-500 bg-amber-500/5"
                : data.stats.verificationStatus === "REJECTED"
                  ? "border-red-500 bg-red-500/5"
                  : "border-primary bg-primary/5"
              }`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${data.stats.verificationStatus === "PENDING"
                    ? "bg-amber-500/10 text-amber-500"
                    : data.stats.verificationStatus === "REJECTED"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-primary/10 text-primary"
                  }`}>
                  {data.stats.verificationStatus === "PENDING" ? (
                    <ShieldAlert className="h-6 w-6" />
                  ) : (
                    <ShieldCheck className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {data.stats.verificationStatus === "PENDING"
                      ? "Verification Pending"
                      : data.stats.verificationStatus === "REJECTED"
                        ? "Verification Rejected"
                        : "Verify Your Identity"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {data.stats.verificationStatus === "PENDING"
                      ? "Your documents are under review. This usually takes 1-2 business days."
                      : data.stats.verificationStatus === "REJECTED"
                        ? "Your verification was rejected. Please review and try again."
                        : "Unlock trust and premium features by verifying your account."}
                  </p>
                </div>
              </div>
              <Link href="/dashboard/verification" className="shrink-0">
                <Button
                  variant={data.stats.verificationStatus === "REJECTED" ? "destructive" : "default"}
                  className="gap-2"
                >
                  {data.stats.verificationStatus === "REJECTED" ? "Try Again" : "Verify Now"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Card>
          </motion.div>
        )}

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">Overview</h2>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Post New Job
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <motion.div variants={item}>
            <Card className="p-6 h-full border-border bg-surface shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Total Posted Jobs</h3>
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Briefcase className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-semibold mt-4">{data.stats.totalPostedJobs}</p>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="p-6 h-full border-border bg-surface shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Active Jobs</h3>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-semibold mt-4">{data.stats.activeJobs}</p>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="p-6 h-full border-border bg-surface shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Total Applicants</h3>
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-semibold mt-4">{data.stats.totalApplicants}</p>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={item}>
          <Card className="border-border bg-surface overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold">Your Recent Jobs</h2>
            </div>
            <div className="p-0">
              {data.recentJobs.length > 0 ? (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border">
                      <tr>
                        <th className="px-6 py-4 font-medium">Job Title</th>
                        <th className="px-6 py-4 font-medium">Budget</th>
                        <th className="px-6 py-4 font-medium">Applicants</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentJobs.map((job) => (
                        <tr key={job.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-4 font-medium text-foreground">{job.title}</td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {job.budget ? `৳${job.budget.toLocaleString()}` : 'Negotiable'}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleViewApplications(job.id)}
                              className="inline-flex items-center gap-1 text-primary font-medium hover:bg-primary/10 px-2 py-1 rounded transition-colors"
                            >
                              <Users className="h-4 w-4" />
                              {job.applicantsCount} View
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClass(job.status)}`}>
                              {job.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>You haven&apos;t posted any tuition jobs yet.</p>
                  <Button onClick={() => setIsModalOpen(true)} className="mt-4" variant="outline">Create Your First Job</Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Post a New Tuition Job</h2>
                <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="mb-6 rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                  {error}
                </div>
              )}

              {/* AI Generator Section */}
              <div className="relative mb-6 overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl pointer-events-none -mr-10 -mt-10" />
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" /> AI Magic Generator
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="E.g., Need a math tutor for class 10, 3 days a week"
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    className="border-primary/20 bg-background/60 focus-visible:ring-primary/30"
                  />
                  <Button
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="shrink-0 shadow-[0_0_15px_rgba(15,118,110,0.25)] transition-all"
                  >
                    {isGenerating ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/20 border-t-primary-foreground" /> : <Wand2 className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Just type a quick requirement and let AI write a professional post.</p>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Job Title <span className="text-red-500">*</span></label>
                  <Input
                    id="title"
                    placeholder="e.g. Need a Math tutor for class 10"
                    value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    required
                    minLength={5}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description <span className="text-red-500">*</span></label>
                  <textarea
                    id="description"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe the student's needs, schedule, and any specific requirements..."
                    value={formData.description}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    required
                    minLength={20}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="budget" className="text-sm font-medium">Monthly Budget (৳)</label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="e.g. 5000"
                      value={formData.budget || ""}
                      onChange={e => setFormData(p => ({ ...p, budget: e.target.value ? Number(e.target.value) : undefined }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="e.g. Dhanmondi, Dhaka"
                        className="pl-9"
                        value={formData.location || ""}
                        onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Posting..." : "Post Job"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAppModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAppModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl rounded-2xl border border-border bg-surface p-6 shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <h2 className="text-xl font-semibold">Review Applications</h2>
                <button onClick={() => setIsAppModalOpen(false)} className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {isLoadingApps ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No applications received for this job yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <Card key={app.id} className="p-5 border-border bg-background/50 flex flex-col sm:flex-row gap-5">
                        <div className="flex-shrink-0">
                          <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
                            {app.tutor.image ? (
                              <img src={app.tutor.image} alt={app.tutor.name} className="h-full w-full object-cover" />
                            ) : (
                              <User className="h-6 w-6 text-primary" />
                            )}
                          </div>
                        </div>

                        <div className="flex-grow min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg text-foreground">{app.tutor.name}</h3>
                                {app.matchScore && (
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${app.matchScore >= 80 ? 'bg-primary/10 text-primary border-primary/20' :
                                      app.matchScore >= 60 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                        'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                                    }`}>
                                    <BrainCircuit className="h-3 w-3" />
                                    {app.matchScore}% Match
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                {app.tutor.tutorProfile?.location && (
                                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {app.tutor.tutorProfile.location}</span>
                                )}
                                {app.tutor.tutorProfile?.hourlyRate && (
                                  <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> ৳{app.tutor.tutorProfile.hourlyRate}/hr</span>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {app.status === "PENDING" ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                                    onClick={() => handleUpdateApplicationStatus(app.id, "REJECTED")}
                                    disabled={appActionLoading !== null}
                                  >
                                    {appActionLoading === app.id ? "..." : "Reject"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => handleUpdateApplicationStatus(app.id, "ACCEPTED")}
                                    disabled={appActionLoading !== null}
                                  >
                                    {appActionLoading === app.id ? "..." : "Accept"}
                                  </Button>
                                </>
                              ) : (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${app.status === "ACCEPTED" ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                  {app.status}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 text-sm text-muted-foreground bg-muted/10 p-4 rounded-lg border border-border/50">
                            <span className="block font-medium mb-1 text-foreground/80">Cover Letter:</span>
                            <p className="whitespace-pre-wrap">{app.coverLetter || "No cover letter provided."}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
