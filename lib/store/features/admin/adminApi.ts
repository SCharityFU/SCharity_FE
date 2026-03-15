import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ApiResponseDto, PaginatedResponseDto } from "@/dtos/common";
import type {
  AdminCampaignAnalyticsDto,
  AdminCampaignDetailDto,
  AdminCampaignListItemDto,
  AdminCampaignsQueryDto,
  AdminCampaignTransactionsQueryDto,
  AdminReportResponseDto,
  AdminReportsQueryDto,
  AdminTransactionsQueryDto,
  SuspendCampaignRequestDto,
  DashboardStatsResponseDto,
  DonationChartDataPointDto,
  DashboardChartQueryDto,
} from "@/dtos/admin";

export type AdminDonationStatus = "pending" | "success" | "failed" | "refunded";

export interface AdminDonationItem {
  id: string;
  donorDisplayName: string;
  createdAt: string;
  message: string | null;
  amount: number;
  bankName: string | null;
  bankAccount: string | null;
  status: AdminDonationStatus;
}

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as { auth?: { token?: string | null } }).auth?.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["AdminTransactions", "AdminCampaigns", "AdminCampaignDetail", "AdminCampaignAnalytics", "AdminReports", "AdminDashboard"],
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<
      ApiResponseDto<DashboardStatsResponseDto>,
      void
    >({
      query: () => "/admin/dashboard",
      providesTags: ["AdminDashboard"],
    }),

    getAdminDashboardChart: builder.query<
      ApiResponseDto<DonationChartDataPointDto[]>,
      DashboardChartQueryDto
    >({
      query: ({ interval = "day", days = 30 } = {}) => ({
        url: "/admin/dashboard/chart",
        params: { interval, days },
      }),
      providesTags: ["AdminDashboard"],
    }),

    getAdminCampaigns: builder.query<
      PaginatedResponseDto<AdminCampaignListItemDto>,
      AdminCampaignsQueryDto
    >({
      query: ({ page = 1, limit = 10, status, category, search } = {}) => ({
        url: "/admin/campaigns",
        params: {
          page,
          limit,
          ...(status ? { status } : {}),
          ...(category ? { category } : {}),
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ["AdminCampaigns"],
    }),

    getAdminCampaignDetail: builder.query<
      ApiResponseDto<AdminCampaignDetailDto>,
      string
    >({
      query: (campaignId) => `/admin/campaigns/${campaignId}`,
      providesTags: ["AdminCampaignDetail"],
    }),

    getAdminCampaignAnalytics: builder.query<
      ApiResponseDto<AdminCampaignAnalyticsDto>,
      { campaignId: string; days?: number }
    >({
      query: ({ campaignId, days = 30 }) => ({
        url: `/admin/campaigns/${campaignId}/analytics`,
        params: { days },
      }),
      providesTags: ["AdminCampaignAnalytics"],
    }),

    getAdminTransactions: builder.query<
      PaginatedResponseDto<AdminDonationItem>,
      AdminTransactionsQueryDto
    >({
      query: ({ page = 1, limit = 10, search = "", sortOrder = "DESC" } = {}) => ({
        url: "/admin/transactions",
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          sortOrder,
        },
      }),
      providesTags: ["AdminTransactions"],
    }),

    getAdminCampaignTransactions: builder.query<
      PaginatedResponseDto<AdminDonationItem>,
      { campaignId: string; query?: AdminCampaignTransactionsQueryDto }
    >({
      query: ({ campaignId, query }) => ({
        url: `/admin/campaigns/${campaignId}/transactions`,
        params: {
          page: query?.page ?? 1,
          limit: query?.limit ?? 10,
          ...(query?.search ? { search: query.search } : {}),
          sortBy: query?.sortBy ?? "createdAt",
          sortOrder: query?.sortOrder ?? "DESC",
          ...(query?.startDate ? { startDate: query.startDate } : {}),
          ...(query?.endDate ? { endDate: query.endDate } : {}),
        },
      }),
      providesTags: ["AdminTransactions"],
    }),

    // ── Reports ──────────────────────────────────────────────────────────

    getAdminReports: builder.query<
      PaginatedResponseDto<AdminReportResponseDto>,
      AdminReportsQueryDto
    >({
      query: ({ page = 1, limit = 10, status } = {}) => ({
        url: "/admin/reports",
        params: {
          page,
          limit,
          ...(status ? { status } : {}),
        },
      }),
      providesTags: ["AdminReports"],
    }),

    resolveReport: builder.mutation<
      ApiResponseDto<AdminReportResponseDto>,
      string
    >({
      query: (reportId) => ({
        url: `/admin/reports/${reportId}/resolve`,
        method: "PUT",
      }),
      invalidatesTags: ["AdminReports"],
    }),

    // ── Suspend / Unsuspend ──────────────────────────────────────────────

    suspendCampaign: builder.mutation<
      ApiResponseDto,
      { campaignId: string; body: SuspendCampaignRequestDto }
    >({
      query: ({ campaignId, body }) => ({
        url: `/admin/campaigns/${campaignId}/suspend`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminCampaigns", "AdminCampaignDetail"],
    }),

    unsuspendCampaign: builder.mutation<
      ApiResponseDto,
      string
    >({
      query: (campaignId) => ({
        url: `/admin/campaigns/${campaignId}/unsuspend`,
        method: "PUT",
      }),
      invalidatesTags: ["AdminCampaigns", "AdminCampaignDetail"],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetAdminDashboardChartQuery,
  useGetAdminCampaignsQuery,
  useGetAdminCampaignDetailQuery,
  useGetAdminCampaignAnalyticsQuery,
  useGetAdminTransactionsQuery,
  useGetAdminCampaignTransactionsQuery,
  useGetAdminReportsQuery,
  useResolveReportMutation,
  useSuspendCampaignMutation,
  useUnsuspendCampaignMutation,
} = adminApi;
