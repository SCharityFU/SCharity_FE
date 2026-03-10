import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiResponseDto } from '@/dtos/common';
import type { CampaignRequestResponseDto, SubmitCampaignRequestDto } from '@/dtos/campaign';

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
    tagTypes: ['CampaignRequest'],
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
    }),
});

export const { useSubmitCampaignRequestMutation } = campaignApi;
