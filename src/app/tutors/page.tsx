"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MapPin, 
  Star, 
  BookOpen, 
  ChevronDown, 
  SlidersHorizontal,
  X,
  ShieldCheck,
  ArrowRight,
  Bookmark,
  Loader2
} from "lucide-react";
import Link from "next/link";

import { publicApi, PublicTutor, Pagination } from "@/lib/api/public";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PublicNavbar } from "@/components/layouts/public-navbar";
import { PublicFooter } from "@/components/layouts/public-footer";
import { useSession } from "next-auth/react";
import { guardianApi } from "@/lib/api/guardian";
import { toast } from "sonner";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function TutorsSearchPage() {
  const [tutors, setTutors] = useState<PublicTutor[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const [savedTutorIds, setSavedTutorIds] = useState<Set<string>>(new Set());
  const [isSavingId, setIsSavingId] = useState<string | null>(null);

  const isGuardian = session?.user?.role === "GUARDIAN";

  // Filter States
  const [filters, setFilters] = useState({
    query: "",
    subject: "",
    location: "",
    minRate: "",
    maxRate: "",
    page: 1,
  });

  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  const fetchTutors = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await publicApi.getTutors(filters);
      setTutors(res.tutors);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.message || "Failed to load tutors");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTutors();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchTutors]);

  useEffect(() => {
    if (isGuardian && session?.accessToken) {
      fetchSavedTutorIds();
    }
  }, [isGuardian, session]);

  const fetchSavedTutorIds = async () => {
    if (!session?.accessToken) return;
    try {
      const res = await guardianApi.getSavedTutors(session.accessToken as string);
      setSavedTutorIds(new Set(res.map(st => st.tutorId)));
    } catch (err) {
      console.error("Failed to fetch saved tutors:", err);
    }
  };

  const toggleSaveTutor = async (e: React.MouseEvent, tutorId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.accessToken) return;

    setIsSavingId(tutorId);
    try {
      const isCurrentlySaved = savedTutorIds.has(tutorId);
      if (isCurrentlySaved) {
        await guardianApi.unsaveTutor(session.accessToken as string, tutorId);
        setSavedTutorIds(prev => {
          const next = new Set(prev);
          next.delete(tutorId);
          return next;
        });
        toast.success("Removed from saved list");
      } else {
        await guardianApi.saveTutor(session.accessToken as string, tutorId);
        setSavedTutorIds(prev => new Set(prev).add(tutorId));
        toast.success("Added to saved list");
      }
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setIsSavingId(null);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <PublicNavbar />
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="mb-12 text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight"
          >
            Find the Perfect <span className="text-primary italic">Mentor</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Connect with top-rated, verified tutors across various subjects. 
            Accelerate your learning journey with personalized guidance.
          </motion.p>
        </div>

        {/* Search and Mobile Filter Toggle */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by name, subjects or bio..." 
              className="pl-12 h-14 text-base rounded-2xl border-border bg-surface shadow-sm focus-visible:ring-primary/20"
              value={filters.query}
              onChange={(e) => handleFilterChange("query", e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            className="h-14 px-6 rounded-2xl md:hidden flex items-center gap-2"
            onClick={() => setIsFilterSidebarOpen(true)}
          >
            <SlidersHorizontal className="h-5 w-5" /> Filters
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden md:block w-72 space-y-8 shrink-0">
            <div className="space-y-6 sticky top-28">
              <div className="flex items-center gap-2 font-bold text-lg mb-4">
                <SlidersHorizontal className="h-5 w-5 text-primary" /> Filters
              </div>

              {/* Subject Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Subject</label>
                <Input 
                  placeholder="e.g. Physics" 
                  value={filters.subject}
                  onChange={(e) => handleFilterChange("subject", e.target.value)}
                />
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="e.g. Dhaka" 
                    className="pl-9"
                    value={filters.location}
                    onChange={(e) => handleFilterChange("location", e.target.value)}
                  />
                </div>
              </div>

              {/* Rate Range */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Rate (৳/hr)</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    placeholder="Min" 
                    value={filters.minRate}
                    onChange={(e) => handleFilterChange("minRate", e.target.value)}
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input 
                    type="number" 
                    placeholder="Max" 
                    value={filters.maxRate}
                    onChange={(e) => handleFilterChange("maxRate", e.target.value)}
                  />
                </div>
              </div>

              <Button 
                variant="ghost" 
                className="w-full text-primary hover:text-primary hover:bg-primary/5"
                onClick={() => setFilters({ query: "", subject: "", location: "", minRate: "", maxRate: "", page: 1 })}
              >
                Reset Filters
              </Button>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-[400px] rounded-2xl bg-muted/20 animate-pulse border border-border" />
                ))}
              </div>
            ) : tutors.length === 0 ? (
              <div className="text-center py-20 bg-surface rounded-3xl border border-border shadow-sm">
                <Search className="h-16 w-16 mx-auto mb-4 opacity-10" />
                <h3 className="text-xl font-bold mb-2">No Tutors Found</h3>
                <p className="text-muted-foreground">Try adjusting your filters to find more results.</p>
              </div>
            ) : (
              <>
                <motion.div 
                  variants={container} 
                  initial="hidden" 
                  animate="show" 
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                  {tutors.map((tutor) => (
                    <motion.div key={tutor.id} variants={item}>
                      <Link href={`/tutors/${tutor.id}`}>
                        <Card className="h-full flex flex-col overflow-hidden bg-surface border-border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group">
                          {/* Top Section / Image */}
                          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                            {tutor.image ? (
                              <img 
                                src={tutor.image} 
                                alt={tutor.name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                <BookOpen className="h-20 w-20" />
                              </div>
                            )}
                            
                            {/* Overlay Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                              {tutor.isVerified && (
                                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none gap-1 py-1 px-3">
                                  <ShieldCheck className="h-3 w-3" /> Verified
                                </Badge>
                              )}
                              <Badge variant="secondary" className="backdrop-blur-md bg-black/50 text-white border-none gap-1 py-1 px-3">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> {tutor.averageRating} ({tutor.totalReviews})
                              </Badge>
                            </div>

                            {/* Save Button */}
                            {isGuardian && (
                              <button
                                onClick={(e) => toggleSaveTutor(e, tutor.id)}
                                disabled={isSavingId === tutor.id}
                                className={`absolute top-4 right-4 p-2.5 rounded-xl backdrop-blur-md transition-all z-20 ${
                                  savedTutorIds.has(tutor.id)
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-white/20 text-white hover:bg-white/40 border border-white/30"
                                }`}
                              >
                                {isSavingId === tutor.id ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <Bookmark className={`h-5 w-5 ${savedTutorIds.has(tutor.id) ? "fill-white" : ""}`} />
                                )}
                              </button>
                            )}

                            {/* Hover Action */}
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                View Profile <ArrowRight className="h-4 w-4" />
                              </div>
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className="p-6 space-y-4 flex-grow flex flex-col">
                            <div>
                              <h3 className="text-xl font-bold group-hover:text-primary transition-colors truncate">
                                {tutor.name}
                              </h3>
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {tutor.tutorProfile.location || "Remote / Online"}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {tutor.tutorProfile.subjects.slice(0, 3).map((sub, i) => (
                                <Badge key={i} variant="outline" className="text-[10px] uppercase font-bold tracking-wider py-0 px-2">
                                  {sub}
                                </Badge>
                              ))}
                              {tutor.tutorProfile.subjects.length > 3 && (
                                <span className="text-[10px] text-muted-foreground font-bold">+{tutor.tutorProfile.subjects.length - 3}</span>
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2 italic">
                              "{tutor.tutorProfile.bio || "No bio provided."}"
                            </p>

                            <div className="pt-4 mt-auto border-t border-border/50 flex items-center justify-between">
                              <div className="text-xs text-muted-foreground">
                                <span className="font-bold text-lg text-foreground">৳{tutor.tutorProfile.hourlyRate || "0"}</span> / hr
                              </div>
                              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                {tutor.tutorProfile.profileViews} Views
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl h-11 w-11"
                      onClick={() => handleFilterChange("page", Math.max(1, filters.page - 1))}
                      disabled={filters.page === 1}
                    >
                      <ArrowRight className="h-4 w-4 rotate-180" />
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, pagination.pages) }).map((_, i) => {
                        // Simple sliding window for pagination if many pages
                        let pageNum = i + 1;
                        if (pagination.pages > 5 && filters.page > 3) {
                          pageNum = filters.page - 3 + i;
                          if (pageNum + (5 - i) > pagination.pages) {
                            pageNum = pagination.pages - 4 + i;
                          }
                        }
                        
                        if (pageNum > 0 && pageNum <= pagination.pages) {
                          return (
                            <Button
                              key={pageNum}
                              variant={filters.page === pageNum ? "default" : "outline"}
                              className={`h-11 w-11 rounded-xl font-bold transition-all ${filters.page === pageNum ? 'shadow-lg shadow-primary/20 scale-110' : ''}`}
                              onClick={() => handleFilterChange("page", pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl h-11 w-11"
                      onClick={() => handleFilterChange("page", Math.min(pagination.pages, filters.page + 1))}
                      disabled={filters.page === pagination.pages}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      <AnimatePresence>
        {isFilterSidebarOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterSidebarOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xs bg-surface border-l border-border p-6 shadow-2xl h-full overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Filters</h2>
                <button onClick={() => setIsFilterSidebarOpen(false)} className="p-2 rounded-full hover:bg-muted transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Subject</label>
                  <Input 
                    placeholder="e.g. Physics" 
                    value={filters.subject}
                    onChange={(e) => handleFilterChange("subject", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="e.g. Dhaka" 
                      className="pl-9"
                      value={filters.location}
                      onChange={(e) => handleFilterChange("location", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Rate (৳/hr)</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      placeholder="Min" 
                      value={filters.minRate}
                      onChange={(e) => handleFilterChange("minRate", e.target.value)}
                    />
                    <Input 
                      type="number" 
                      placeholder="Max" 
                      value={filters.maxRate}
                      onChange={(e) => handleFilterChange("maxRate", e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  className="w-full h-12 rounded-xl mt-4"
                  onClick={() => setIsFilterSidebarOpen(false)}
                >
                  Apply Filters
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full text-primary hover:bg-primary/5"
                  onClick={() => {
                    setFilters({ query: "", subject: "", location: "", minRate: "", maxRate: "", page: 1 });
                    setIsFilterSidebarOpen(false);
                  }}
                >
                  Reset All
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <PublicFooter />
    </div>
  );
}
