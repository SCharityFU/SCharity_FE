// ── Donation DTOs ────────────────────────────────────────────────────────────

import { DonationStatus, PaymentMethod } from './enums';
import { UserPublicDto } from './auth';
import type { CampaignDto } from './campaign';

// ── Request DTOs ────────────────────────────────────────────────────────────

export interface CreateDonationRequestDto {
  campaignId: string;
  amount: number;
  message?: string;
  isAnonymous?: boolean;
  paymentMethod?: PaymentMethod;
}

export interface DonationHistoryQueryDto {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'amount';
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateCommentRequestDto {
  campaignId: string;
  content: string;
  emoji?: string;
  isAnonymous?: boolean;
  donationId?: string;
}

export interface CampaignDonationsQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CommentsQueryDto {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'highest_donation';
}

// ── Response DTOs ───────────────────────────────────────────────────────────

export interface DonationResponseDto {
  id: string;
  amount: number;
  status: DonationStatus;
  paymentMethod: PaymentMethod | null;
  transactionRef: string | null;
  message: string | null;
  isAnonymous: boolean;
  /** Masked display name: "Nhà hảo tâm ẩn danh" when isAnonymous==true */
  donorDisplayName: string;
  bankName: string | null;
  /** Masked: only first 3 digits visible (e.g. "123*****") */
  bankAccount: string | null;
  campaignId: string;
  campaign?: CampaignDto;
  donorId: string | null;
  donor?: UserPublicDto;
  paymentMetadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommentResponseDto {
  id: string;
  content: string;
  emoji: string | null;
  isAnonymous: boolean;
  campaignId: string;
  donorId: string;
  donor?: UserPublicDto;
  donationId: string | null;
  donation?: DonationResponseDto;
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
