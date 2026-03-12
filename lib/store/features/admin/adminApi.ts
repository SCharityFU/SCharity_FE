import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { DashboardStatsResponseDto, DonationChartQueryDto } from '@/dtos/admin';
import type { DonationChartDataPointDto } from '@/dtos/campaign';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
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
    getDashboardStats: builder.query<DashboardStatsResponseDto, void>({
      query: () => '/admin/dashboard',
      transformResponse: (response: ApiResponse<DashboardStatsResponseDto>) => response.data,
    }),

    getDonationChartData: builder.query<DonationChartDataPointDto[], DonationChartQueryDto>({
      query: ({ interval = 'day', days = 30 }) => ({
        url: '/admin/dashboard/chart',
        params: { interval, days },
      }),
      transformResponse: (response: ApiResponse<DonationChartDataPointDto[]>) => response.data,
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetDonationChartDataQuery,
} = adminApi;

