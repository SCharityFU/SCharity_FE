import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PaginatedResponseDto } from "@/dtos/common";
import type {
  AdminCampaignTransactionsQueryDto,
  AdminTransactionsQueryDto,
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
  tagTypes: ["AdminTransactions"],
  endpoints: (builder) => ({
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
        },
      }),
      providesTags: ["AdminTransactions"],
    }),
  }),
});

export const {
  useGetAdminTransactionsQuery,
  useGetAdminCampaignTransactionsQuery,
} = adminApi;
