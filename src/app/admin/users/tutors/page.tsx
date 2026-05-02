"use client";

import { UserTable } from "@/components/admin/user-table";

export default function AdminTutorsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <UserTable 
        role="TUTOR" 
        title="Tutor Management" 
        description="Review, verify, and manage all registered tutors on the platform." 
      />
    </div>
  );
}
