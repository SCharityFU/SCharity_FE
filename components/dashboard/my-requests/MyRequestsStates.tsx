import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MyRequestsLoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {["s1", "s2", "s3", "s4", "s5", "s6"].map((key) => (
        <div
          key={key}
          className="glass-card rounded-2xl p-5 animate-pulse flex flex-col"
          style={{ minHeight: 280 }}
        >
          <div className="h-5 bg-black/10 rounded w-1/2 mb-3" />
          <div className="h-4 bg-black/10 rounded w-3/4 mb-2" />
          <div className="h-3 bg-black/10 rounded w-full mb-2" />
          <div className="h-3 bg-black/10 rounded w-2/3 mb-2" />
          <div className="h-12 bg-black/10 rounded w-full mb-3 mt-auto" />
          <div className="h-8 bg-black/10 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function MyRequestsEmptyState() {
  return (
    <div className="glass-card rounded-2xl p-12 text-center">
      <FileText className="w-12 h-12 text-black/20 mx-auto mb-4" />
      <p className="text-black/50 text-lg mb-2">Chưa có yêu cầu nào</p>
      <p className="text-black/30 text-sm mb-6">Hãy tạo chiến dịch gây quỹ đầu tiên của bạn</p>
      <Link href="/campaigns/create">
        <Button>
          <Plus className="w-4 h-4" />
          Tạo Chiến Dịch
        </Button>
      </Link>
    </div>
  );
}
