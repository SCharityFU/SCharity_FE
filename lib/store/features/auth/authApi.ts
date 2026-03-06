import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface GoogleLoginRequest {
  idToken: string; // The token received from Google OAuth on FE
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
  accessToken: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api', // Replace with exact backend URL later
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
    getProfile: builder.query<LoginResponse['user'], void>({
      query: () => '/auth/profile',
    }),
  }),
});

export const { useLoginWithGoogleMutation, useGetProfileQuery } = authApi;
