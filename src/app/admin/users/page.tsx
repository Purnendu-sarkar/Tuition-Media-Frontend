"use client";

import { UserTable } from "@/components/admin/user-table";

export default function AdminUsersPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <UserTable 
        title="All Users" 
        description="Complete overview of all users registered on the platform across all roles." 
      />
    </div>
  );
}
