"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  Users, 
  GraduationCap, 
  UserCircle, 
  Briefcase, 
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Flag,
  HelpCircle,
  Activity,
  Clock,
  ExternalLink,
  Plus,
  TrendingUp,
  AlertTriangle,
  Star,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminApi, AdminStats, AdminUser, AdminJob, AdminReport } from "@/lib/api/admin";

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [recentJobs, setRecentJobs] = useState<AdminJob[]>([]);
  const [recentReports, setRecentReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      fetchAllData(session.accessToken as string);
    }
  }, [session]);

  const fetchAllData = async (token: string) => {
    try {
      setLoading(true);
      const [statsData, usersData, jobsData, reportsData] = await Promise.all([
        adminApi.getStats(token),
        adminApi.getUsers(token),
        adminApi.getJobs(token),
        adminApi.getReports(token)
      ]);
      
      setStats(statsData);
      setRecentUsers(usersData.users.slice(0, 5));
      setRecentJobs(jobsData.jobs.slice(0, 5));
      setRecentReports(reportsData.reports.filter(r => r.status === "PENDING").slice(0, 3));
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-muted-foreground animate-pulse">Initializing Command Center...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      trend: "+12% this week"
    },
    {
      title: "Active Tutors",
      value: stats?.totalTutors || 0,
      icon: GraduationCap,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      trend: "+5% growth"
    },
    {
      title: "Guardians",
      value: stats?.totalGuardians || 0,
      icon: UserCircle,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      trend: "Steady"
    },
    {
      title: "Live Jobs",
      value: stats?.activeJobs || 0,
      icon: Briefcase,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      trend: "8 new today"
    },
    {
      title: "Pending Action",
      value: stats?.pendingVerifications || 0,
      icon: ShieldAlert,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      trend: stats?.growth.newUsers7d ? `${stats.growth.newUsers7d} new users` : "Critical priority"
    }
  ];

  const secondaryStats = [
    { label: "Total Reviews", value: stats?.totalReviews || 0, icon: Star, color: "text-amber-500" },
    { label: "Avg Rating", value: `${stats?.averageRating.toFixed(1) || 0} / 5.0`, icon: Star, color: "text-amber-500" },
    { label: "Messages", value: stats?.totalMessages.toLocaleString() || 0, icon: MessageSquare, color: "text-blue-500" },
    { label: "Growth (7d)", value: `+${stats?.growth.newJobs7d || 0} jobs`, icon: TrendingUp, color: "text-emerald-500" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold mb-1">
            <Activity className="h-5 w-5" />
            <span>Command Center</span>
          </div>
          <h1 className="text-3xl font-black font-[var(--font-space-grotesk)] text-foreground">Platform Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">System intelligence and administrative control panel.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => session?.accessToken && fetchAllData(session.accessToken as string)} className="gap-2">
            <Activity className="h-4 w-4" /> Refresh Data
          </Button>
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary-strong">
            <TrendingUp className="h-4 w-4" /> System Logs
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-6 border-border bg-surface shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl border ${stat.bg} ${stat.border} ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                  {stat.trend}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {secondaryStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }}
          >
            <Card className="p-4 border-border bg-surface/50 flex items-center gap-4">
              <div className={`p-2 rounded-lg bg-background border border-border ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{stat.label}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Activity Column */}
        <div className="xl:col-span-2 space-y-8">
          {/* Latest Jobs */}
          <Card className="border-border bg-surface overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Latest Job Posts
              </h2>
              <Link href="/admin/jobs" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                View All <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">Job Title</th>
                    <th className="px-6 py-4 font-medium">Guardian</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentJobs.length > 0 ? (
                    recentJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-foreground line-clamp-1">{job.title}</p>
                          <p className="text-xs text-muted-foreground">Budget: ৳{job.budget || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4">{job.guardian.name}</td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            job.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No recent jobs found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Recent Signups */}
          <Card className="border-border bg-surface overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                New User Signups
              </h2>
              <div className="flex gap-2">
                <Link href="/admin/users/tutors" className="text-xs text-primary font-semibold hover:underline">Tutors</Link>
                <span className="text-muted-foreground">•</span>
                <Link href="/admin/users/guardians" className="text-xs text-primary font-semibold hover:underline">Guardians</Link>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/10 hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors">{user.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="uppercase font-bold">{user.role}</span>
                        <span>•</span>
                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* System Monitoring & Quick Actions */}
        <div className="space-y-8">
          {/* Moderation Alerts */}
          <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-amber-500/20 flex items-center justify-between">
              <h2 className="text-lg font-bold text-amber-600 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                Action Required
              </h2>
              <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-full">
                {recentReports.length} ALERTS
              </span>
            </div>
            <div className="p-6 space-y-4">
              {recentReports.length > 0 ? (
                recentReports.map((report) => (
                  <div key={report.id} className="p-4 rounded-xl border border-amber-500/20 bg-white/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-600 uppercase bg-amber-500/10 px-2 py-0.5 rounded">
                        {report.reason}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-foreground line-clamp-2">{report.description}</p>
                    <Link href="/admin/moderation/reports" className="block text-xs font-bold text-amber-600 hover:underline pt-1">
                      Review Case →
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-muted-foreground">All systems clear. No pending reports.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions Panel */}
          <Card className="border-border bg-surface shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Quick Actions
              </h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: "Verify Tutors", icon: ShieldCheck, href: "/admin/verifications", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { label: "Support Desk", icon: HelpCircle, href: "/admin/support/tickets", color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Reports Hub", icon: Flag, href: "/admin/moderation/reports", color: "text-rose-500", bg: "bg-rose-500/10" },
                { label: "Fraud Check", icon: ShieldAlert, href: "/admin/moderation/fraud", color: "text-amber-500", bg: "bg-amber-500/10" }
              ].map((action) => (
                <Link key={action.label} href={action.href as any} className="group">
                  <div className={`p-4 rounded-2xl border border-border flex flex-col items-center justify-center gap-3 text-center transition-all hover:border-primary/50 hover:shadow-lg ${action.bg}`}>
                    <action.icon className={`h-6 w-6 ${action.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-[11px] font-bold text-foreground">{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="px-6 pb-6">
              <Button variant="outline" className="w-full text-xs font-bold gap-2 border-dashed h-10">
                <Plus className="h-3 w-3" /> Add Custom Task
              </Button>
            </div>
          </Card>

          {/* System Health */}
          <Card className="p-6 border-border bg-slate-900 text-white shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-bold text-sm">System Health</h3>
              </div>
              <Activity className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span>API Latency</span>
                  <span>42ms</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-emerald-500" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span>Database Load</span>
                  <span>28%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[28%] bg-blue-500" />
                </div>
              </div>
              <div className="pt-2 text-center">
                <p className="text-[10px] text-slate-500 font-medium italic">Operational since May 2024</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

