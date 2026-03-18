'use client';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { VercelTabs } from '@/components/ui/vercel-tabs';
import { Magnetic } from '@/components/ui/magnetic';
import { HighlightText } from '@/components/ui/highlight-text';
import { useGetCampaignsQuery } from '@/lib/store/features/home/homeApi';
import { CampaignCategory } from '@/dtos/enums';
import CampaignGrid from '@/components/campaign/CampaignGrid';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { CAMPAIGN_CATEGORIES } from '@/components/campaign/constants';

export default function CampaignsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CampaignCategory>(CampaignCategory.ALL);
  const [page, setPage] = useState(1);
  const [limit] = useState(9); // Default page size
  const deferredSearch = useDeferredValue(search);
  const debouncedSearch = useDebounce(deferredSearch, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const {
    data: campaigns,
    isLoading,
    isFetching,
  } = useGetCampaignsQuery(
    {
      limit: limit * page, // simple 'load more' technique: keep limit large or load dynamically
      page: 1,
      search: debouncedSearch.trim().length > 2 ? debouncedSearch.trim() : undefined,
      category: activeCategory || undefined,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    },
    {
      // Helps avoid aggressive refetching while typing fast
      refetchOnMountOrArgChange: true,
    },
  );

  const handleTabChange = (value: string) => {
    setActiveCategory(value as CampaignCategory);
    setPage(1); // Reset page on category change
  };

  const tabs = useMemo(
    () =>
      CAMPAIGN_CATEGORIES.map((cat) => ({
        label: cat.displayName,
        value: cat.value,
        content: (
          <div>
            <CampaignGrid campaigns={campaigns} isLoading={isLoading || isFetching} />
          </div>
        ),
      })),
    [campaigns, isLoading, isFetching],
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Các Chiến Dịch{' '}
            <HighlightText variant="underline" color="primary" className="gradient-text">
              Ý Nghĩa
            </HighlightText>
          </h1>
          <p className="text-black/50 max-w-xl mx-auto">
            Hàng trăm chiến dịch đang cần sự hỗ trợ của bạn. Hãy chọn lĩnh vực bạn quan tâm.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <input
              type="text"
              placeholder="Tìm kiếm chiến dịch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-black/10 text-black placeholder-black/30 outline-none focus:border-rose-500/50 transition-colors text-sm"
            />
          </div>
          <button className="px-4 py-3 rounded-xl glass border border-black/10 flex items-center gap-2 text-sm text-black/60 hover:text-black hover:bg-black/10 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            Bộ Lọc
          </button>
        </div>

        <VercelTabs tabs={tabs} defaultTab={CampaignCategory.ALL} onTabChange={handleTabChange} />

        {/* Load More */}
        {campaigns && campaigns.length >= limit * page && (
          <div className="text-center mt-12">
            <Magnetic intensity={0.3} range={60}>
              <Button variant={'outline'} onClick={() => setPage(page + 1)}>
                {isFetching ? 'Đang tải...' : 'Tải Thêm Chiến Dịch'}
                {!isFetching && <ArrowRight className="w-4 h-4" />}
              </Button>
            </Magnetic>
          </div>
        )}
      </div>
    </div>
  );
}
