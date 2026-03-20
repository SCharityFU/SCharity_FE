// ── All domain enums (standalone — no backend imports) ──────────────────────

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum CampaignStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  CLOSED = 'closed',
  SUSPENDED = 'suspended',
  COMPLETED = 'completed',
  WITHDRAWN = 'withdrawn',
  REJECTED = 'rejected',
}

export enum CampaignCategory {
  ALL = '',
  DAVA = 'dava',
  EDUCATION = 'education',
  MEDICAL = 'medical',
  DISASTER = 'disaster',
  COMMUNITY = 'community',
  ENVIRONMENT = 'environment',
  OTHER = 'other',
}

export enum CampaignRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum UpdateCategory {
  PROGRESS = 'progress',
  FINANCIAL = 'financial',
  THANK_YOU = 'thank_you',
  OTHER = 'other',
  AFTER_CAMPAIGN = 'after_campaign',
  COMPLETION = 'completion',
}

export enum DonationStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  VNPAY = 'vnpay',
  MOMO = 'momo',
  STRIPE = 'stripe',
  BANK_TRANSFER = 'bank_transfer',
}

export enum WithdrawStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
}

export enum ReportReason {
  FALSE_INFORMATION = 'false_information',
  FAKE_IMAGE = 'fake_image',
  NO_UPDATE = 'no_update',
  FRAUD = 'fraud',
  OTHER = 'other',
}
