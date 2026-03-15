"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LegacyAdminDashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-[360px] flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
    </div>
  );
}

