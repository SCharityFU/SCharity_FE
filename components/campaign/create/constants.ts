import { CampaignCategory } from "@/dtos/enums";

export const TITLE_MAX = 100;
export const GOAL_PRESETS = [5_000_000, 10_000_000, 50_000_000, 100_000_000];
export const DRAFT_STORAGE_KEY = "FCam_campaign_draft";
export const MAX_CAMPAIGN_DEADLINE_DAYS = 90;
export const MINIMUM_CAMPAIGN_GOAL = 30_000;
export const MAXIMUM_CAMPAIGN_GOAL = 5_000_000_000;
export const MIN_DONATION_AMOUNT = 10_000;
export const MAX_DONATION_AMOUNT = 1_000_000_000;

export const DONOR_PREVIEW = 8;
export const SUCCESS_DONATION_STATUSES = new Set(['success', 'completed', 'paid']);

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
