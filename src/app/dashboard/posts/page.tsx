"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, Variants } from "framer-motion";
import { PlusCircle, Search, MapPin, Users, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import { guardianApi } from "@/lib/api/guardian";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Job {
  id: string;
  title: string;
  budget: number | null;
  status: string;
  location: string | null;
  description: string;
  applicantsCount: number;
  createdAt: string;
}

export default function GuardianPostsPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchJobs() {
      if (!session?.accessToken) return;
      try {
        const data = await guardianApi.getAllJobs(session.accessToken as string);
        setJobs(data);
      } catch (err) {
        setError("Failed to load your tuition posts. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchJobs();
  }, [session?.accessToken]);

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
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
        <p className="text-muted-foreground animate-pulse">Loading your posts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-[var(--font-space-grotesk)] text-foreground tracking-tight">My Tuition Posts</h1>
          <p className="text-muted-foreground mt-1">Manage your active posts and track applicants.</p>
        </div>
        <Link href="/dashboard/posts/new">
          <Button className="w-full sm:w-auto shadow-md">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Post
          </Button>
        </Link>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-500">{error}</p>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 px-4 bg-muted/30 rounded-2xl border border-dashed border-border"
        >
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No posts found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            {searchQuery
              ? "We couldn't find any posts matching your search."
              : "You haven't posted any tuition requests yet. Create your first post to find the perfect tutor!"}
          </p>
          {!searchQuery && (
            <Link href="/dashboard/posts/new">
              <Button variant="outline">Create a Post Now</Button>
            </Link>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredJobs.map((job) => (
            <motion.div key={job.id} variants={itemVariants}>
              <Card className="h-full flex flex-col p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <Badge
                    className={
                      job.status === "OPEN"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-200"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {job.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {job.title}
                </h3>

                <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-border">
                  {job.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                  )}
                  {job.budget && (
                    <div className="text-sm font-medium text-foreground">
                      <span className="text-muted-foreground">৳</span>{job.budget.toLocaleString()}/month
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2 pt-2">
                    <div className="flex items-center text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                      <Users className="h-4 w-4 mr-2" />
                      {job.applicantsCount} Applicant{job.applicantsCount !== 1 ? 's' : ''}
                    </div>
                    <Link href={`/dashboard/hiring?job=${job.id}`}>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
