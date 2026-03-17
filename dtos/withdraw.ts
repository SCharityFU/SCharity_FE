// ── Withdraw DTOs ────────────────────────────────────────────────────────────

import { WithdrawStatus } from './enums';
import { UserPublicDto } from './auth';
import type { CampaignDto } from './campaign';

// ── Request DTOs ────────────────────────────────────────────────────────────

export interface CreateWithdrawRequestDto {
  campaignId: string;
  bankAccountId: string;
}

// ── Response DTOs ───────────────────────────────────────────────────────────

export interface WithdrawRequestResponseDto {
  id: string;
  amount: number;
  status: WithdrawStatus;
  rejectReason: string | null;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  };
  campaignId: string;
  campaign?: CampaignDto;
  requesterId: string;
  requester?: UserPublicDto;
  processedById: string | null;
  processedBy?: UserPublicDto;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
