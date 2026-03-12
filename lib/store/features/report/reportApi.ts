import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiResponseDto } from '@/dtos/common';
import type { ReportResponseDto } from '@/dtos/user';
import type { ReportReason } from '@/dtos/enums';

interface ReportCampaignArgs {
  campaignId: string;
  reason: ReportReason;
  description?: string;
  files?: File[];
}

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
    reportCampaign: builder.mutation<ApiResponseDto<ReportResponseDto>, ReportCampaignArgs>({
      query: ({ campaignId, reason, description, files }) => {
        const formData = new FormData();
        formData.append('reason', reason);
        if (description) formData.append('description', description);
        if (files) {
          files.forEach((file) => formData.append('evidence', file));
        }
        return {
          url: `/campaigns/${campaignId}/report`,
          method: 'POST',
          body: formData,
        };
      },
    }),
  }),
});

export const { useReportCampaignMutation } = reportApi;
