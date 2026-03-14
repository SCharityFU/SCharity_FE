import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ApiResponseDto, PaginatedResponseDto } from "@/dtos/common";
import type {
  AdminCampaignAnalyticsDto,
  AdminCampaignDetailDto,
  AdminCampaignRequestItemDto,
  AdminCampaignListItemDto,
  AdminCampaignsQueryDto,
  AdminCampaignTransactionsQueryDto,
  AdminCampaignRequestsQueryDto,
  AdminTransactionsQueryDto,
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
    "AdminCampaignRequests",
    "AdminCampaignRequestDetail",
  ],
  endpoints: (builder) => ({
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
  }),
});

export const {
  useGetAdminCampaignRequestsQuery,
  useGetAdminCampaignRequestDetailQuery,
  useReviewAdminCampaignRequestMutation,
  useGetAdminCampaignsQuery,
  useGetAdminCampaignDetailQuery,
  useGetAdminCampaignAnalyticsQuery,
  useGetAdminTransactionsQuery,
  useGetAdminCampaignTransactionsQuery,
} = adminApi;
