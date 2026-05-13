"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  User, 
  BookOpen, 
  MapPin, 
  DollarSign, 
  FileText, 
  Save, 
  Loader2, 
  CheckCircle2,
  Camera,
  Sparkles,
  XCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { tutorApi } from "@/lib/api/tutor";
import { aiApi } from "@/lib/api/ai";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    subjects: [] as string[],
    location: "",
    hourlyRate: 0,
    image: ""
  });

  const [subjectInput, setSubjectInput] = useState("");

  useEffect(() => {
    if (session?.accessToken) {
      fetchProfile();
    }
  }, [session?.accessToken]);

  const fetchProfile = async () => {
    try {
      if (session?.accessToken) {
        const profile = await tutorApi.getProfile(session.accessToken as string);
        setFormData({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          bio: profile.bio || "",
          subjects: profile.subjects || [],
          location: profile.location || "",
          hourlyRate: profile.hourlyRate || 0,
          image: profile.image || ""
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIOptimize = async () => {
    if (!session?.accessToken || !formData.bio) return;

    setIsOptimizing(true);
    try {
      const { optimizedBio } = await aiApi.optimizeBio(session.accessToken as string, formData.bio);
      if (optimizedBio) {
        setFormData(prev => ({ ...prev, bio: optimizedBio }));
      }
    } catch (error) {
      console.error("AI Optimization failed:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;

    setIsSaving(true);
    setSuccess(false);
    try {
      await tutorApi.updateProfile(session.accessToken as string, formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addSubject = () => {
    if (subjectInput.trim() && !formData.subjects.includes(subjectInput.trim())) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, subjectInput.trim()]
      }));
      setSubjectInput("");
    }
  };

  const removeSubject = (sub: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== sub)
    }));
  };

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-b-primary animate-spin" />
          <User className="absolute inset-0 m-auto h-5 w-5 text-primary" />
        </div>
        <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading your professional profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-64 md:pb-52 space-y-10 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black font-[var(--font-space-grotesk)] text-foreground tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage your identity and tuition preferences.</p>
        </div>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-emerald-500/10 text-emerald-500 px-6 py-3 rounded-2xl border border-emerald-500/20 font-bold shadow-lg shadow-emerald-500/5"
          >
            <div className="bg-emerald-500 rounded-full p-1">
              <CheckCircle2 className="h-3 w-3 text-white" />
            </div>
            Profile Updated Successfully!
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Identity & Photo */}
        <Card className="p-8 border-border bg-surface shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000">
            <User className="h-48 w-48 text-primary" />
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
            <div className="relative group shrink-0">
              <div className="h-40 w-40 rounded-[2rem] bg-muted border-4 border-background overflow-hidden flex items-center justify-center shadow-2xl ring-1 ring-border transition-transform group-hover:scale-[1.02] duration-500">
                {formData.image ? (
                  <img src={formData.image} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-16 w-16 text-muted-foreground/40" />
                )}
              </div>
              <label 
                htmlFor="image-upload" 
                className="absolute -bottom-2 -right-2 p-3 bg-primary text-primary-foreground rounded-2xl shadow-xl hover:scale-110 transition-transform cursor-pointer"
              >
                <Camera className="h-5 w-5" />
                <input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            <div className="flex-1 space-y-6 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="h-14 pl-12 bg-background/50 border-border/50 text-lg font-bold rounded-2xl focus-visible:ring-primary/20 transition-all"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Email Address</label>
                  <div className="relative opacity-60">
                    <Input 
                      value={formData.email}
                      readOnly
                      className="h-14 bg-muted/30 border-border/50 text-lg font-medium rounded-2xl cursor-not-allowed"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-muted-foreground/20 px-2 py-1 rounded-md">Verified</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Phone Number</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-border pr-3">
                      <span className="text-sm font-bold text-muted-foreground">+880</span>
                    </div>
                    <Input 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="h-14 pl-20 bg-background/50 border-border/50 text-lg font-bold rounded-2xl"
                      placeholder="17XXXXXXXX"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Current City/Area</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500" />
                    <Input 
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="h-14 pl-12 bg-background/50 border-border/50 text-lg font-bold rounded-2xl"
                      placeholder="e.g. Dhanmondi, Dhaka"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Teaching Expertise */}
        <Card className="p-8 border-border bg-surface shadow-xl">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-inner">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black font-[var(--font-space-grotesk)] text-foreground tracking-tight">Teaching Expertise</h3>
                <p className="text-sm text-muted-foreground">List the subjects you are comfortable teaching.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Add Subject</label>
                  <div className="flex gap-3">
                    <Input 
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                      className="h-14 bg-background/50 border-border/50 text-lg font-bold rounded-2xl"
                      placeholder="e.g. Physics, IELTS, Class 10 Math..."
                    />
                    <Button type="button" onClick={addSubject} className="h-14 px-8 font-black rounded-2xl shadow-lg shadow-primary/20">Add</Button>
                  </div>
                </div>
                <div className="sm:w-48 space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Min. Hourly Rate</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    <Input 
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({...formData, hourlyRate: parseInt(e.target.value) || 0})}
                      className="h-14 pl-12 bg-background/50 border-border/50 text-lg font-black rounded-2xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {formData.subjects.length > 0 ? formData.subjects.map((sub, i) => (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={i} 
                    className="flex items-center gap-3 bg-surface border border-primary/20 px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm group hover:border-primary transition-all"
                  >
                    <span className="text-primary font-black">#</span>
                    {sub}
                    <button type="button" onClick={() => removeSubject(sub)} className="text-muted-foreground hover:text-rose-500 transition-colors p-1">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </motion.div>
                )) : (
                  <div className="w-full py-12 text-center border-2 border-dashed border-border rounded-3xl bg-muted/5">
                    <p className="text-muted-foreground font-medium">No subjects added. Add your expertise to get matched!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Professional Bio */}
        <Card className="p-8 border-border bg-surface shadow-xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-inner">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black font-[var(--font-space-grotesk)] text-foreground tracking-tight">Professional Bio</h3>
                  <p className="text-sm text-muted-foreground">Introduce yourself to potential clients.</p>
                </div>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                disabled={isOptimizing || !formData.bio}
                onClick={handleAIOptimize}
                className="hidden sm:flex gap-2 font-bold rounded-xl border-primary/20 text-primary hover:bg-primary/5 disabled:opacity-50"
              >
                {isOptimizing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                AI Optimize
              </Button>
            </div>

            <div className="relative">
              <textarea 
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full min-h-[250px] bg-background/50 border border-border/50 rounded-3xl p-6 text-lg leading-relaxed focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none shadow-inner"
                placeholder="Write about your educational background, teaching experience, and methodology..."
              />
              <div className="absolute bottom-4 right-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex gap-4">
                <span>{formData.bio.split(/\s+/).filter(Boolean).length} Words</span>
                <span>{formData.bio.length} Chars</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Bottom Save Bar */}
        <div className="fixed bottom-8  z-50 px-4 pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto">
            <Card className="p-4 border-primary/20 bg-background/80 backdrop-blur-2xl shadow-2xl flex items-center justify-between ring-1 ring-primary/20 rounded-[2rem]">
              <div className="hidden lg:flex items-center gap-4 pl-4">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-sm font-bold text-muted-foreground">Changes will be reviewed by our team.</p>
              </div>
              <div className="flex gap-4 w-full lg:w-auto">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex-1 lg:flex-none h-14 px-8 font-bold text-muted-foreground hover:bg-muted/50 rounded-2xl"
                  onClick={() => fetchProfile()}
                >
                  Reset
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-[2] lg:flex-none h-14 px-12 font-black rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving Changes...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Save className="h-5 w-5" />
                      Save Professional Profile
                    </div>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
