import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ADMIN_REPORT_STATUS_OPTIONS } from "@/components/admin/reports/reportsUtils";

interface ReportsFiltersProps {
  status: string;
  onStatusChange: (value: string) => void;
}

export function ReportsFilters({ status, onStatusChange }: ReportsFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full h-9 border-black/10 bg-white">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          {ADMIN_REPORT_STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
