"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  "Mathematics", "Physics", "English", "Chemistry", "Biology", "ICT", "Arts", "Music"
];

export function HeroSearch() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (subject) params.set("subject", subject);
    if (location) params.set("location", location);
    router.push(`/tutors?${params.toString()}`);
  };

  const handleCategoryClick = (cat: string) => {
    router.push(`/tutors?subject=${encodeURIComponent(cat)}`);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-bold text-primary"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        #1 AI-Powered Tuition Marketplace in Bangladesh
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-5xl md:text-7xl font-black font-[var(--font-space-grotesk)] tracking-tight text-balance leading-[1.1]"
      >
        Find the Perfect <span className="gradient-text">Tutor</span> with <span className="relative inline-block">
          AI Precision
          <svg className="absolute -bottom-2 left-0 w-full h-3 text-secondary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
            <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
          </svg>
        </span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
      >
        The smartest way to connect verified tutors with students. Personalized matches, secure payments, and a safer community for everyone.
      </motion.p>

      {/* Search Bar */}
      <motion.form 
        onSubmit={handleSearch}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-2xl mx-auto glass p-2 rounded-2xl flex flex-col md:flex-row gap-2 shadow-2xl shadow-primary/10 border-primary/10"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (e.g. Physics, Math)"
            className="w-full h-14 pl-12 pr-4 bg-transparent border-none focus:outline-none text-foreground font-bold placeholder:font-medium"
          />
        </div>
        <div className="w-px h-8 bg-border hidden md:block self-center" />
        <div className="flex-1 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (e.g. Dhaka, Dhanmondi)"
            className="w-full h-14 pl-12 pr-4 bg-transparent border-none focus:outline-none text-foreground font-bold placeholder:font-medium"
          />
        </div>
        <Button type="submit" size="lg" className="h-14 px-8 rounded-xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
          Find Tutor
        </Button>
      </motion.form>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap justify-center gap-2 pt-4"
      >
        {CATEGORIES.map(cat => (
          <Badge 
            key={cat} 
            variant="secondary" 
            onClick={() => handleCategoryClick(cat)}
            className="px-5 py-2 rounded-full cursor-pointer hover:bg-primary hover:text-white transition-all hover:scale-110 active:scale-95 font-bold border-transparent hover:border-primary/20"
          >
            {cat}
          </Badge>
        ))}
      </motion.div>
    </div>
  );
}
