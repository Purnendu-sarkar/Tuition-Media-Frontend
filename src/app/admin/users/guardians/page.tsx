"use client";

import { UserTable } from "@/components/admin/user-table";

export default function AdminGuardiansPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <UserTable 
        role="GUARDIAN" 
        title="Guardian Management" 
        description="Monitor guardian activity and manage job posting accounts." 
      />
    </div>
  );
}
