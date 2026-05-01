"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Trash2, Search, ExternalLink } from "lucide-react";
import { adminApi, AdminJob } from "@/lib/api/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminJobsPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchJobs(session.user.accessToken);
    }
  }, [session]);

  const fetchJobs = async (token: string) => {
    try {
      setLoading(true);
      const data = await adminApi.getJobs(token);
      setJobs(data.jobs);
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to permanently delete this job? This will also delete all applications associated with it.")) return;
    if (!session?.user?.accessToken) return;

    try {
      setActionLoading(jobId);
      await adminApi.deleteJob(session.user.accessToken, jobId);
      setJobs(jobs.filter(j => j.id !== jobId));
    } catch (error) {
      console.error("Failed to delete job", error);
      alert("Failed to delete job.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(search.toLowerCase()) || 
    j.guardian.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Moderation</h1>
          <p className="text-muted-foreground mt-1">Review active jobs and remove spam or inappropriate postings.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title or guardian..." 
            className="pl-9 bg-surface"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Job Title</th>
                  <th className="px-6 py-4 font-medium">Guardian</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Applications</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground max-w-xs truncate" title={job.title}>{job.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Budget: {job.budget ? `৳${job.budget}` : 'Negotiable'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{job.guardian.name}</div>
                      <div className="text-xs text-muted-foreground">{job.guardian.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                        job.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-500' :
                        job.status === 'IN_PROGRESS' ? 'bg-indigo-500/10 text-indigo-500' :
                        'bg-muted/30 text-muted-foreground'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {job._count.applications}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => handleDelete(job.id)}
                        disabled={actionLoading === job.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredJobs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No jobs found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
