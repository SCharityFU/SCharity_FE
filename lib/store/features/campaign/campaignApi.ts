import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiResponseDto, PaginatedResponseDto } from '@/dtos/common';
import type {
    CampaignRequestResponseDto,
    SubmitCampaignRequestDto,
    CampaignDto,
    BankInfoDto,
} from '@/dtos/campaign';

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
            const token = (getState() as any).auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            // Don't set Content-Type — browser will set multipart boundary automatically
            return headers;
        },
    }),
    tagTypes: ['CampaignRequest', 'MyCampaign'],
    endpoints: (builder) => ({
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
            { page?: number; limit?: number }
        >({
            query: ({ page = 1, limit = 10 } = {}) => ({
                url: '/campaigns/requests/mine',
                params: { page, limit },
            }),
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
    }),
});

export const {
    useSubmitCampaignRequestMutation,
    useGetMyRequestsQuery,
    useGetMyRequestByIdQuery,
    useGetMyCampaignsQuery,
    useUpdateRequestBankInfoMutation,
} = campaignApi;
