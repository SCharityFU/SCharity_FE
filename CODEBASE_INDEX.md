# SCharity FE Codebase Index

Last updated: 2026-03-15

## Overview
- Stack: Next.js 15.2.1 (App Router), React 19, TypeScript 5, Tailwind CSS 3.4
- State/Data: Redux Toolkit + RTK Query
- UI: Shadcn/Radix-based components, Lucide icons, Motion, Sonner
- Forms/Validation: React Hook Form + Zod
- Dev port: 3001 (`npm run dev`)
- API base (default): `http://localhost:3000/api/v1` via `NEXT_PUBLIC_API_URL`
- Alias: `@/*` -> `./*`

## Scripts
| Script | Command |
|---|---|
| dev | `next dev -p 3001` |
| build | `next build` |
| start | `next start -p 3001` |
| lint | `next lint` |

## Top-Level Structure
```
app/                 # Next.js routes and layouts
components/          # Feature and shared UI components
dtos/                # Shared request/response and domain types
hooks/               # Reusable hooks
lib/                 # Utilities and Redux store
public/assets/       # Static assets
private/             # Internal notes/prompts
```

## Route Index (app)

### App Shell
- `app/layout.tsx`
- `app/globals.css`
- `app/loading.tsx`
- `app/not-found.tsx`
- `app/page.tsx`

### Public/User-Facing Routes
- `/campaigns` -> `app/campaigns/page.tsx`
- `/campaigns/[id]` -> `app/campaigns/[id]/page.tsx`
- `/campaigns/create` -> `app/campaigns/create/page.tsx`
- `/login` -> `app/login/page.tsx`
- `/register` -> `app/register/page.tsx`
- `/forgot-password` -> `app/forgot-password/page.tsx`
- `/reset-password` -> `app/reset-password/page.tsx`
- `/verify-email` -> `app/verify-email/page.tsx`
- `/donations/callback` -> `app/donations/callback/page.tsx`

### Authenticated User Routes
- `/dashboard` -> `app/dashboard/page.tsx`
- `/dashboard/my-campaigns` -> `app/dashboard/my-campaigns/page.tsx`
- `/dashboard/my-requests` -> `app/dashboard/my-requests/page.tsx`
- `/dashboard/my-requests/[requestId]/bank-info` -> `app/dashboard/my-requests/[requestId]/bank-info/page.tsx`
- `/dashboard/mydonation` -> `app/dashboard/mydonation/page.tsx`
- `/kyc` -> `app/kyc/page.tsx`
- `/profile` -> `app/profile/page.tsx`

### Admin Routes
- `/admin` -> `app/admin/page.tsx`
- `/admin` layout -> `app/admin/layout.tsx`
- `/admin/campaign-requests` -> `app/admin/campaign-requests/page.tsx`
- `/admin/campaign-requests/[id]` -> `app/admin/campaign-requests/[id]/page.tsx`
- `/admin/campaigns` -> `app/admin/campaigns/page.tsx`
- `/admin/campaigns/[id]` -> `app/admin/campaigns/[id]/page.tsx`
- `/admin/reports` -> `app/admin/reports/page.tsx`
- `/admin/transactions` -> `app/admin/transactions/page.tsx`
- `/admin/withdraw-requests` -> `app/admin/withdraw-requests/page.tsx`
- `/admin/withdraw-requests/[id]` -> `app/admin/withdraw-requests/[id]/page.tsx`

## Components Index

### Layout and Providers
- `components/layout/Navbar.tsx`
- `components/layout/Footer.tsx`
- `components/providers/AuthProvider.tsx`
- `components/providers/GoogleProvider.tsx`
- `components/providers/RouteGuard.tsx`
- `components/providers/StoreProvider.tsx`
- `components/providers/ToastProvider.tsx`

### Auth
- `components/auth/LoginForm.tsx`
- `components/auth/RegisterForm.tsx`
- `components/auth/GoogleLoginButton.tsx`

### Home
- `components/home/HeroSection.tsx`
- `components/home/FeaturedCampaignsSection.tsx`
- `components/home/FeaturesSection.tsx`
- `components/home/HowItWorksSection.tsx`
- `components/home/StatsSection.tsx`
- `components/home/CTABanner.tsx`

### Campaign (User)
- `components/campaign/CampaignGrid.tsx`
- `components/campaign/detail/CampaignHeader.tsx`
- `components/campaign/detail/CampaignImageSlider.tsx`
- `components/campaign/detail/CampaignMediaSection.tsx`
- `components/campaign/detail/CampaignSidebar.tsx`
- `components/campaign/detail/CampaignStory.tsx`
- `components/campaign/detail/CampaignComments.tsx`
- `components/campaign/detail/CampaignUpdates.tsx`

### Campaign Create Flow
- `components/campaign/create/CreateCampaignHeader.tsx`
- `components/campaign/create/BasicInfoSection.tsx`
- `components/campaign/create/StoryEditorSection.tsx`
- `components/campaign/create/MediaUploadSection.tsx`
- `components/campaign/create/ProofDocumentsSection.tsx`
- `components/campaign/create/CreateCampaignActions.tsx`
- `components/campaign/create/SubmitConfirmDialog.tsx`
- `components/campaign/create/CreateCampaignFeedback.tsx`
- `components/campaign/create/ValidationWarnings.tsx`
- `components/campaign/create/schema.ts`
- `components/campaign/create/types.ts`
- `components/campaign/create/constants.ts`
- `components/campaign/create/utils.ts`

### Campaign Listing and Donation
- `components/campaigns/CampaignCard.tsx`
- `components/campaigns/ReportCampaignModal.tsx`
- `components/donation/DonationHistory.tsx`

### Admin Components
- `components/admin/campaign-requests/*`
- `components/admin/campaigns/*`
- `components/admin/campaign-detail/*`
- `components/admin/reports/*`
- `components/admin/transactions/*`
- `components/admin/withdraw-requests/*`

### Shared UI and Skeletons
- `components/ui/*` (buttons, dialogs, selects, animation utilities, tabs, tables)
- `components/skeletons/GlobalPageSkeleton.tsx`

## State and Data Layer (lib/store)

### Store
- `lib/store/store.ts` - store config and middleware registration
- `lib/store/hooks.ts` - typed Redux hooks

### Slices and APIs
- `lib/store/features/auth/authSlice.ts`
- `lib/store/features/auth/authApi.ts`
- `lib/store/features/home/homeApi.ts`
- `lib/store/features/campaign/campaignApi.ts`
- `lib/store/features/donation/donationApi.ts`
- `lib/store/features/report/reportApi.ts`
- `lib/store/features/user/userApi.ts`
- `lib/store/features/admin/adminApi.ts`

## Shared Types (dtos)
- `dtos/common.ts`
- `dtos/enums.ts`
- `dtos/auth.ts`
- `dtos/campaign.ts`
- `dtos/donation.ts`
- `dtos/user.ts`
- `dtos/withdraw.ts`
- `dtos/admin.ts`
- `dtos/index.ts`

## Shared Hooks and Utilities
- `hooks/useAuth.ts`
- `hooks/useDebounce.ts`
- `hooks/useVietQRBanks.ts`
- `lib/utils.ts`
- `lib/api-error.ts`

## Static Assets
- `public/assets/404 Error Page.webp`
- `public/assets/login.png`
- `public/assets/register.png`

## Maintenance Notes
- Update this file whenever new routes, Redux features, or major component groups are added.
- Keep this document as a navigation map, not implementation-level documentation.
