import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface GoogleLoginRequest {
  idToken: string; // The token received from Google OAuth on FE
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      fullName: string;
      avatarUrl?: string;
      role: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1', // Replace with exact backend URL later
    prepareHeaders: (headers, { getState }) => {
      // Access the Redux state to get the token
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Demo endpoint to connect Google Login to the backend
    loginWithGoogle: builder.mutation<LoginResponse, GoogleLoginRequest>({
      query: (credentials) => ({
        url: '/auth/google-login',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    // Example endpoint to get current profile using standard JWT
    getProfile: builder.query<LoginResponse['data']['user'], void>({
      query: () => '/auth/me', // Update profile to /auth/me to match BE endpoint
    }),
  }),
});

export const { useLoginWithGoogleMutation, useGetProfileQuery } = authApi;
