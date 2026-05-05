"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, Variants } from "framer-motion";
import { UserCircle, MapPin, Star, BookmarkMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SavedTutor {
  id: string;
  name: string;
  image: string | null;
  bio: string;
  location: string;
  hourlyRate: number;
  subjects: string[];
}

export default function GuardianSavedTutorsPage() {
  const { data: session } = useSession();
  const [savedTutors, setSavedTutors] = useState<SavedTutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with real API when SavedTutor model is added to DB
    const timer = setTimeout(() => {
      setSavedTutors([
        {
          id: "1",
          name: "Alex Rahman",
          image: null,
          bio: "Experienced Mathematics tutor with 5 years of experience teaching O/A levels.",
          location: "Dhanmondi, Dhaka",
          hourlyRate: 1500,
          subjects: ["Mathematics", "Physics"],
        },
        {
          id: "2",
          name: "Sarah Islam",
          image: null,
          bio: "Passionate English literature graduate offering interactive online classes.",
          location: "Gulshan, Dhaka",
          hourlyRate: 1200,
          subjects: ["English", "History"],
        },
      ]);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const removeTutor = (id: string) => {
    setSavedTutors((prev) => prev.filter((tutor) => tutor.id !== id));
  };

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
        <p className="text-muted-foreground animate-pulse">Loading saved tutors...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold font-[var(--font-space-grotesk)] text-foreground tracking-tight">Saved Tutors</h1>
        <p className="text-muted-foreground mt-1">Tutors you&apos;ve shortlisted for future opportunities.</p>
      </div>

      {savedTutors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 px-4 bg-muted/30 rounded-2xl border border-dashed border-border"
        >
          <div className="h-16 w-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No tutors saved yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            You can bookmark tutor profiles while browsing to keep them here for easy access later.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {savedTutors.map((tutor) => (
            <motion.div key={tutor.id} variants={itemVariants}>
              <Card className="h-full flex flex-col p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {tutor.image ? (
                      <img src={tutor.image} alt={tutor.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <UserCircle className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {tutor.name}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {tutor.location}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTutor(tutor.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Remove from saved"
                  >
                    <BookmarkMinus className="h-5 w-5" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow">
                  {tutor.bio}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {tutor.subjects.map(sub => (
                    <span key={sub} className="text-xs font-medium bg-muted text-muted-foreground px-2 py-1 rounded-md">
                      {sub}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <div className="text-sm font-medium text-foreground">
                    ৳{tutor.hourlyRate}<span className="text-muted-foreground font-normal">/hr</span>
                  </div>
                  <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">
                    Message
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
