"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  ChevronLeft, 
  ShieldCheck, 
  Info,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Star
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicNavbar } from "@/components/layouts/public-navbar";
import { PublicFooter } from "@/components/layouts/public-footer";
import { jobApi, Job } from "@/lib/api/job";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function JobDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isTutor = session?.user?.role === "TUTOR";

  useEffect(() => {
    if (id) {
      fetchJobDetails();
      if (session?.accessToken && isTutor) {
        checkApplicationStatus();
      }
    }
  }, [id, session, isTutor]);

  const fetchJobDetails = async () => {
    try {
      setIsLoading(true);
      const data = await jobApi.getJobById(id as string);
      setJob(data);
    } catch (err) {
      console.error("Failed to fetch job details:", err);
      toast.error("Tuition job not found.");
      router.push("/jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const appliedIds = await jobApi.getAppliedJobs(session!.accessToken as string);
      if (appliedIds.includes(id as string)) {
        setHasApplied(true);
      }
    } catch (err) {
      console.error("Failed to check application status:", err);
    }
  };

  const handleApply = async () => {
    if (!session?.accessToken) {
      toast.error("Please sign in as a tutor to apply.");
      router.push("/signin");
      return;
    }

    setIsApplying(true);
    try {
      await jobApi.applyForJob(id as string, session.accessToken as string, { coverLetter });
      setHasApplied(true);
      setIsModalOpen(false);
      toast.success("Application submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application.");
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-medium">Loading job details...</p>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      <main className="container mx-auto max-w-5xl px-6 py-12 md:py-20">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-8 gap-2 -ml-4 text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to browsing
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 rounded-full px-4 py-1 font-bold">
                  Active Recruitment
                </Badge>
                <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 rounded-full px-4 py-1 font-bold">
                  Verified Post
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl font-black font-[var(--font-space-grotesk)] leading-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap gap-6 text-muted-foreground">
                <div className="flex items-center gap-2 font-medium">
                  <MapPin className="h-5 w-5 text-primary" />
                  {job.location}
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Clock className="h-5 w-5 text-primary" />
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Users className="h-5 w-5 text-primary" />
                  {job._count?.applications || 0} Applicants
                </div>
              </div>
            </div>

            <Card className="p-8 md:p-10 border-border/50 bg-surface shadow-xl rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                <FileText className="h-48 w-48 text-primary" />
              </div>
              
              <div className="space-y-8 relative z-10">
                <div>
                  <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Tuition Requirements
                  </h3>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-lg leading-relaxed text-foreground/80 whitespace-pre-wrap">
                      {job.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="p-5 rounded-2xl bg-muted/30 border border-border">
                    <div className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Proposed Budget</div>
                    <div className="text-2xl font-black text-primary flex items-baseline gap-1">
                      {job.budget ? `${job.budget}৳` : "Negotiable"}
                      <span className="text-xs font-medium text-muted-foreground">/month</span>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-muted/30 border border-border">
                    <div className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Safety & Trust</div>
                    <div className="flex items-center gap-2 text-emerald-600 font-bold">
                      <ShieldCheck className="h-5 w-5" />
                      Platform Protected
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar / Action Panel */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <Card className="p-6 border-primary/20 bg-primary/5 rounded-[2rem] shadow-lg">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {job.guardian.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-primary">Posted By</div>
                      <div className="font-black text-lg">{job.guardian.name}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {!isTutor && session && (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 font-medium leading-relaxed">
                          Only verified tutors can apply for tuition jobs. Please switch roles or create a tutor profile.
                        </p>
                      </div>
                    )}

                    {hasApplied ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl flex flex-col items-center text-center space-y-3">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                        <div>
                          <div className="font-black text-emerald-700">Already Applied</div>
                          <p className="text-xs text-emerald-600">You'll be notified if the guardian shortlists you.</p>
                        </div>
                      </div>
                    ) : (
                      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            disabled={!isTutor && !!session}
                          >
                            Apply for this Job
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-black font-[var(--font-space-grotesk)]">Submit Application</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-black text-muted-foreground uppercase tracking-widest px-1">
                                Cover Letter (Optional)
                              </label>
                              <Textarea 
                                placeholder="Tell the guardian why you are the best fit for this position..."
                                className="min-h-[150px] rounded-2xl p-4 text-base focus-visible:ring-primary/20"
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                              />
                            </div>
                            <div className="bg-primary/5 p-4 rounded-xl flex items-start gap-3">
                              <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                              <p className="text-xs text-primary/80 font-medium">
                                Your verified profile details (education, location, rating) will be shared with the guardian.
                              </p>
                            </div>
                            <Button 
                              onClick={handleApply} 
                              className="w-full h-14 rounded-xl font-black text-lg"
                              disabled={isApplying}
                            >
                              {isApplying ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Confirm Application"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-border rounded-2xl space-y-4">
                <h4 className="font-bold flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  Premium Tip
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tutors with complete profiles and high AI-Match scores are 3x more likely to get hired.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
