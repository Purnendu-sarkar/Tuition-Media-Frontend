"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldCheck, AlertTriangle, Check, X, Camera, FileText } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { verificationApi } from "@/lib/api/verification";
import type { VerificationDocument } from "@/lib/api/verification";

export default function AdminVerificationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [pending, setPending] = useState<VerificationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchPending();
    }
  }, [status, session]);

  const fetchPending = async () => {
    if (!session?.accessToken) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await verificationApi.getPendingVerifications(session.accessToken);
      setPending(res.pending);
    } catch (error) {
      console.error("Failed to fetch pending verifications", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (id: string, reviewStatus: "APPROVED" | "REJECTED") => {
    if (!session?.accessToken) return;
    try {
      setActionLoading(id);
      await verificationApi.reviewVerification(session.accessToken, id, { status: reviewStatus });
      setPending(prev => prev.filter(doc => doc.id !== id));
    } catch (error) {
      console.error("Failed to review verification", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score < 70) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-indigo-500" />
              Verification Review
            </h1>
            <p className="text-muted-foreground mt-1">Review tutor identities and AI risk assessments.</p>
          </div>
          <div className="bg-surface border border-border px-4 py-2 rounded-lg flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">{pending.length}</span>
            <span className="text-sm text-muted-foreground">Pending in Queue</span>
          </div>
        </div>

        <div className="space-y-6">
          <AnimatePresence>
            {pending.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-surface rounded-xl border border-border"
              >
                <ShieldCheck className="h-16 w-16 mx-auto text-emerald-500 mb-4 opacity-50" />
                <h2 className="text-xl font-semibold mb-2">All caught up!</h2>
                <p className="text-muted-foreground">There are no pending verifications to review.</p>
              </motion.div>
            ) : (
              pending.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden border-border bg-surface shadow-md">
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row gap-8">
                        {/* User Info & Risk Score */}
                        <div className="lg:w-1/3 flex flex-col gap-6">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
                              {doc.user?.image ? (
                                <img src={doc.user.image} alt={doc.user.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-2xl font-bold">{doc.user?.name.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold">{doc.user?.name}</h3>
                              <p className="text-sm text-muted-foreground">{doc.user?.email}</p>
                              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-muted">ID: {doc.userId.slice(-6)}</span>
                            </div>
                          </div>

                          <div className="bg-background rounded-xl p-5 border border-border">
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">AI Risk Assessment</h4>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-3xl font-bold">{doc.aiRiskScore}<span className="text-lg text-muted-foreground">/100</span></span>
                              <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 ${getRiskColor(doc.aiRiskScore).split(' ')[2]} ${getRiskColor(doc.aiRiskScore).split(' ')[1]}`}>
                                {doc.aiRiskScore > 70 ? <AlertTriangle className={`h-6 w-6 ${getRiskColor(doc.aiRiskScore).split(' ')[0]}`} /> : <ShieldCheck className={`h-6 w-6 ${getRiskColor(doc.aiRiskScore).split(' ')[0]}`} />}
                              </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 mt-4">
                              <div 
                                className={`h-2 rounded-full ${doc.aiRiskScore > 70 ? 'bg-red-500' : doc.aiRiskScore > 30 ? 'bg-yellow-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${doc.aiRiskScore}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                              {doc.aiRiskScore > 70 ? "High risk of manipulation or face mismatch detected." : doc.aiRiskScore > 30 ? "Medium risk. Please review documents carefully." : "Low risk. Faces appear to match and ID looks valid."}
                            </p>
                            
                            <div className="mt-4 pt-4 border-t border-border space-y-2">
                              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tracking & OCR Details</h5>
                              <p className="text-sm"><strong>IP:</strong> {doc.ipAddress || "Unknown"}</p>
                              <p className="text-sm"><strong>Device:</strong> {doc.deviceFingerprint?.slice(0,10) || "Unknown"}...</p>
                              <p className="text-sm"><strong>OCR Confidence:</strong> {doc.ocrConfidence ? `${doc.ocrConfidence.toFixed(1)}%` : "N/A"}</p>
                              {doc.extractedData && (
                                <div className="mt-2 text-xs bg-muted/50 p-2 rounded-md max-h-24 overflow-y-auto">
                                  <strong>Extracted Text:</strong> {doc.extractedData.text || JSON.stringify(doc.extractedData)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-3 mt-auto pt-4">
                            <Button 
                              variant="outline" 
                              className="flex-1 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                              onClick={() => handleReview(doc.id, "REJECTED")}
                              disabled={actionLoading !== null}
                            >
                              {actionLoading === doc.id ? "..." : <><X className="mr-2 h-4 w-4" /> Reject</>}
                            </Button>
                            <Button 
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleReview(doc.id, "APPROVED")}
                              disabled={actionLoading !== null}
                            >
                              {actionLoading === doc.id ? "..." : <><Check className="mr-2 h-4 w-4" /> Approve</>}
                            </Button>
                          </div>
                        </div>

                        {/* Documents */}
                        <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex flex-col">
                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> ID Document</h4>
                            <div className="flex-1 bg-muted/30 rounded-xl border border-border overflow-hidden min-h-[250px] relative group">
                              <img src={doc.idPhotoUrl} alt="ID Document" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x250?text=Invalid+Image+URL' }} />
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2"><Camera className="h-4 w-4 text-primary" /> Live Face Photo</h4>
                            <div className="flex-1 bg-muted/30 rounded-xl border border-border overflow-hidden min-h-[250px] relative group">
                              <img src={doc.facePhotoUrl} alt="Live Face" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x250?text=Invalid+Image+URL' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
