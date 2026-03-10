import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ReportCampaignRequestDto } from '@/dtos/user';
import type { ApiResponseDto } from '@/dtos/common';
import type { ReportResponseDto } from '@/dtos/user';

export const reportApi = createApi({
  reducerPath: 'reportApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    reportCampaign: builder.mutation<ApiResponseDto<ReportResponseDto>, ReportCampaignRequestDto>({
      query: ({ campaignId, ...body }) => ({
        url: `/campaigns/${campaignId}/report`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useReportCampaignMutation } = reportApi;
