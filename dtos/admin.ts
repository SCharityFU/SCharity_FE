// ── Admin DTOs ───────────────────────────────────────────────────────────────

import {
  CampaignRequestStatus,
  CampaignCategory,
  CampaignStatus,
  WithdrawStatus,
  ReportStatus,
} from './enums';
import { DonationChartDataPointDto } from './campaign';

// ── Request DTOs ────────────────────────────────────────────────────────────

export interface ReviewCampaignRequestDto {
  action: 'approve' | 'reject';
  rejectReason?: string;
}

export interface SuspendCampaignRequestDto {
  reason: string;
}

export interface ProcessWithdrawRequestDto {
  action: 'approve' | 'reject';
  rejectReason?: string;
}

export interface DonationChartQueryDto {
  interval?: 'day' | 'week' | 'month';
  days?: number;
}

export interface AdminCampaignRequestsQueryDto {
  page?: number;
  limit?: number;
  status?: CampaignRequestStatus;
}

export interface AdminCampaignsQueryDto {
  page?: number;
  limit?: number;
  status?: CampaignStatus;
  category?: CampaignCategory | string;
  search?: string;
}

export interface AdminWithdrawRequestsQueryDto {
  page?: number;
  limit?: number;
  status?: WithdrawStatus;
}

export interface AdminReportsQueryDto {
  page?: number;
  limit?: number;
  status?: ReportStatus;
}

export interface AdminTransactionsQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface AdminCampaignTransactionsQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'amount';
  sortOrder?: 'ASC' | 'DESC';
}

// ── Response DTOs ───────────────────────────────────────────────────────────

export interface DashboardStatsResponseDto {
  totalCampaigns: number;
  successfulCampaigns: number;
  suspendedCampaigns: number;
  totalDonationReceived: number;
  totalDonationPaid: number;
  adminBalance: number;
  totalCampaignCreators: number;
  totalDonors: number;
  totalUsers: number;
}

// Re-export chart DTO for convenience
export type { DonationChartDataPointDto } from './campaign';

// Admin list/detail endpoints reuse domain response DTOs:
// - CampaignRequestResponseDto   (from campaign)
// - CampaignDto                  (from campaign)
// - WithdrawRequestResponseDto   (from withdraw)
// - ReportResponseDto            (from user)
// - DonationResponseDto          (from donation)
