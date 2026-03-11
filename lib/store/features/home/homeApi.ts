import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { PaginatedResponseDto, ApiResponseDto } from '@/dtos/common';
import type { CampaignDto, CampaignQueryRequestDto, PublicCampaignDetailResponseDto } from '@/dtos/campaign';

export const homeApi = createApi({
  reducerPath: 'homeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  }),
  endpoints: (builder) => ({
    getActiveUserCount: builder.query<number, void>({
      query: () => '/users/active-count', // Backend endpoint
      transformResponse: (response: ApiResponseDto<number>) => response.data ?? 50000,
    }),
    
    getCampaigns: builder.query<CampaignDto[], CampaignQueryRequestDto | void>({
      query: (params) => ({
        url: '/campaigns',
        params: params || { limit: 6, sortBy: 'raisedAmount', sortOrder: 'DESC' },
      }),
      transformResponse: (response: PaginatedResponseDto<CampaignDto>) => response.data || [],
    }),

    getCampaignDetail: builder.query<PublicCampaignDetailResponseDto, string>({
      query: (id) => `/campaigns/${id}`,
      transformResponse: (response: ApiResponseDto<PublicCampaignDetailResponseDto>) => response.data as PublicCampaignDetailResponseDto,
    }),
  }),
});

export const { useGetActiveUserCountQuery, useGetCampaignsQuery, useGetCampaignDetailQuery } = homeApi;
