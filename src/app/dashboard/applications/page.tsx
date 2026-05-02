"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  MapPin,
  DollarSign,
  FileText,
  AlertCircle,
  Loader2,
  MessageSquare
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { jobApi } from "@/lib/api/job";
import { messageApi } from "@/lib/api/messages";
import { useRouter } from "next/navigation";

interface Application {
  id: string;
  jobId: string;
  coverLetter: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  job: {
    title: string;
    location: string | null;
    budget: number | null;
    guardian: {
      id: string;
      name: string;
      image: string | null;
    };
  };
}

export default function MyApplicationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMessaging, setIsMessaging] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.accessToken) {
      fetchApplications();
    }
  }, [session?.accessToken]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      if (session?.accessToken) {
        const data = await jobApi.getMyApplications(session.accessToken);
        setApplications(data);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async (guardianId: string) => {
    if (!session?.accessToken) return;
    setIsMessaging(true);
    try {
      await messageApi.initiateConversation(session.accessToken, guardianId);
      router.push("/dashboard/messages");
    } catch (error) {
      alert("Failed to start conversation. Please try again.");
    } finally {
      setIsMessaging(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "REJECTED":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle2 className="h-4 w-4" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-[var(--font-space-grotesk)] text-foreground">
            My Applications
          </h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your tuition job applications.
          </p>
        </div>
        <div className="hidden sm:flex gap-4">
          <div className="bg-surface px-4 py-2 rounded-2xl border border-border">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Total
            </p>
            <p className="text-xl font-bold">{applications.length}</p>
          </div>
          <div className="bg-surface px-4 py-2 rounded-2xl border border-border">
            <p className="text-xs text-emerald-500 font-medium uppercase tracking-wider">
              Accepted
            </p>
            <p className="text-xl font-bold">
              {applications.filter((a) => a.status === "ACCEPTED").length}
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">
            Fetching your applications...
          </p>
        </div>
      ) : applications.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center bg-surface border-dashed">
          <div className="p-4 rounded-full bg-muted/30 mb-4">
            <Briefcase className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-lg font-semibold">No applications yet</h3>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
            Start browsing jobs and apply to find your perfect tuition match.
          </p>
          <Button
            variant="default"
            className="mt-6"
            onClick={() => (window.location.href = "/dashboard/jobs")}
          >
            Browse Jobs
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app, index) => (
            <motion.div
              key={app.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden border-border bg-surface hover:shadow-md transition-all duration-300">
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        <Briefcase className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg leading-tight">
                          {app.job.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                          Posted by{" "}
                          <span className="font-medium text-foreground">
                            {app.job.guardian.name}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${getStatusStyle(
                          app.status,
                        )}`}
                      >
                        {getStatusIcon(app.status)}
                        {app.status}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setExpandedId(expandedId === app.id ? null : app.id)
                        }
                        className={`rounded-full hover:bg-muted transition-transform duration-300 ${
                          expandedId === app.id ? "rotate-180 bg-muted" : ""
                        }`}
                      >
                        <ChevronDown className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                      <MapPin className="h-3.5 w-3.5 text-rose-500" />
                      {app.job.location || "Negotiable"}
                    </span>
                    <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                      {app.job.budget
                        ? `৳${app.job.budget.toLocaleString()}`
                        : "Negotiable"}
                    </span>
                    <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg ml-auto sm:ml-0">
                      <Clock className="h-3.5 w-3.5 text-blue-500" />
                      Applied on{" "}
                      {new Date(app.createdAt).toLocaleDateString("en-BD", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === app.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border bg-muted/20"
                    >
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-4 text-sm font-bold text-foreground">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          Submitted Message
                        </div>
                        <div className="bg-background/80 p-5 rounded-2xl border border-border text-sm leading-relaxed text-muted-foreground shadow-inner">
                          {app.coverLetter ? (
                            <p className="whitespace-pre-wrap">
                              {app.coverLetter}
                            </p>
                          ) : (
                            <p className="italic opacity-60 text-center py-4">
                              No message was submitted with this application.
                            </p>
                          )}
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-surface border border-border shadow-sm gap-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-2.5 rounded-full ${getStatusStyle(
                                app.status,
                              )}`}
                            >
                              {getStatusIcon(app.status)}
                            </div>
                            <div>
                              <p className="text-sm font-bold">
                                Current Status: {app.status}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {app.status === "PENDING"
                                  ? "The guardian is currently reviewing your profile and message."
                                  : app.status === "ACCEPTED"
                                  ? "Congratulations! The guardian has accepted your application."
                                  : "The guardian has decided to move forward with another tutor."}
                              </p>
                            </div>
                          </div>
                          {app.status === "ACCEPTED" && (
                            <Button 
                              onClick={() => handleStartChat(app.job.guardian.id)}
                              disabled={isMessaging}
                              className="bg-primary text-primary-foreground hover:scale-105 transition-transform"
                            >
                              {isMessaging ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <MessageSquare className="h-4 w-4 mr-2" />
                              )}
                              Start Conversation
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
