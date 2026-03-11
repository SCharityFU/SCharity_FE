// ── Campaign DTOs ────────────────────────────────────────────────────────────

import {
  CampaignStatus,
  CampaignCategory,
  CampaignRequestStatus,
  UpdateCategory,
} from './enums';
import { UserPublicDto } from './auth';
import type { DonationResponseDto } from './donation';

// ── Request DTOs ────────────────────────────────────────────────────────────

export interface BankInfoDto {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
}

export interface SubmitCampaignRequestDto {
  title: string;
  story: string;
  goalAmount: number;
  deadline: string; // ISO datetime
  category?: CampaignCategory;
  bankInfo: BankInfoDto;
  // Files handled via multipart/form-data (thumbnail, media, proofDocuments)
}

export interface UpdateCampaignRequestDto {
  story?: string;
  thumbnailUrl?: string;
}

export interface CampaignQueryRequestDto {
  page?: number;
  limit?: number;
  status?: string;
  category?: CampaignCategory;
  search?: string;
  sortBy?: 'createdAt' | 'raisedAmount' | 'deadline' | 'goalAmount';
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateCampaignUpdateRequestDto {
  title: string;
  content: string;
  category?: UpdateCategory;
  isDraft?: boolean;
  // Files handled via multipart/form-data
}

export interface CloseCampaignRequestDto {
  confirm: boolean;
}

export interface CampaignAnalyticsQueryDto {
  days?: number;
}

// ── Response DTOs ───────────────────────────────────────────────────────────

export interface CampaignDto {
  id: string;
  title: string;
  story: string;
  goalAmount: number;
  raisedAmount: number;
  /** Computed: min(100, raisedAmount / goalAmount * 100) */
  progressPercent: number;
  deadline: string;
  status: CampaignStatus;
  category: CampaignCategory;
  thumbnailUrl: string | null;
  mediaUrls: string[] | null;
  suspendReason: string | null;
  suspendedAt: string | null;
  closedAt: string | null;
  approvedAt: string | null;
  donorCount: number;
  reportCount: number;
  creatorId: string;
  creator?: UserPublicDto;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignRequestResponseDto {
  id: string;
  title: string;
  story: string;
  goalAmount: number;
  deadline: string;
  thumbnailUrl: string | null;
  mediaUrls: string[] | null;
  category: string | null;
  status: CampaignRequestStatus;
  rejectReason: string | null;
  bankInfo: BankInfoDto | null;
  proofDocuments: string[] | null;
  requesterId: string;
  requester?: UserPublicDto;
  reviewedById: string | null;
  reviewedBy?: UserPublicDto;
  reviewedAt: string | null;
  campaignId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignUpdateResponseDto {
  id: string;
  title: string;
  content: string;
  category: UpdateCategory;
  mediaUrls: string[] | null;
  isEdited: boolean;
  editedAt: string | null;
  isDraft: boolean;
  campaignId: string;
  creatorId: string;
  creator?: UserPublicDto;
  createdAt: string;
  updatedAt: string;
}

export interface DonationChartDataPointDto {
  date: string;
  amount: number;
  count: number;
}

export interface CampaignAnalyticsResponseDto {
  campaign: CampaignDto;
  chartData: DonationChartDataPointDto[];
  recentDonations: DonationResponseDto[];
  totalDonors: number;
}

export interface PublicCampaignDetailResponseDto extends CampaignDto {
  donations: import('./donation').DonationResponseDto[];
  updates: CampaignUpdateResponseDto[];
  comments: import('./donation').CommentResponseDto[];
}
