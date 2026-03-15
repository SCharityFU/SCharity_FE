import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ApiResponseDto, PaginatedResponseDto } from "@/dtos/common";
import type {
  AdminCampaignAnalyticsDto,
  AdminCampaignDetailDto,
  AdminCampaignRequestItemDto,
  AdminProcessWithdrawResponseDto,
  AdminCampaignListItemDto,
  AdminCampaignsQueryDto,
  AdminCampaignTransactionsQueryDto,
  AdminReportResponseDto,
  AdminReportsQueryDto,
  AdminCampaignRequestsQueryDto,
  AdminTransactionsQueryDto,
  DashboardStatsResponseDto,
  AdminWithdrawRequestItemDto,
  AdminWithdrawRequestsQueryDto,
  ProcessWithdrawRequestDto,
  SuspendCampaignRequestDto,
  ReviewCampaignRequestDto,
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
  tagTypes: [
    "AdminTransactions",
    "AdminCampaigns",
    "AdminCampaignDetail",
    "AdminCampaignAnalytics",
    "AdminReports",
    "AdminCampaignRequests",
    "AdminCampaignRequestDetail",
    "AdminWithdrawRequests",
    "AdminWithdrawRequestDetail",
  ],
  endpoints: (builder) => ({
    getAdminWithdrawRequests: builder.query<
      PaginatedResponseDto<AdminWithdrawRequestItemDto>,
      AdminWithdrawRequestsQueryDto
    >({
      query: ({ page = 1, limit = 10, status } = {}) => ({
        url: "/admin/withdraw-requests",
        params: {
          page,
          limit,
          ...(status ? { status } : {}),
        },
      }),
      providesTags: ["AdminWithdrawRequests"],
    }),

    getAdminWithdrawRequestDetail: builder.query<
      ApiResponseDto<AdminWithdrawRequestItemDto>,
      string
    >({
      query: (requestId) => `/admin/withdraw-requests/${requestId}`,
      providesTags: (_result, _error, requestId) => [
        "AdminWithdrawRequestDetail",
        { type: "AdminWithdrawRequestDetail" as const, id: requestId },
      ],
    }),

    processAdminWithdrawRequest: builder.mutation<
      ApiResponseDto<AdminProcessWithdrawResponseDto>,
      { requestId: string; payload: ProcessWithdrawRequestDto }
    >({
      query: ({ requestId, payload }) => ({
        url: `/admin/withdraw-requests/${requestId}/process`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (_result, _error, { requestId }) => [
        "AdminWithdrawRequests",
        { type: "AdminWithdrawRequestDetail" as const, id: requestId },
      ],
    }),

    getAdminCampaignRequests: builder.query<
      PaginatedResponseDto<AdminCampaignRequestItemDto>,
      AdminCampaignRequestsQueryDto
    >({
      query: ({ page = 1, limit = 10, status } = {}) => ({
        url: "/admin/campaign-requests",
        params: {
          page,
          limit,
          ...(status ? { status } : {}),
        },
      }),
      providesTags: ["AdminCampaignRequests"],
    }),

    getAdminCampaignRequestDetail: builder.query<
      ApiResponseDto<AdminCampaignRequestItemDto>,
      string
    >({
      query: (requestId) => `/admin/campaign-requests/${requestId}`,
      providesTags: (_result, _error, requestId) => [
        "AdminCampaignRequestDetail",
        { type: "AdminCampaignRequestDetail" as const, id: requestId },
      ],
    }),

    reviewAdminCampaignRequest: builder.mutation<
      ApiResponseDto<AdminCampaignRequestItemDto>,
      { requestId: string; payload: ReviewCampaignRequestDto }
    >({
      query: ({ requestId, payload }) => ({
        url: `/admin/campaign-requests/${requestId}/review`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (_result, _error, { requestId }) => [
        "AdminCampaignRequests",
        "AdminCampaignDetail",
        "AdminCampaigns",
        "AdminCampaignAnalytics",
        "AdminTransactions",
        { type: "AdminCampaignRequestDetail" as const, id: requestId },
      ],
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

    getDashboardStats: builder.query<DashboardStatsResponseDto, void>({
      query: () => "/admin/dashboard",
      transformResponse: (res: ApiResponseDto<DashboardStatsResponseDto>) => res.data!,
    }),

    getDonationChartData: builder.query<
      { date: string; amount: number; count: number }[],
      { interval?: "day" | "week" | "month"; days?: number }
    >({
      query: ({ interval = "day", days = 30 } = {}) => ({
        url: "/admin/dashboard/chart",
        params: { interval, days },
      }),
      transformResponse: (res: ApiResponseDto<{ date: string; amount: number; count: number }[]>) => res.data ?? [],
    }),


    getAdminCampaignDetail: builder.query<ApiResponseDto<AdminCampaignDetailDto>, string>({
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

    resolveReport: builder.mutation<ApiResponseDto<AdminReportResponseDto>, string>({
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

    unsuspendCampaign: builder.mutation<ApiResponseDto, string>({
      query: (campaignId) => ({
        url: `/admin/campaigns/${campaignId}/unsuspend`,
        method: "PUT",
      }),
      invalidatesTags: ["AdminCampaigns", "AdminCampaignDetail"],
    }),
  }),
});

export const {
  useGetAdminWithdrawRequestsQuery,
  useGetAdminWithdrawRequestDetailQuery,
  useProcessAdminWithdrawRequestMutation,
  useGetAdminCampaignRequestsQuery,
  useGetAdminCampaignRequestDetailQuery,
  useReviewAdminCampaignRequestMutation,
  useGetAdminCampaignsQuery,
  useGetAdminCampaignDetailQuery,
  useGetAdminCampaignAnalyticsQuery,
  useGetAdminTransactionsQuery,
  useGetAdminCampaignTransactionsQuery,
  useGetDashboardStatsQuery,
  useGetDonationChartDataQuery,
  useGetAdminReportsQuery,
  useResolveReportMutation,
  useSuspendCampaignMutation,
  useUnsuspendCampaignMutation,
} = adminApi;
