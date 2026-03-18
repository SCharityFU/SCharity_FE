import { CampaignCategory } from "@/dtos/enums";

export const TITLE_MAX = 100;
export const GOAL_PRESETS = [5_000_000, 10_000_000, 50_000_000, 100_000_000];
export const DRAFT_STORAGE_KEY = "FCam_campaign_draft";
export const MAX_CAMPAIGN_DEADLINE_DAYS = 90;

export const CATEGORY_LABELS: Record<CampaignCategory, string> = {
  [CampaignCategory.DAVA]: "Nạn nhân chất độc da cam",
  [CampaignCategory.EDUCATION]: "Giáo dục",
  [CampaignCategory.MEDICAL]: "Y tế",
  [CampaignCategory.DISASTER]: "Thiên tai",
  [CampaignCategory.COMMUNITY]: "Cộng đồng",
  [CampaignCategory.ENVIRONMENT]: "Môi trường",
  [CampaignCategory.OTHER]: "Khác",
  [CampaignCategory.ALL]: ""
};
