"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { UserCircle, MapPin, Star, BookmarkMinus, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { guardianApi, SavedTutor } from "@/lib/api/guardian";

export default function GuardianSavedTutorsPage() {
  const { data: session } = useSession();
  const [savedTutors, setSavedTutors] = useState<SavedTutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.accessToken) {
      fetchSavedTutors();
    }
  }, [session]);

  const fetchSavedTutors = async () => {
    if (!session?.accessToken) return;
    try {
      setIsLoading(true);
      const res = await guardianApi.getSavedTutors(session.accessToken as string);
      setSavedTutors(res);
    } catch (err: any) {
      toast.error("Failed to load saved tutors");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeTutor = async (tutorId: string) => {
    if (!session?.accessToken) return;
    try {
      setRemovingId(tutorId);
      await guardianApi.unsaveTutor(session.accessToken as string, tutorId);
      setSavedTutors((prev) => prev.filter((st) => st.tutorId !== tutorId));
      toast.success("Tutor removed from saved list");
    } catch (err: any) {
      toast.error("Failed to remove tutor");
    } finally {
      setRemovingId(null);
    }
  };

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
};

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading saved tutors...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-[var(--font-space-grotesk)] text-foreground tracking-tight">Saved Tutors</h1>
          <p className="text-muted-foreground mt-1">Tutors you&apos;ve shortlisted for future opportunities.</p>
        </div>
        <div className="text-sm font-medium bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20">
          {savedTutors.length} {savedTutors.length === 1 ? 'Tutor' : 'Tutors'} Saved
        </div>
      </div>

      {savedTutors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 px-4 bg-surface rounded-3xl border border-dashed border-border shadow-sm"
        >
          <div className="h-20 w-20 bg-muted/50 text-muted-foreground/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No tutors saved yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">
            Start browsing tutor profiles and click the bookmark icon to save those who catch your eye!
          </p>
          <Button href="/tutors" className="rounded-xl px-8 h-12">Browse Tutors</Button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {savedTutors.map((st) => (
              <motion.div key={st.id} variants={itemVariants} layout exit="exit">
                <Card className="h-full flex flex-col p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group border-border bg-surface relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                    <Star className="h-32 w-32 text-primary" />
                  </div>

                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {st.tutor.image ? (
                          <img src={st.tutor.image} alt={st.tutor.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/10" />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center border border-border">
                            <UserCircle className="w-10 h-10 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-surface shadow-sm" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors leading-tight">
                          {st.tutor.name}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1 font-medium">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-primary/60" />
                          {st.tutor.tutorProfile?.location || "Remote"}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTutor(st.tutorId)}
                      disabled={removingId === st.tutorId}
                      className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-10 w-10 rounded-xl"
                      title="Remove from saved"
                    >
                      {removingId === st.tutorId ? <Loader2 className="h-5 w-5 animate-spin" /> : <BookmarkMinus className="h-5 w-5" />}
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-grow leading-relaxed">
                    {st.tutor.tutorProfile?.bio || "No bio provided."}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {st.tutor.tutorProfile?.subjects.slice(0, 3).map(sub => (
                      <span key={sub} className="text-[10px] font-black uppercase tracking-wider bg-primary/5 text-primary/70 px-2.5 py-1 rounded-lg border border-primary/10">
                        {sub}
                      </span>
                    ))}
                    {st.tutor.tutorProfile?.subjects && st.tutor.tutorProfile.subjects.length > 3 && (
                      <span className="text-[10px] font-bold text-muted-foreground px-1">+{st.tutor.tutorProfile.subjects.length - 3}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50 relative z-10">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Rate</span>
                      <div className="text-lg font-black text-foreground">
                        ৳{st.tutor.tutorProfile?.hourlyRate || 0}<span className="text-xs text-muted-foreground font-medium">/hr</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 border-primary/20 text-primary hover:bg-primary/5 font-bold gap-2">
                        <MessageSquare className="h-4 w-4" /> Chat
                      </Button>
                      <Button size="sm" href={`/tutors/${st.tutorId}`} className="rounded-xl h-10 px-4 font-bold">
                        Profile
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

