import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../store';
import {
  DonationResponseDto,
  DonationHistoryQueryDto,
  CreateDonationRequestDto,
} from '@/dtos/donation';
import { PaginatedResponseDto } from '@/dtos/common';

interface CreateDonationResponse {
  success: boolean;
  data: {
    donation: DonationResponseDto;
    checkoutUrl: string;
    orderCode: number;
  };
}

interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data: {
    donation: DonationResponseDto;
    alreadyProcessed: boolean;
  };
}

export const donationApi = createApi({
  reducerPath: 'donationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/donations`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Donation'],
  endpoints: (builder) => ({
    // POST /donations → create donation + get checkoutUrl
    createDonation: builder.mutation<CreateDonationResponse, CreateDonationRequestDto>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Donation'],
    }),

    // GET /donations/payment/callback?orderCode=xxx → verify payment
    verifyPayment: builder.mutation<VerifyPaymentResponse, number>({
      query: (orderCode) => ({
        url: `/payment/callback?orderCode=${orderCode}`,
      }),
      invalidatesTags: ['Donation'],
    }),

    // GET /donations/me/history
    getMyDonationHistory: builder.query<
      PaginatedResponseDto<DonationResponseDto>,
      DonationHistoryQueryDto
    >({
      query: (params) => ({
        url: '/me/history',
        params,
      }),
      providesTags: ['Donation'],
    }),
  }),
});

export const {
  useCreateDonationMutation,
  useVerifyPaymentMutation,
  useGetMyDonationHistoryQuery,
} = donationApi;
