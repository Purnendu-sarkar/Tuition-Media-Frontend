"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldCheck, Camera, FileText, Upload, Check, ChevronRight, ChevronLeft, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Webcam from "react-webcam";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { verificationApi } from "@/lib/api/verification";
import type { VerificationDocument } from "@/lib/api/verification";
import fpPromise from "@fingerprintjs/fingerprintjs";

function base64ToFile(base64: string, filename: string) {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export default function TutorVerificationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [doc, setDoc] = useState<VerificationDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: ID Upload, 2: Face Scan

  // Form State
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [faceCapture, setFaceCapture] = useState<string | null>(null);

  // Webcam Refs
  const webcamRef = useRef<Webcam>(null);

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
    if (!session?.accessToken) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await verificationApi.getMyVerification(session.accessToken);
      setDoc(res.verification);
    } catch (error) {
      console.error("Failed to fetch verification", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB.");
        return;
      }
      setIdFile(file);
      setIdPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const captureFace = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setFaceCapture(imageSrc);
    }
  }, [webcamRef]);

  const handleSubmit = async () => {
    if (!session?.accessToken || !idFile || !faceCapture) return;
    
    setError("");
    setIsSubmitting(true);
    
    try {
      // Collect Device Fingerprint
      const fp = await fpPromise.load();
      const fpResult = await fp.get();
      const deviceFingerprint = fpResult.visitorId;

      // Collect IP Address
      let ipAddress = "Unknown";
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        ipAddress = ipData.ip;
      } catch (e) {
        console.warn("Could not fetch IP", e);
      }

      const formData = new FormData();
      formData.append("idPhoto", idFile);
      formData.append("facePhoto", base64ToFile(faceCapture, "face_capture.jpg"));
      formData.append("deviceFingerprint", deviceFingerprint);
      formData.append("ipAddress", ipAddress);

      await verificationApi.submitVerification(session.accessToken, formData);
      await fetchMyVerification();
    } catch (err: any) {
      setError(err.message || "Failed to submit verification.");
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
          <p className="text-muted-foreground mt-1">
            Complete a few steps to verify your identity and unlock premium benefits.
          </p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-0 border-border bg-surface shadow-2xl overflow-hidden">
            {doc ? (
              <div className="p-8 text-center space-y-6 py-12">
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
                      Congratulations! Your identity has been verified. You now have a verified badge on your profile.
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
                      <Button onClick={() => setDoc(null)}>Try Again</Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col">
                {/* Stepper */}
                <div className="flex border-b border-border">
                  <div className={`flex-1 p-4 text-center border-r border-border flex items-center justify-center gap-2 ${step === 1 ? 'bg-primary/5 text-primary' : 'text-muted-foreground'}`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-primary text-white' : 'bg-muted'}`}>1</div>
                    <span className="font-medium hidden sm:inline">National ID</span>
                  </div>
                  <div className={`flex-1 p-4 text-center flex items-center justify-center gap-2 ${step === 2 ? 'bg-primary/5 text-primary' : 'text-muted-foreground'}`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-primary text-white' : 'bg-muted'}`}>2</div>
                    <span className="font-medium hidden sm:inline">Live Face Scan</span>
                  </div>
                </div>

                <div className="p-6 md:p-10 min-h-[400px]">
                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {step === 1 ? (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                      >
                        <div className="text-center space-y-2">
                          <h3 className="text-xl font-semibold">Upload Identification</h3>
                          <p className="text-sm text-muted-foreground">Upload a clear photo of your National ID, Passport, or License.</p>
                        </div>

                        <div 
                          className="relative border-2 border-dashed border-border rounded-2xl p-12 transition-all hover:border-primary/50 hover:bg-primary/5 group"
                        >
                          <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleIdUpload}
                            accept="image/*"
                          />
                          {idPreview ? (
                            <div className="relative aspect-video max-w-md mx-auto rounded-xl overflow-hidden border border-border">
                              <img src={idPreview} alt="ID Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="h-8 w-8 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="text-center space-y-4">
                              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/10 transition-colors">
                                <FileText className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Click to upload or drag and drop</p>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG or JPEG (max. 5MB)</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-6 flex justify-end">
                          <Button 
                            disabled={!idFile} 
                            onClick={() => setStep(2)}
                            className="w-full sm:w-auto"
                          >
                            Next Step <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="text-center space-y-2">
                          <h3 className="text-xl font-semibold">Live Face Scan</h3>
                          <p className="text-sm text-muted-foreground">Position your face within the frame and capture a photo.</p>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                          {faceCapture ? (
                            <div className="relative h-72 w-72 rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl shadow-emerald-500/20">
                              <img src={faceCapture} alt="Capture" className="w-full h-full object-cover scale-x-[-1]" />
                              <button 
                                onClick={() => setFaceCapture(null)}
                                className="absolute bottom-4 right-4 h-10 w-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                              >
                                <RefreshCcw className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <div className="relative h-72 w-72 rounded-full overflow-hidden border-4 border-primary/30 bg-black shadow-2xl">
                              <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="h-full w-full object-cover scale-x-[-1]"
                                videoConstraints={{
                                  width: 720,
                                  height: 720,
                                  facingMode: "user"
                                }}
                              />
                              {/* Oval Overlay */}
                              <div className="absolute inset-0 border-[30px] border-black/20 rounded-full pointer-events-none"></div>
                              <div className="absolute inset-0 border-2 border-white/40 rounded-full pointer-events-none border-dashed animate-pulse"></div>
                            </div>
                          )}

                          {!faceCapture && (
                            <Button onClick={captureFace} size="lg" className="rounded-full h-16 w-16 p-0 bg-white hover:bg-zinc-100 text-black border-4 border-primary">
                              <Camera className="h-8 w-8" />
                            </Button>
                          )}
                        </div>

                        <div className="pt-6 flex justify-between gap-4">
                          <Button variant="ghost" onClick={() => setStep(1)} disabled={isSubmitting}>
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back
                          </Button>
                          <Button 
                            disabled={!faceCapture || isSubmitting} 
                            onClick={handleSubmit}
                            className="flex-1 sm:flex-none"
                          >
                            {isSubmitting ? (
                              <span className="flex items-center gap-2">
                                <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full" />
                                Processing...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Submit Verification
                              </span>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        <div className="mt-8 flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-xl text-xs text-muted-foreground">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
          <p>
            Your biometric and identity data is encrypted and securely processed according to industry-standard security protocols. We do not share your documents with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
