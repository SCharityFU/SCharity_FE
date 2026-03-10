// ── User DTOs ────────────────────────────────────────────────────────────────

import { ReportReason, ReportStatus } from './enums';
import { UserPublicDto } from './auth';

// Re-export UserPublicDto so consumers can import from user.ts too
export type { UserPublicDto } from './auth';

// ── Request DTOs ────────────────────────────────────────────────────────────

export interface UpdateUserProfileRequestDto {
  fullName?: string;
  phoneNumber?: string;
  // Avatar handled via multipart/form-data
}

export interface AddBankAccountRequestDto {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  isDefault?: boolean;
}

export interface ReportCampaignRequestDto {
  campaignId: string;
  reason: ReportReason;
  description?: string;
  evidenceUrls?: string[];
}

// ── Response DTOs ───────────────────────────────────────────────────────────

export interface BankAccountResponseDto {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  isDefault: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportResponseDto {
  id: string;
  reason: ReportReason;
  description: string | null;
  evidenceUrls: string[] | null;
  status: ReportStatus;
  campaignId: string;
  campaign?: { id: string; title: string; thumbnailUrl: string | null };
  reporterId: string;
  reporter?: UserPublicDto;
  resolvedById: string | null;
  resolvedBy?: UserPublicDto;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
