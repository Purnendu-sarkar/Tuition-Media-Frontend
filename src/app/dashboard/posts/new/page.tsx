"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Wand2,
  Briefcase,
  MapPin,
  DollarSign,
  AlignLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { aiApi } from "@/lib/api/ai";
import { guardianApi, CreateJobData } from "@/lib/api/guardian";

export default function AIJobPostGenerator() {
  const { data: session } = useSession();
  const router = useRouter();

  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateJobData>({
    title: "",
    description: "",
    budget: undefined,
    location: ""
  });

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim() || !session?.accessToken) return;

    setIsGenerating(true);
    setError(null);
    try {
      const generated = await aiApi.generateJobPost(session.accessToken, aiPrompt);
      setFormData(prev => ({
        ...prev,
        title: generated.title,
        description: generated.description,
      }));
    } catch (err: any) {
      console.error("Failed to generate job post with AI:", err);
      setError(err.message || "Failed to generate AI response. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await guardianApi.createJob(session.accessToken, {
        ...formData,
        budget: formData.budget ? Number(formData.budget) : undefined
      });

      // Success! Redirect back to dashboard overview or posts list
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Failed to create job:", err);
      setError(err.message || "Failed to post job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold font-[var(--font-space-grotesk)] text-foreground">Post a New Tuition Job</h1>
        <p className="text-muted-foreground mt-2">Use AI to instantly write a professional job description, or fill it out manually.</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-red-500 flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </motion.div>
      )}

      {/* AI Generator Section */}
      <Card className="relative overflow-hidden border-indigo-500/30 bg-indigo-500/5 p-6 sm:p-8">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-indigo-500 font-semibold mb-2">
            <Sparkles className="h-5 w-5" />
            <h2>AI Magic Generator</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Wand2 className="h-4 w-4 text-indigo-400" />
              </div>
              <Input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAiGenerate();
                  }
                }}
                placeholder="E.g., Need a math tutor for class 10 in Dhanmondi, 3 days a week"
                className="pl-10 h-12 text-base text-foreground placeholder:text-slate-500 dark:placeholder:text-slate-400 border-indigo-500/30 focus-visible:ring-indigo-500/50 bg-card shadow-inner"
              />
            </div>
            <Button
              onClick={handleAiGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all shrink-0"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white/20 border-t-white rounded-full" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Post <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-indigo-500/80">
            Just type what you need. AI will write a professional title and description for you.
          </p>
        </div>
      </Card>

      {/* Manual Form Section */}
      <Card className="p-6 sm:p-8 bg-surface border-border shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" /> Job Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              placeholder="e.g. Expert Math Tutor Required for SSC Candidate"
              value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              required
              minLength={10}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-primary" /> Description <span className="text-red-500">*</span>
            </label>
            <AnimatePresence mode="popLayout">
              {isGenerating ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-40 rounded-md border border-border bg-muted/20 flex flex-col items-center justify-center gap-3"
                >
                  <div className="flex gap-1">
                    <motion.div className="h-2 w-2 rounded-full bg-indigo-500" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="h-2 w-2 rounded-full bg-indigo-500" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="h-2 w-2 rounded-full bg-indigo-500" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                  <p className="text-sm text-muted-foreground animate-pulse">Writing the perfect description...</p>
                </motion.div>
              ) : (
                <motion.textarea
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  id="description"
                  className="flex min-h-[160px] w-full rounded-md border border-input bg-transparent px-3 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe the student's needs, schedule, and any specific requirements for the tutor..."
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  required
                  minLength={30}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="budget" className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" /> Monthly Budget (৳)
              </label>
              <Input
                id="budget"
                type="number"
                placeholder="e.g. 5000"
                value={formData.budget || ""}
                onChange={e => setFormData(p => ({ ...p, budget: e.target.value ? Number(e.target.value) : undefined }))}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">Leave blank if negotiable.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-rose-500" /> Location <span className="text-red-500">*</span>
              </label>
              <Input
                id="location"
                placeholder="e.g. Dhanmondi, Dhaka"
                value={formData.location || ""}
                onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                required
                className="h-11"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground hidden sm:block">
              Your post will be immediately visible to matched tutors.
            </p>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button type="button" variant="outline" className="w-full sm:w-auto h-11" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto h-11 px-8">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full" />
                    Posting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Publish Job
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
