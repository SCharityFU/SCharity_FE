export interface CreatorDashboardQueryDto {
  campaignLimit?: number;
  donationLimit?: number;
  campaignCursor?: string;
  donationCursor?: string;
  timezone?: string;
}

export interface CreatorDashboardPaginationDto {
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export interface CreatorDashboardSummaryDto {
  totalRaisedAmount: number;
  activeCampaignCount: number;
  pendingRequestCount: number;
  totalDonorCount: number;
  daysSinceJoined: number;
}

export interface CreatorDashboardKycDto {
  isKycVerified: boolean;
  kycStatus?: string;
}

export interface CreatorDashboardQuickNavDto {
  myRequestsTotal: number;
  myRequestsPending: number;
  myCampaignsTotal: number;
  myCampaignsActive: number;
}

export interface CreatorDashboardDonationPreviewDto {
  id: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  createdAt: string;
  relativeTimeLabel?: string;
  isAnonymous: boolean;
  donorDisplayName: string;
  status: string;
}

export interface CreatorDashboardCampaignPreviewDto {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  status: string;
  raisedAmount: number;
  goalAmount: number;
  progressPercent: number;
  donorCount: number;
  daysLeft: number;
  deadline: string;
}

export interface CreatorDashboardAlertsDto {
  needKyc: boolean;
  hasOverdueCampaigns: boolean;
  hasRejectedRequests: boolean;
}

export interface CreatorDashboardResponseDto {
  summary: CreatorDashboardSummaryDto;
  kyc: CreatorDashboardKycDto;
  quickNav: CreatorDashboardQuickNavDto;
  recentDonationsToMyCampaigns: CreatorDashboardDonationPreviewDto[];
  recentDonationsPagination: CreatorDashboardPaginationDto;
  myCampaignsPreview: CreatorDashboardCampaignPreviewDto[];
  myCampaignsPreviewPagination: CreatorDashboardPaginationDto;
  alerts: CreatorDashboardAlertsDto;
  updatedAt: string;
}
