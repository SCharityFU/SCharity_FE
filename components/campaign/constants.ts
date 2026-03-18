import { CampaignCategory } from "@/dtos";

export const CAMPAIGN_CATEGORIES = [
  { displayName: 'Tất Cả', value: CampaignCategory.ALL, color: 'bg-gray-500' },
  { displayName: 'Nạn Nhân Da Cam', value: CampaignCategory.DAVA, color: 'bg-red-500' },
  { displayName: 'Giáo Dục', value: CampaignCategory.EDUCATION, color: 'bg-blue-500' },
  { displayName: 'Y Tế', value: CampaignCategory.MEDICAL, color: 'bg-green-500' },
  { displayName: 'Môi Trường', value: CampaignCategory.ENVIRONMENT, color: 'bg-yellow-500' },
  { displayName: 'Cứu Trợ', value: CampaignCategory.DISASTER, color: 'bg-purple-500' },
  { displayName: 'Xã Hội', value: CampaignCategory.COMMUNITY, color: 'bg-pink-500' }
];