"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flag, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MoreVertical,
  Filter,
  Search,
  ArrowRight
} from "lucide-react";
import { adminApi, AdminReport } from "@/lib/api/admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminReportsPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    if (session?.accessToken) {
      fetchReports();
    }
  }, [session]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getReports(session?.accessToken!);
      setReports(res.reports);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminApi.updateReportStatus(session?.accessToken!, id, status);
      toast.success(`Report marked as ${status.toLowerCase()}`);
      fetchReports();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const filteredReports = reports.filter(r => filter === "ALL" || r.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "REVIEWING": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "RESOLVED": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "DISMISSED": return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      default: return "";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Flag className="w-8 h-8 text-red-500" />
            User Moderation
          </h1>
          <p className="text-muted-foreground mt-1">Review and manage community reports</p>
        </div>

        <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-border">
          {["ALL", "PENDING", "REVIEWING", "RESOLVED", "DISMISSED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filter === f ? "bg-primary text-white shadow-lg" : "hover:bg-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-muted/20 animate-pulse rounded-3xl border border-border" />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <Card className="p-20 text-center border-dashed">
          <Flag className="w-16 h-16 mx-auto mb-4 opacity-10" />
          <h3 className="text-xl font-bold">No reports found</h3>
          <p className="text-muted-foreground">Everything looks clean!</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {filteredReports.map((report) => (
              <motion.div
                key={report.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="overflow-hidden border-border bg-surface hover:shadow-xl transition-all duration-300 rounded-3xl">
                  <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                    {/* Status & Category */}
                    <div className="md:w-48 space-y-4">
                      <Badge className={`${getStatusColor(report.status)} border px-3 py-1 font-bold uppercase tracking-widest text-[10px]`}>
                        {report.status}
                      </Badge>
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Report Reason</div>
                        <div className="font-bold text-sm text-red-500 capitalize">{report.reason.replace(/_/g, ' ')}</div>
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Parties Involved */}
                    <div className="flex-1 space-y-6">
                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-12">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-bold text-muted-foreground">Reporter</div>
                            <div className="font-bold text-sm">{report.reporter.name}</div>
                          </div>
                        </div>

                        <ArrowRight className="hidden sm:block w-5 h-5 text-muted-foreground/30" />

                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-bold text-muted-foreground">Reported User</div>
                            <div className="font-bold text-sm">{report.reported?.name || "Anonymous/ID: " + (report.reportedId || 'Unknown')}</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 italic text-sm text-muted-foreground leading-relaxed">
                        "{report.description}"
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2 justify-center">
                      {report.status === "PENDING" && (
                        <Button 
                          size="sm" 
                          className="rounded-xl bg-blue-500 hover:bg-blue-600"
                          onClick={() => handleUpdateStatus(report.id, "REVIEWING")}
                        >
                          Start Review
                        </Button>
                      )}
                      {(report.status === "PENDING" || report.status === "REVIEWING") && (
                        <>
                          <Button 
                            size="sm" 
                            className="rounded-xl bg-emerald-500 hover:bg-emerald-600"
                            onClick={() => handleUpdateStatus(report.id, "RESOLVED")}
                          >
                            Resolve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl"
                            onClick={() => handleUpdateStatus(report.id, "DISMISSED")}
                          >
                            Dismiss
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
