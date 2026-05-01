"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  Users, 
  GraduationCap, 
  UserCircle, 
  Briefcase, 
  ShieldAlert
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { adminApi, AdminStats } from "@/lib/api/admin";

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchStats(session.user.accessToken);
    }
  }, [session]);

  const fetchStats = async (token: string) => {
    try {
      setLoading(true);
      const data = await adminApi.getStats(token);
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
      border: "border-blue-500/20"
    },
    {
      title: "Tutors",
      value: stats?.totalTutors || 0,
      icon: GraduationCap,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      title: "Guardians",
      value: stats?.totalGuardians || 0,
      icon: UserCircle,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20"
    },
    {
      title: "Active Jobs",
      value: stats?.activeJobs || 0,
      icon: Briefcase,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    },
    {
      title: "Pending Verifications",
      value: stats?.pendingVerifications || 0,
      icon: ShieldAlert,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Platform Overview</h1>
        <p className="text-muted-foreground mt-1">Real-time statistics of the Tuition Media platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 border-border bg-surface overflow-hidden relative group">
              <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-20 transition-transform group-hover:scale-150 duration-500 ${stat.bg}`}></div>
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl border ${stat.bg} ${stat.border} ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
