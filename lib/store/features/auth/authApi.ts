import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from './authSlice';

interface GoogleLoginRequest {
  idToken: string; // The token received from Google OAuth on FE
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

interface AuthResponse {
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
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              user: data.data.user,
              token: data.data.accessToken,
            })
          );
        } catch (error) {
          // Handle login error
        }
      },
    }),
    
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      // We DO NOT automatically dispatch setCredentials here because the user
      // MUST verify their email first before they can actually log in.
    }),

    loginWithGoogle: builder.mutation<AuthResponse, GoogleLoginRequest>({
      query: (credentials) => ({
        url: '/auth/google-login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              user: data.data.user,
              token: data.data.accessToken,
            })
          );
        } catch (error) {
          // Handle login error
        }
      },
    }),
    
    getProfile: builder.query<AuthResponse['data']['user'], void>({
      query: () => '/auth/me',
    }),
    
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch (error) {
          // Even if server fails, we clear local state
          dispatch(logout());
        }
      },
    }),
    verifyEmail: builder.mutation<{ success: boolean; message: string; data?: any }, { token: string }>({
      query: ({ token }) => ({
        url: `/auth/verify-email?token=${token}`,
        method: 'GET',
      }),
    }),

    forgotPassword: builder.mutation<{ success: boolean; message: string; data?: any }, { email: string }>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    resetPassword: builder.mutation<{ success: boolean; message: string; data?: any }, { token: string; password: string }>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),

    verifyKyc: builder.mutation<
      { success: boolean; message: string; fullName: string; idNumber: string; faceMatchScore: number },
      { frontImageBase64: string; backImageBase64: string; selfieImageBase64: string }
    >({
      query: (body) => ({
        url: '/users/me/kyc',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const authState = (getState() as any).auth;
          if (authState.user && data.success) {
            dispatch(
              setCredentials({
                user: {
                  ...authState.user,
                  isKycVerified: true,
                },
                token: authState.token,
              })
            );
          }
        } catch (error) {
          // Keep current state on error
        }
      },
    }),
  }),
});

export const { 
  useLoginMutation,
  useRegisterMutation,
  useLoginWithGoogleMutation, 
  useGetProfileQuery,
  useLogoutMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyKycMutation
} = authApi;

