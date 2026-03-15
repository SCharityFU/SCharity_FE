import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { HighlightText } from "@/components/ui/highlight-text";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Magnetic } from "@/components/ui/magnetic";

interface MyRequestsHeaderProps {
  onBackToDashboard: () => void;
}

export function MyRequestsHeader({ onBackToDashboard }: MyRequestsHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-10">
      <div>
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1 text-sm text-black/40 hover:text-black/70 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>
        <h1 className="text-3xl md:text-4xl font-black text-black">
          <HighlightText variant="underline" color="primary">
            Yêu Cầu Tạo Chiến Dịch
          </HighlightText>
        </h1>
        <p className="text-black/50 text-sm mt-2">
          Danh sách các yêu cầu tạo chiến dịch bạn đã gửi
        </p>
      </div>
      <Magnetic intensity={0.3} range={60}>
        <Link href="/campaigns/create">
          <RainbowButton
            colors={["#f43f5e", "#8b5cf6", "#f43f5e"]}
            duration={2.5}
            borderWidth={1.5}
            className="text-sm"
          >
            <Plus className="w-4 h-4" />
            Tạo Mới
          </RainbowButton>
        </Link>
      </Magnetic>
    </div>
  );
}
