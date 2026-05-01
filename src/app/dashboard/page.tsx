import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { tutorApi } from "@/lib/api/tutor";
import { guardianApi } from "@/lib/api/guardian";
import { TutorDashboard } from "@/components/dashboard/tutor-dashboard";
import { GuardianDashboard } from "@/components/dashboard/guardian-dashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  let dashboardData = null;
  let fetchError = null;

  if (session.accessToken) {
    try {
      if (session.user.role === "TUTOR") {
        dashboardData = await tutorApi.getDashboardStats(session.accessToken);
      } else if (session.user.role === "GUARDIAN") {
        dashboardData = await guardianApi.getDashboardStats(session.accessToken);
      }
    } catch (error: any) {
      fetchError = error.message || "Failed to load dashboard data.";
    }
  }

  return (
    <main className="w-full">
      <header className="mb-8">
        <h1 className="font-[var(--font-space-grotesk)] text-3xl font-semibold text-foreground">
          Welcome back, {session.user.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here is what's happening with your {session.user.role.toLowerCase()} account today.
        </p>
      </header>

      {fetchError ? (
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-6 text-red-500 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <div>
            <h3 className="font-semibold text-lg">Error loading dashboard</h3>
            <p className="text-sm opacity-90 mt-1">{fetchError}</p>
          </div>
        </div>
      ) : dashboardData ? (
        session.user.role === "TUTOR" ? (
          <TutorDashboard data={dashboardData as any} />
        ) : (
          <GuardianDashboard initialData={dashboardData as any} token={session.accessToken!} />
        )
      ) : (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      )}
    </main>
  );
}
