# SCharity FE Codebase Index

Last updated: 2026-03-12 (admin layout added)

## Overview
- Stack: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Redux Toolkit + RTK Query.
- Runtime scripts:
  - `npm run dev` -> starts at port 3001
  - `npm run build`
  - `npm run start` -> serves at port 3001
  - `npm run lint`

## Root Structure
- `app/`: Next.js App Router pages and route segments.
- `components/`: Reusable UI and feature components.
- `lib/store/`: Redux store setup, typed hooks, feature slices/apis.
- `hooks/`: Shared custom hooks.
- `dtos/`: Shared request/response/domain TypeScript types.
- `public/assets/`: Static assets.
- `.agents/workflows/`: Internal guidance docs (`theme-rules.md`, `rtk-guideline.md`).

## Route Index (app)
- `app/page.tsx`: Home page.
- `app/campaigns/page.tsx`: Campaign listing page.
- `app/campaigns/[id]/page.tsx`: Campaign detail page.
- `app/campaigns/create/page.tsx`: Campaign creation page.
- `app/admin/layout.tsx`: Shared admin layout with sidebar navigation.
- `app/admin/page.tsx`: Default admin dashboard route.
- `app/admin/campaigns/page.tsx`: Admin campaigns management table (filters/search/pagination).
- `app/admin/campaigns/[id]/page.tsx`: Admin campaign detail with tabs (basic/analytics/transactions).
- `app/admin/transactions/page.tsx`: Admin donation transactions list (search/sort/pagination).
- `app/dashboard/page.tsx`: Dashboard root.
- `app/dashboard/my-campaigns/page.tsx`: Current user's campaigns.
- `app/dashboard/my-requests/page.tsx`: Withdrawal/requests listing.
- `app/dashboard/my-requests/[requestId]/bank-info/page.tsx`: Bank info for a request.
- `app/login/page.tsx`: Login page.
- `app/register/page.tsx`: Register page.
- `app/forgot-password/page.tsx`: Forgot password flow.
- `app/reset-password/page.tsx`: Reset password flow.
- `app/verify-email/page.tsx`: Verify email flow.
- `app/kyc/page.tsx`: KYC page.
- `app/layout.tsx`: Root app layout.
- `app/not-found.tsx`: Not found page.
- `app/globals.css`: Global styles.

## Component Index
- `components/layout/`
  - `Navbar.tsx`
  - `Footer.tsx`
- `components/home/`
  - `HeroSection.tsx`
  - `FeaturedCampaignsSection.tsx`
  - `FeaturesSection.tsx`
  - `HowItWorksSection.tsx`
  - `StatsSection.tsx`
  - `CTABanner.tsx`
- `components/campaign/`
  - `CampaignGrid.tsx`
  - `detail/`:
    - `CampaignHeader.tsx`
    - `CampaignImageSlider.tsx`
    - `CampaignSidebar.tsx`
    - `CampaignStory.tsx`
    - `CampaignComments.tsx`
    - `CampaignUpdates.tsx`
- `components/campaigns/`
  - `CampaignCard.tsx`
  - `ReportCampaignModal.tsx`
- `components/auth/`
  - `LoginForm.tsx`
  - `RegisterForm.tsx`
  - `GoogleLoginButton.tsx`
- `components/providers/`
  - `StoreProvider.tsx`
  - `AuthProvider.tsx`
  - `GoogleProvider.tsx`
- `components/ui/`: Design system and animated utility components.
  - `rich-text-content.tsx`: Reusable renderer for custom rich-text HTML/plain content.
- `components/admin/campaign-detail/AnalyticsLineChart.tsx`: Reusable line chart for admin campaign analytics.
  - `CampaignDetailHeader.tsx`: Header + tab navigation for admin campaign detail.
  - `CampaignBasicTab.tsx`: Basic info tab content.
  - `CampaignAnalyticsTab.tsx`: Analytics tab content.
  - `CampaignTransactionsTab.tsx`: Transactions tab table and filters.
  - `campaignDetailUtils.ts`: Shared format/status helpers for admin campaign detail UI.
 - `components/admin/campaigns/`
  - `CampaignsFilters.tsx`: Filter/search controls for admin campaigns list.
  - `CampaignsTable.tsx`: Admin campaigns table with pagination and actions.
  - `campaignsUtils.ts`: Shared format/status helpers for campaigns list.
 - `components/admin/transactions/`
  - `TransactionsTable.tsx`: Admin transactions table + search + sorting.
  - `transactionsUtils.ts`: Shared format/status helpers for transactions list.

## State and Data Layer Index
- `lib/store/store.ts`: Store configuration, reducer registration, middleware.
- `lib/store/hooks.ts`: Typed Redux hooks.
- `lib/store/features/auth/`
  - `authApi.ts`: Auth endpoints.
  - `authSlice.ts`: Auth client state.
- `lib/store/features/campaign/campaignApi.ts`: Campaign endpoints.
- `lib/store/features/home/homeApi.ts`: Home page endpoints.
- `lib/store/features/report/reportApi.ts`: Report endpoints.
- `lib/store/features/admin/adminApi.ts`: Admin endpoints (platform/campaign transactions).

## DTO Index
- `dtos/index.ts`: Barrel export for DTO modules.
- DTO modules:
  - `admin.ts`
  - `auth.ts`
  - `campaign.ts`
  - `common.ts`
  - `donation.ts`
  - `enums.ts`
  - `user.ts`
  - `withdraw.ts`

## Shared Utilities
- `hooks/useAuth.ts`: Authentication helper hook(s).
- `hooks/useVietQRBanks.ts`: VietQR bank data hook.
- `lib/utils.ts`: Generic utility helpers.

## Notes for Future Updates
- When adding a new route under `app/`, register it in the Route Index section.
- When adding a new Redux feature, register it in the State and Data Layer section.
- When adding shared components, register them in the relevant Component Index subsection.
- Keep this file as a quick navigation map (not deep implementation docs).
