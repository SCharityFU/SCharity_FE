import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnalyticsLineChart } from '@/components/admin/campaign-detail/AnalyticsLineChart';
import {
  formatDateTimeVN,
  formatVND,
  txStatusClass,
  txStatusLabel,
} from '@/components/admin/campaign-detail/campaignDetailUtils';
import type { AdminCampaignAnalyticsPointDto } from '@/dtos/admin';
import type { AdminDonationItem } from '@/lib/store/features/admin/adminApi';

function compactMoneyTick(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

interface CampaignAnalyticsTabProps {
  days: number;
  onDaysChange: (days: number) => void;
  chartData: AdminCampaignAnalyticsPointDto[];
  isError: boolean;
  onRetry: () => void;
  selectedDate: string | null;
  onSelectDateFromChart: (date: string) => void;
  onClearSelectedDate: () => void;
  selectedDateDonations: AdminDonationItem[];
  isLoadingSelectedDateDonations: boolean;
  isSelectedDateDonationsError: boolean;
  onRetrySelectedDateDonations: () => void;
}

function formatDateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function CampaignAnalyticsTab({
  days,
  onDaysChange,
  chartData,
  isError,
  onRetry,
  selectedDate,
  onSelectDateFromChart,
  onClearSelectedDate,
  selectedDateDonations,
  isLoadingSelectedDateDonations,
  isSelectedDateDonationsError,
  onRetrySelectedDateDonations,
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

      <div className="space-y-3">
        <AnalyticsLineChart
          title="Tiến trình quyên góp theo thời gian"
          points={chartData.map((p) => ({ date: p.date, value: p.amount }))}
          valueFormatter={formatVND}
          yAxisLabel="Số tiền (VND)"
          yAxisTickFormatter={compactMoneyTick}
          onPointSelect={(payload) => onSelectDateFromChart(payload.date)}
        />
        <AnalyticsLineChart
          title="Số lượng nhà hảo tâm theo thời gian"
          points={chartData.map((p) => ({ date: p.date, value: p.count }))}
          valueFormatter={(v) => `${v} người`}
          yAxisLabel="Số nhà hảo tâm"
          yAxisTickFormatter={(v) => String(v)}
          onPointSelect={(payload) => onSelectDateFromChart(payload.date)}
        />
      </div>

      <div className="rounded-xl border border-black/10 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-black">Danh sách donate theo ngày</p>
            <p className="text-xs text-black/50">
              {selectedDate
                ? `Đang xem ngày ${formatDateLabel(selectedDate)}. Bấm điểm khác trên biểu đồ để đổi ngày.`
                : 'Bấm vào một điểm trên biểu đồ để xem các lượt donate trong ngày đó.'}
            </p>
          </div>
          {selectedDate && (
            <Button variant="outline" size="sm" onClick={onClearSelectedDate}>
              Bỏ chọn ngày
            </Button>
          )}
        </div>

        {!selectedDate && <p className="text-sm text-black/55">Chưa chọn ngày để hiển thị dữ liệu donate.</p>}

        {selectedDate && isSelectedDateDonationsError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-center justify-between gap-2">
            <span>Không thể tải danh sách donate theo ngày đã chọn.</span>
            <Button variant="outline" size="sm" onClick={onRetrySelectedDateDonations}>
              <RotateCw className="w-3.5 h-3.5" />
              Thử lại
            </Button>
          </div>
        )}

        {selectedDate && !isSelectedDateDonationsError && (
          <div className="overflow-x-auto rounded-lg border border-black/10">
            <table className="min-w-full text-sm">
              <thead className="bg-black/[0.02] text-black/65">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Nhà hảo tâm</th>
                  <th className="text-left px-3 py-2 font-medium">Thời gian</th>
                  <th className="text-right px-3 py-2 font-medium">Số tiền</th>
                  <th className="text-left px-3 py-2 font-medium">Lời nhắn</th>
                  <th className="text-left px-3 py-2 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {selectedDateDonations.map((row) => (
                  <tr key={row.id} className="border-t border-black/5">
                    <td className="px-3 py-2">{row.donorDisplayName || '-'}</td>
                    <td className="px-3 py-2 text-black/70">{formatDateTimeVN(row.createdAt)}</td>
                    <td className="px-3 py-2 text-right font-semibold">{formatVND(row.amount)}</td>
                    <td className="px-3 py-2 text-black/70 line-clamp-2">{row.message || '-'}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${txStatusClass(row.status)}`}
                      >
                        {txStatusLabel(row.status)}
                      </span>
                    </td>
                  </tr>
                ))}

                {selectedDateDonations.length === 0 && !isLoadingSelectedDateDonations && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-black/50">
                      Không có giao dịch donate trong ngày đã chọn.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {selectedDate && isLoadingSelectedDateDonations && (
          <p className="text-xs text-black/45">Đang tải danh sách donate...</p>
        )}
      </div>
    </div>
  );
}
