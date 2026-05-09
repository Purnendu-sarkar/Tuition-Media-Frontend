"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { supportApi } from "@/lib/api/support";
import { AlertCircle, CheckCircle2 } from "lucide-react";

function ReportForm() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [reportedId, setReportedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const idFromUrl = searchParams.get("reportedId");
    if (idFromUrl) {
      setReportedId(idFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;

    setLoading(true);
    setStatus("idle");
    try {
      await supportApi.createReport(session.accessToken, {
        reason,
        description,
        reportedId: reportedId || undefined,
      });
      setStatus("success");
      setReason("");
      setDescription("");
      setReportedId("");
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.message || "Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-bold font-[var(--font-space-grotesk)] text-foreground tracking-tight flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-500" />
          Report an Issue
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          If you have encountered inappropriate behavior, scam attempts, or any other violations, please let us know.
        </p>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm">
        {status === "success" && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="font-medium">Report submitted successfully. Our team will review it shortly.</p>
          </div>
        )}

        {status === "error" && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Reason for Report</label>
            <select
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-4 rounded-2xl border border-border/50 bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground appearance-none"
            >
              <option value="" disabled>Select a reason...</option>
              <option value="inappropriate_behavior">Inappropriate Behavior</option>
              <option value="scam_fraud">Scam or Fraud</option>
              <option value="fake_profile">Fake Profile</option>
              <option value="harassment">Harassment</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">User ID to Report (Optional)</label>
            <input
              type="text"
              placeholder="e.g. clt123xyz0000"
              value={reportedId}
              onChange={(e) => setReportedId(e.target.value)}
              className="w-full p-4 rounded-2xl border border-border/50 bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
            <p className="text-[11px] text-muted-foreground/80 mt-1.5 px-2">
              💡 <strong>Hint:</strong> You can find the User ID at the end of their profile URL (e.g., /tutors/<span className="text-primary font-mono">clt12...</span>). 
              If you click the "Report User" button directly from their profile, this field will be filled automatically.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Description</label>
            <textarea
              required
              rows={5}
              placeholder="Please provide details about your report..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-2xl border border-border/50 bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !session?.accessToken}
            className="w-full py-4 px-6 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>

        {!session?.accessToken && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            You must be logged in to submit a report.
          </p>
        )}
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center animate-pulse">Loading form...</div>}>
      <ReportForm />
    </Suspense>
  );
}
