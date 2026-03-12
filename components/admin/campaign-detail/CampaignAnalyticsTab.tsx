import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnalyticsLineChart } from "@/components/admin/campaign-detail/AnalyticsLineChart";
import { formatVND } from "@/components/admin/campaign-detail/campaignDetailUtils";
import type { AdminCampaignAnalyticsPointDto } from "@/dtos/admin";

interface CampaignAnalyticsTabProps {
  days: number;
  onDaysChange: (days: number) => void;
  chartData: AdminCampaignAnalyticsPointDto[];
  isError: boolean;
  onRetry: () => void;
}

export function CampaignAnalyticsTab({
  days,
  onDaysChange,
  chartData,
  isError,
  onRetry,
}: CampaignAnalyticsTabProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-black/60">Khoảng thời gian:</span>
        <Select value={String(days)} onValueChange={(v) => onDaysChange(Number(v) || 30)}>
          <SelectTrigger className="h-8 w-[130px] border-black/10 bg-white">
            <SelectValue placeholder="Số ngày" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 ngày</SelectItem>
            <SelectItem value="30">30 ngày</SelectItem>
            <SelectItem value="90">90 ngày</SelectItem>
            <SelectItem value="180">180 ngày</SelectItem>
            <SelectItem value="365">365 ngày</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-center justify-between gap-2">
          <span>Không thể tải dữ liệu phân tích.</span>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCw className="w-3.5 h-3.5" />
            Thử lại
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <AnalyticsLineChart
          title="Tiến trình quyên góp theo thời gian"
          points={chartData.map((p) => ({ date: p.date, value: p.amount }))}
          valueFormatter={formatVND}
        />
        <AnalyticsLineChart
          title="Số lượng nhà hảo tâm theo thời gian"
          points={chartData.map((p) => ({ date: p.date, value: p.count }))}
          valueFormatter={(v) => `${v} người`}
        />
      </div>
    </div>
  );
}
