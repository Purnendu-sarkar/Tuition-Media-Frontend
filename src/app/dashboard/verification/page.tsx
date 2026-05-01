"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, Camera, FileText, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { verificationApi } from "@/lib/api/verification";
import type { VerificationDocument } from "@/lib/api/verification";

export default function TutorVerificationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [doc, setDoc] = useState<VerificationDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [idPhotoUrl, setIdPhotoUrl] = useState("");
  const [facePhotoUrl, setFacePhotoUrl] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated" && session.user.role !== "TUTOR") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchMyVerification();
    }
  }, [status, session]);

  const fetchMyVerification = async () => {
    if (!session?.user?.accessToken) return;
    try {
      setIsLoading(true);
      const res = await verificationApi.getMyVerification(session.user.accessToken);
      setDoc(res.verification);
    } catch (error) {
      console.error("Failed to fetch verification", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.accessToken) return;
    
    setError("");
    setIsSubmitting(true);
    
    try {
      await verificationApi.submitVerification(session.user.accessToken, {
        idPhotoUrl,
        facePhotoUrl
      });
      await fetchMyVerification();
    } catch (err: any) {
      setError(err.message || "Failed to submit verification. Ensure URLs are valid.");
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Identity Verification
          </h1>
          <p className="text-muted-foreground mt-1">Verify your identity to get the "Verified" badge and land more jobs.</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 md:p-8 border-border bg-surface shadow-lg">
            {doc ? (
              <div className="text-center space-y-6 py-8">
                {doc.status === "PENDING" && (
                  <>
                    <div className="mx-auto w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                      <ShieldAlert className="h-12 w-12 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Verification Under Review</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Your identity documents are currently being analyzed by our AI system and reviewed by administrators. This usually takes 1-2 business days.
                    </p>
                  </>
                )}
                {doc.status === "APPROVED" && (
                  <>
                    <div className="mx-auto w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                      <ShieldCheck className="h-12 w-12 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-emerald-500">You are Verified!</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Congratulations! Your identity has been verified. You now have a verified badge on your profile which drastically increases your chances of getting hired.
                    </p>
                    <Button onClick={() => router.push("/dashboard")} className="mt-4">Return to Dashboard</Button>
                  </>
                )}
                {doc.status === "REJECTED" && (
                  <>
                    <div className="mx-auto w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                      <ShieldAlert className="h-12 w-12 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-500">Verification Rejected</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Unfortunately, your verification was rejected.
                      {doc.adminComments && <span className="block mt-2 font-medium">Reason: {doc.adminComments}</span>}
                    </p>
                    <div className="mt-8 pt-8 border-t border-border">
                      <h3 className="text-lg font-semibold mb-4">Submit Again</h3>
                      {/* Let them resubmit by clearing doc locally */}
                      <Button onClick={() => setDoc(null)}>Upload New Documents</Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex items-start gap-3 text-sm">
                  <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-primary/80">We use advanced AI to securely verify your identity. Since this is a beta, please provide direct image URLs instead of uploading files.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" /> National ID or Passport Image URL
                    </label>
                    <Input 
                      placeholder="https://example.com/my-id-card.jpg" 
                      value={idPhotoUrl}
                      onChange={e => setIdPhotoUrl(e.target.value)}
                      required
                      type="url"
                    />
                    {idPhotoUrl && <img src={idPhotoUrl} className="h-32 object-cover rounded-lg border border-border mt-2" onError={(e) => (e.currentTarget.style.display = 'none')} />}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2 mt-6">
                      <Camera className="h-4 w-4" /> Live Face Selfie Image URL
                    </label>
                    <Input 
                      placeholder="https://example.com/my-face.jpg" 
                      value={facePhotoUrl}
                      onChange={e => setFacePhotoUrl(e.target.value)}
                      required
                      type="url"
                    />
                    {facePhotoUrl && <img src={facePhotoUrl} className="h-32 object-cover rounded-lg border border-border mt-2" onError={(e) => (e.currentTarget.style.display = 'none')} />}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={isSubmitting || !idPhotoUrl || !facePhotoUrl} className="w-full sm:w-auto">
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full" />
                        Analyzing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" /> Submit for Verification
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
