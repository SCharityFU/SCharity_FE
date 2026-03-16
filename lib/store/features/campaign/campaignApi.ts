import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiResponseDto, PaginatedResponseDto } from '@/dtos/common';
import type { RootState } from '@/lib/store/store';
import type {
    CampaignRequestResponseDto,
    SubmitCampaignRequestDto,
    CampaignDto,
    BankInfoDto,
    CreateCampaignUpdateRequestDto,
    CampaignUpdateResponseDto,
    CreatorCampaignAnalyticsResponseDto,
} from '@/dtos/campaign';
import type { DonationResponseDto } from '@/dtos/donation';
import type { CreatorDashboardQueryDto, CreatorDashboardResponseDto } from '@/dtos/creator';
import type { CreateWithdrawRequestDto, WithdrawRequestResponseDto } from '@/dtos/withdraw';
import type { BankAccountResponseDto } from '@/dtos/user';

interface SubmitCampaignRequestArg {
    data: SubmitCampaignRequestDto;
    thumbnail?: File;
    media?: File[];
    proofDocuments?: File[];
}

export const campaignApi = createApi({
    reducerPath: 'campaignApi',
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            // Don't set Content-Type — browser will set multipart boundary automatically
            return headers;
        },
    }),
    tagTypes: ['CampaignRequest', 'MyCampaign', 'BankAccount', 'Withdrawal', 'CampaignUpdate', 'CreatorDashboard', 'CampaignDonation'],
    endpoints: (builder) => ({
        getCreatorDashboard: builder.query<
            ApiResponseDto<CreatorDashboardResponseDto>,
            CreatorDashboardQueryDto
        >({
            query: (params: CreatorDashboardQueryDto = {}) => ({
                url: '/creator/dashboard',
                params,
            }),
            providesTags: ['CreatorDashboard'],
        }),

        submitCampaignRequest: builder.mutation<
            ApiResponseDto<CampaignRequestResponseDto>,
            SubmitCampaignRequestArg
        >({
            query: ({ data, thumbnail, media, proofDocuments }) => {
                const formData = new FormData();

                // Text fields — multipart sends as strings, BE validator uses z.number()
                // so we send goalAmount as a number-string that the zod coerce/parse can handle
                formData.append('title', data.title);
                formData.append('story', data.story);
                formData.append('goalAmount', String(data.goalAmount));
                formData.append('deadline', data.deadline);

                if (data.category) {
                    formData.append('category', data.category);
                }

                // bankInfo is an object — multer.any() does NOT parse bracket-notation
                // into nested objects. Send as JSON string; BE preprocesses before validation.
                formData.append('bankInfo', JSON.stringify(data.bankInfo));

                // Files — use exact field names that the BE controller expects:
                // - thumbnail (single file)
                // - media (multiple files)
                // - proofDocuments (multiple files)
                if (thumbnail) {
                    formData.append('thumbnail', thumbnail);
                }

                if (media && media.length > 0) {
                    media.forEach((file) => {
                        formData.append('media', file);
                    });
                }

                if (proofDocuments && proofDocuments.length > 0) {
                    proofDocuments.forEach((file) => {
                        formData.append('proofDocuments', file);
                    });
                }

                return {
                    url: '/campaigns/requests',
                    method: 'POST',
                    body: formData,
                    formData: true,
                };
            },
            invalidatesTags: ['CampaignRequest'],
        }),

        // GET /campaigns/requests/mine — paginated list of own campaign requests
        getMyRequests: builder.query<
            PaginatedResponseDto<CampaignRequestResponseDto>,
            { page?: number; limit?: number; status?: string }
        >({
            query: ({ page = 1, limit = 10, status } = {}) => {
                const params: Record<string, string | number> = { page, limit };
                if (status) params.status = status;
                return {
                    url: '/campaigns/requests/mine',
                    params,
                };
            },
            providesTags: ['CampaignRequest'],
        }),

        // GET /campaigns/requests/mine/:requestId — single request detail (owner only)
        getMyRequestById: builder.query<
            ApiResponseDto<CampaignRequestResponseDto>,
            string
        >({
            query: (requestId) => `/campaigns/requests/mine/${requestId}`,
            providesTags: ['CampaignRequest'],
        }),

        // GET /campaigns/mine — paginated list of own campaigns
        getMyCampaigns: builder.query<
            PaginatedResponseDto<CampaignDto>,
            { page?: number; limit?: number }
        >({
            query: ({ page = 1, limit = 10 } = {}) => ({
                url: '/campaigns/mine',
                params: { page, limit },
            }),
            providesTags: ['MyCampaign'],
        }),

        // PUT /campaigns/requests/:requestId/bank-info — update bank info for a pending request
        updateRequestBankInfo: builder.mutation<
            ApiResponseDto<CampaignRequestResponseDto>,
            { requestId: string; bankInfo: BankInfoDto }
        >({
            query: ({ requestId, bankInfo }) => ({
                url: `/campaigns/requests/${requestId}/bank-info`,
                method: 'PUT',
                body: { bankInfo },
            }),
            invalidatesTags: ['CampaignRequest'],
        }),

        // PUT /campaigns/requests/:requestId — update campaign request details (pending only)
        updateCampaignRequest: builder.mutation<
            ApiResponseDto<CampaignRequestResponseDto>,
            {
                requestId: string;
                data: {
                    title?: string;
                    story?: string;
                    goalAmount?: number;
                    deadline?: string;
                    category?: string;
                };
                thumbnail?: File[];
                media?: File[];
                proofDocuments?: File[];
            }
        >({
            query: ({ requestId, data, thumbnail, media, proofDocuments }) => {
                const formData = new FormData();

                if (data.title) formData.append('title', data.title);
                if (data.story) formData.append('story', data.story);
                if (data.goalAmount !== undefined) formData.append('goalAmount', String(data.goalAmount));
                if (data.deadline) formData.append('deadline', data.deadline);
                if (data.category) formData.append('category', data.category);

                if (thumbnail) {
                    thumbnail.forEach((file) => {
                        formData.append('thumbnail', file);
                    });
                }

                if (media && media.length > 0) {
                    media.forEach((file) => {
                        formData.append('media', file);
                    });
                }

                if (proofDocuments && proofDocuments.length > 0) {
                    proofDocuments.forEach((file) => {
                        formData.append('proofDocuments', file);
                    });
                }

                return {
                    url: `/campaigns/requests/${requestId}`,
                    method: 'PUT',
                    body: formData,
                    formData: true,
                };
            },
            invalidatesTags: ['CampaignRequest'],
        }),

        // POST /campaigns/:id/close — close a campaign (owner only)
        closeCampaign: builder.mutation<ApiResponseDto<CampaignDto>, string>({
            query: (campaignId) => ({
                url: `/campaigns/${campaignId}/close`,
                method: 'POST',
            }),
            invalidatesTags: ['MyCampaign'],
        }),

        // GET /users/me/bank-accounts — list own bank accounts
        getMyBankAccounts: builder.query<BankAccountResponseDto[], void>({
            query: () => '/users/me/bank-accounts',
            transformResponse: (response: ApiResponseDto<BankAccountResponseDto[]>) =>
                response.data ?? [],
            providesTags: ['BankAccount'],
        }),

        // POST /withdrawals — create withdraw request
        createWithdrawRequest: builder.mutation<
            ApiResponseDto<WithdrawRequestResponseDto>,
            CreateWithdrawRequestDto
        >({
            query: (body) => ({
                url: '/withdrawals',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['MyCampaign', 'Withdrawal'],
        }),

        // GET /withdrawals/campaign/:campaignId — list withdrawals for a campaign
        getCampaignWithdrawals: builder.query<
            WithdrawRequestResponseDto[],
            string
        >({
            query: (campaignId) => `/withdrawals/campaign/${campaignId}`,
            transformResponse: (response: ApiResponseDto<WithdrawRequestResponseDto[]>) =>
                response.data ?? [],
            providesTags: ['Withdrawal'],
        }),

        // POST /users/me/bank-account-change-requests — request bank info change (admin approval via email)
        requestBankInfoChange: builder.mutation<
            ApiResponseDto<{ id: string; status: string }>,
            {
                bankAccountId: string;
                bankName: string;
                accountNumber: string;
                accountHolderName: string;
            }
        >({
            query: (body) => ({
                url: '/users/me/bank-account-change-requests',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['BankAccount'],
        }),

        // GET /users/me/bank-account-change-requests/:bankAccountId
        getBankChangeRequestStatus: builder.query<
            {
                isBankInfoApproved: boolean;
                latestRequest: {
                    id: string;
                    status: string;
                    newBankName: string;
                    newAccountNumber: string;
                    newAccountHolderName: string;
                    rejectReason: string | null;
                    createdAt: string;
                    processedAt: string | null;
                } | null;
            },
            string
        >({
            query: (bankAccountId) => `/users/me/bank-account-change-requests/${bankAccountId}`,
            transformResponse: (response: ApiResponseDto<{
                isBankInfoApproved: boolean;
                latestRequest: {
                    id: string;
                    status: string;
                    newBankName: string;
                    newAccountNumber: string;
                    newAccountHolderName: string;
                    rejectReason: string | null;
                    createdAt: string;
                    processedAt: string | null;
                } | null;
            }>) => response.data!,
            providesTags: ['BankAccount'], // re-fetch when bank account changes
        }),
        // GET /campaigns/:id/updates — get campaign updates with optional status filter
        getCampaignUpdates: builder.query<
            PaginatedResponseDto<CampaignUpdateResponseDto>,
            { campaignId: string; page?: number; limit?: number; status?: string }
        >({
            query: ({ campaignId = '', page = 1, limit = 10, status }) => {
                const params: Record<string, string | number> = { page, limit };
                if (status && ['all', 'draft', 'published'].includes(status)) {
                    params.status = status;
                }
                return {
                    url: `/campaigns/${campaignId}/updates`,
                    params,
                };
            },
            providesTags: ['CampaignUpdate'],
        }),

        // POST /campaigns/:id/updates — create a new campaign update
        createCampaignUpdate: builder.mutation<
            ApiResponseDto<CampaignUpdateResponseDto>,
            { campaignId: string; data: CreateCampaignUpdateRequestDto }
        >({
            query: ({ campaignId, data }) => ({
                url: `/campaigns/${campaignId}/updates`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['CampaignUpdate'],
        }),

        // PUT /campaigns/:id/updates/:updateId — update a campaign update
        updateCampaignUpdate: builder.mutation<
            ApiResponseDto<CampaignUpdateResponseDto>,
            { campaignId: string; updateId: string; data: CreateCampaignUpdateRequestDto }
        >({
            query: ({ campaignId, updateId, data }) => ({
                url: `/campaigns/${campaignId}/updates/${updateId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['CampaignUpdate'],
        }),

        // DELETE /campaigns/:id/updates/:updateId — delete a campaign update
        deleteCampaignUpdate: builder.mutation<
            ApiResponseDto<void>,
            { campaignId: string; updateId: string }
        >({
            query: ({ campaignId, updateId }) => ({
                url: `/campaigns/${campaignId}/updates/${updateId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['CampaignUpdate'],
        }),

        // PUT /campaigns/:id — update campaign details
        updateCampaign: builder.mutation<
            ApiResponseDto<CampaignDto>,
            { campaignId: string; data: { title?: string; story?: string; goalAmount?: number; deadline?: string; category?: string }; thumbnail?: File }
        >({
            query: ({ campaignId, data, thumbnail }) => {
                if (thumbnail) {
                    const formData = new FormData();
                    if (data.title) formData.append('title', data.title);
                    if (data.story) formData.append('story', data.story);
                    if (data.goalAmount !== undefined) formData.append('goalAmount', String(data.goalAmount));
                    if (data.deadline) formData.append('deadline', data.deadline);
                    if (data.category) formData.append('category', data.category);
                    formData.append('thumbnail', thumbnail);

                    return {
                        url: `/campaigns/${campaignId}`,
                        method: 'PUT',
                        body: formData,
                        formData: true,
                    };
                }

                return {
                    url: `/campaigns/${campaignId}`,
                    method: 'PUT',
                    body: data,
                };
            },
            invalidatesTags: ['MyCampaign'],
        }),

        // GET /campaigns/:id/creator-analytics
        getCreatorCampaignAnalytics: builder.query<
            ApiResponseDto<CreatorCampaignAnalyticsResponseDto>,
            { campaignId: string; days?: number }
        >({
            query: ({ campaignId, days = 30 }) => ({
                url: `/campaigns/${campaignId}/creator-analytics`,
                params: { days },
            }),
            providesTags: ['MyCampaign'],
        }),

        // GET /campaigns/:id/donations
        getCampaignDonations: builder.query<
            PaginatedResponseDto<DonationResponseDto>,
            { campaignId: string; page?: number; limit?: number; search?: string }
        >({
            query: ({ campaignId, page = 1, limit = 10, search }) => {
                const params: Record<string, string | number> = { page, limit };
                if (search) params.search = search;
                return {
                    url: `/campaigns/${campaignId}/donations`,
                    params,
                };
            },
            providesTags: ['CampaignDonation'],
        }),
    }),
});

export const {
    useGetCreatorDashboardQuery,
    useLazyGetCreatorDashboardQuery,
    useSubmitCampaignRequestMutation,
    useGetMyRequestsQuery,
    useGetMyRequestByIdQuery,
    useGetMyCampaignsQuery,
    useUpdateRequestBankInfoMutation,
    useUpdateCampaignRequestMutation,
    useCloseCampaignMutation,
    useGetMyBankAccountsQuery,
    useCreateWithdrawRequestMutation,
    useGetCampaignWithdrawalsQuery,
    useRequestBankInfoChangeMutation,
    useGetBankChangeRequestStatusQuery,
    useGetCampaignUpdatesQuery,
    useCreateCampaignUpdateMutation,
    useUpdateCampaignUpdateMutation,
    useDeleteCampaignUpdateMutation,
    useUpdateCampaignMutation,
    useGetCreatorCampaignAnalyticsQuery,
    useGetCampaignDonationsQuery,
} = campaignApi;
