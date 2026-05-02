"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ShieldCheck, Trash2, Search, Loader2, UserCircle, Mail, Calendar } from "lucide-react";
import { adminApi, AdminUser } from "@/lib/api/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UserTableProps {
  role?: "TUTOR" | "GUARDIAN";
  title: string;
  description: string;
}

export function UserTable({ role, title, description }: UserTableProps) {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (session?.accessToken) {
      fetchUsers(session.accessToken);
    }
  }, [session?.accessToken, role]);

  const fetchUsers = async (token: string) => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers(token, role);
      setUsers(data.users);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user and all their data?")) return;
    if (!session?.accessToken) return;

    try {
      setActionLoading(userId);
      await adminApi.deleteUser(session.accessToken, userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error("Failed to delete user", error);
      alert("Failed to delete user.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-[var(--font-space-grotesk)] text-foreground tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input 
            placeholder={`Search ${role?.toLowerCase() || 'users'}...`} 
            className="pl-11 h-11 bg-surface border-border/50 rounded-xl focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-border/50 bg-surface/50 backdrop-blur-sm overflow-hidden rounded-2xl shadow-xl">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-medium">Loading records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-muted-foreground uppercase tracking-widest bg-muted/30 border-b border-border/50">
                <tr>
                  <th className="px-6 py-5 font-black">User Information</th>
                  <th className="px-6 py-5 font-black">Role & Status</th>
                  <th className="px-6 py-5 font-black">Activity</th>
                  <th className="px-6 py-5 font-black">Joined Date</th>
                  <th className="px-6 py-5 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center text-primary font-bold text-lg border border-border/50 shadow-inner group-hover:scale-105 transition-transform">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-base">{user.name}</div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <Badge className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border-0 ${
                          user.role === 'ADMIN' ? 'bg-purple-500 text-white' :
                          user.role === 'TUTOR' ? 'bg-emerald-500 text-white' :
                          'bg-blue-500 text-white'
                        }`}>
                          {user.role}
                        </Badge>
                        <div className="flex items-center">
                          {user.isVerified ? (
                            <span className="inline-flex items-center gap-1 text-emerald-500 text-[11px] font-black uppercase tracking-tight">
                              <ShieldCheck className="h-3.5 w-3.5" /> Verified
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60 text-[11px] font-bold uppercase tracking-tight italic">Unverified</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs space-y-1.5 text-muted-foreground font-medium">
                        {user.role === 'TUTOR' ? (
                          <div className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-primary" />
                            {user._count.applications} Applications
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-blue-500" />
                            {user._count.postedJobs} Jobs Posted
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-muted-foreground/80 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(user.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                        onClick={() => handleDelete(user.id)}
                        disabled={actionLoading === user.id || user.role === 'ADMIN'}
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4.5 w-4.5" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center opacity-30">
                        <UserCircle className="h-12 w-12 mb-3" />
                        <p className="text-base font-bold">No records found</p>
                        <p className="text-sm">Try adjusting your search query</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
