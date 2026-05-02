"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, CheckCircle2, XCircle, FileText, UserCircle, MapPin, Users, MessageSquare } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { guardianApi, Application } from "@/lib/api/guardian";
import { messageApi } from "@/lib/api/messages";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Job {
  id: string;
  title: string;
}

function HiringContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialJobId = searchParams?.get("job");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId || "");
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAppsLoading, setIsAppsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);

  useEffect(() => {
    async function fetchJobs() {
      if (!session?.accessToken) return;
      try {
        const data = await guardianApi.getAllJobs(session.accessToken);
        setJobs(data);
        if (data.length > 0 && !selectedJobId) {
          setSelectedJobId(data[0].id);
        }
      } catch (err) {
        setError("Failed to load jobs.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchJobs();
  }, [session?.accessToken]);

  useEffect(() => {
    async function fetchApplications() {
      if (!session?.accessToken || !selectedJobId) return;
      setIsAppsLoading(true);
      try {
        const data = await guardianApi.getJobApplications(session.accessToken, selectedJobId);
        setApplications(data);
      } catch (err) {
        setError("Failed to load applications.");
      } finally {
        setIsAppsLoading(false);
      }
    }
    fetchApplications();
  }, [session?.accessToken, selectedJobId]);

  const handleUpdateStatus = async (appId: string, status: "ACCEPTED" | "REJECTED") => {
    if (!session?.accessToken) return;
    setIsUpdating(true);
    try {
      await guardianApi.updateApplicationStatus(session.accessToken, appId, status);
      setApplications(prev => prev.map(app =>
        app.id === appId ? { ...app, status } : app
      ));
      if (selectedApp?.id === appId) {
        setSelectedApp(prev => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      alert("Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMessageTutor = async (tutorId: string) => {
    if (!session?.accessToken) return;
    setIsMessaging(true);
    try {
      await messageApi.initiateConversation(session.accessToken, tutorId);
      router.push("/dashboard/messages");
    } catch (err) {
      alert("Failed to initiate chat.");
    } finally {
      setIsMessaging(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold font-[var(--font-space-grotesk)] text-foreground tracking-tight">Review Applicants</h1>
          <p className="text-muted-foreground mt-1">Review AI Match Scores and hire the best tutor.</p>
        </div>
        <div className="w-full sm:w-72">
          <label className="text-sm font-medium text-foreground mb-1.5 block">Select Job Post</label>
          <Select value={selectedJobId} onValueChange={setSelectedJobId}>
            <SelectTrigger className="w-full h-11">
              <SelectValue placeholder="Select a job" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map(job => (
                <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applications List */}
      <div className="min-h-[400px]">
        {isAppsLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20 px-4 bg-muted/30 rounded-2xl border border-dashed border-border">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No applications yet</h3>
            <p className="text-muted-foreground">When tutors apply to this job, they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {applications.map((app, i) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {app.tutor.image ? (
                            <img src={app.tutor.image} alt={app.tutor.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              <UserCircle className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-lg text-foreground">{app.tutor.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground mt-0.5">
                              <MapPin className="w-3.5 h-3.5 mr-1" />
                              {app.tutor.tutorProfile?.location || "Not specified"}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-sm font-semibold">
                            <BrainCircuit className="w-4 h-4" />
                            {Math.round(app.matchScore)}% Match
                          </div>
                          <Badge
                            className={
                              app.status === "ACCEPTED"
                                ? "bg-emerald-500 text-white"
                                : app.status === "REJECTED"
                                ? "bg-red-500 text-white"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {app.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-muted/30 p-4 rounded-xl mb-4 border border-border/50">
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4 shrink-0 mt-0.5" />
                          <p className="line-clamp-2 italic">
                            {app.coverLetter || "No cover letter provided."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <div className="text-sm font-medium text-foreground">
                          <span className="text-muted-foreground font-normal">Rate: </span>
                          ৳{app.tutor.tutorProfile?.hourlyRate || "N/A"}/hr
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApp(app)}
                          className="border-primary/30 text-primary hover:bg-primary/10"
                        >
                          Review Application
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              Review Application
              {selectedApp && (
                <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-semibold">
                  <BrainCircuit className="w-3.5 h-3.5" />
                  {Math.round(selectedApp.matchScore)}% Match
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-5 pt-4">
              <div className="flex items-center gap-4">
                {selectedApp.tutor.image ? (
                  <img src={selectedApp.tutor.image} alt={selectedApp.tutor.name} className="w-16 h-16 rounded-full object-cover ring-4 ring-muted" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <UserCircle className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedApp.tutor.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedApp.tutor.tutorProfile?.location}</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    Expected Rate: ৳{selectedApp.tutor.tutorProfile?.hourlyRate}/hr
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Cover Letter</h4>
                <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground leading-relaxed border border-border">
                  {selectedApp.coverLetter || "The tutor did not provide a cover letter."}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Tutor Bio</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedApp.tutor.tutorProfile?.bio || "No bio available."}
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                {selectedApp.status === "PENDING" && (
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleUpdateStatus(selectedApp.id, "ACCEPTED")}
                      disabled={isUpdating}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Accept & Hire
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleUpdateStatus(selectedApp.id, "REJECTED")}
                      disabled={isUpdating}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
                {selectedApp.status !== "PENDING" && (
                  <div className="text-center pb-2">
                    <Badge className={selectedApp.status === "ACCEPTED" ? "bg-emerald-500 text-white text-sm py-1.5 px-4" : "bg-red-500 text-white text-sm py-1.5 px-4"}>
                      You have {selectedApp.status.toLowerCase()} this application
                    </Badge>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => handleMessageTutor(selectedApp.tutorId)}
                  disabled={isMessaging}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message Tutor
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function GuardianHiringPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
      </div>
    }>
      <HiringContent />
    </Suspense>
  );
}
