"use client";

import { motion } from "framer-motion";
import { 
  Briefcase, 
  Eye, 
  DollarSign, 
  Star, 
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck as ShieldCheckIcon
} from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DashboardStats } from "@/lib/api/tutor";

interface TutorDashboardProps {
  data: DashboardStats;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function TutorDashboard({ data }: TutorDashboardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "PENDING":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "REJECTED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {!data.profileStatus.isProfileComplete && (
        <motion.div variants={item} className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 text-amber-500 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Complete your profile</h3>
            <p className="text-sm opacity-90 mt-1">Your profile is incomplete. Guardians are more likely to hire tutors with complete profiles. Please add your subjects, bio, and location.</p>
            <Button variant="outline" size="sm" className="mt-3 border-amber-500/50 hover:bg-amber-500/20 text-amber-500">
              Complete Profile
            </Button>
          </div>
        </motion.div>
      )}

      {data.profileStatus.isProfileComplete && !data.profileStatus.isVerified && (
        <motion.div variants={item} className="rounded-xl border border-blue-500/50 bg-blue-500/10 p-4 text-blue-500 flex items-start gap-3">
          <ShieldCheckIcon className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Get Verified</h3>
            <p className="text-sm opacity-90 mt-1">Boost your visibility by verifying your identity. Verified tutors get up to 3x more jobs.</p>
            <Link href="/dashboard/verification">
              <Button variant="outline" size="sm" className="mt-3 border-blue-500/50 hover:bg-blue-500/20 text-blue-500">
                Start Verification
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <Card className="p-6 h-full border-border bg-surface shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Active Applications</h3>
              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-semibold mt-4">{data.stats.activeApplications}</p>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6 h-full border-border bg-surface shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Profile Views</h3>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                <Eye className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-semibold mt-4">{data.stats.profileViews}</p>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6 h-full border-border bg-surface shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Total Earnings</h3>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-semibold mt-4">৳{data.stats.totalEarnings.toLocaleString()}</p>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6 h-full border-border bg-surface shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Average Rating</h3>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                <Star className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-semibold mt-4">{data.stats.averageRating}</p>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card className="border-border bg-surface overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Applications</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="p-0">
            {data.recentApplications.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-medium">Job Title</th>
                      <th className="px-6 py-4 font-medium">Budget</th>
                      <th className="px-6 py-4 font-medium">Applied Date</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentApplications.map((app) => (
                      <tr key={app.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{app.jobTitle}</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {app.budget ? `৳${app.budget.toLocaleString()}` : 'Negotiable'}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClass(app.status)}`}>
                            {getStatusIcon(app.status)}
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>You haven&apos;t applied to any jobs yet.</p>
                <Button className="mt-4" variant="outline">Browse Jobs</Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
