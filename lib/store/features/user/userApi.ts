import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../store';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: string;
  isVerified: boolean;
  isKycVerified: boolean;
  createdAt: string;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/users`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['UserProfile'],
  endpoints: (builder) => ({
    getMe: builder.query<{ success: boolean; data: UserProfile }, void>({
      query: () => '/me',
      providesTags: ['UserProfile'],
    }),

    updateProfile: builder.mutation<
      { success: boolean; message: string; data: UserProfile },
      FormData
    >({
      query: (formData) => ({
        url: '/me',
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['UserProfile'],
    }),
  }),
});

export const { useGetMeQuery, useUpdateProfileMutation } = userApi;
