import { HighlightText } from "@/components/ui/highlight-text";

export function CreateCampaignHeader() {
  return (
    <div className="text-center mb-10">
      <h1 className="text-4xl md:text-5xl font-black mb-3">
        Tạo <HighlightText variant="underline" color="primary" className="gradient-text">Chiến Dịch</HighlightText>
      </h1>
      <p className="text-black/50 max-w-lg mx-auto text-sm">
        Điền thông tin chiến dịch của bạn. Sau khi gửi, đội ngũ quản trị sẽ xét duyệt trong 24h.
      </p>
    </div>
  );
}
