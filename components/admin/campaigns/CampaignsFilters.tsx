import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ADMIN_CAMPAIGN_STATUS_OPTIONS } from "@/components/admin/campaigns/campaignsUtils";

interface CampaignsFiltersProps {
  search: string;
  status: string;
  category: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export function CampaignsFilters({
  search,
  status,
  category,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
}: CampaignsFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      <div className="md:col-span-2">
        <label htmlFor="admin-campaign-search" className="sr-only">Tìm kiếm campaign</label>
        <input
          id="admin-campaign-search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tên campaign"
          className="w-full h-9 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-rose-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full h-9 border-black/10 bg-white">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {ADMIN_CAMPAIGN_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          placeholder="Category"
          className="w-full h-9 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-rose-400"
        />
      </div>
    </div>
  );
}
