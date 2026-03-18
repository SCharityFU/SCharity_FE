import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../store';
import { ApiResponseDto } from '@/dtos/common';

export interface CommentReactionResponse {
  id: string;
  commentId: string;
  userId: string;
  type: string;
  createdAt: string;
}

export const commentReactionApi = createApi({
  reducerPath: 'commentReactionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/commentreactions`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['CommentReaction'],
  endpoints: (builder) => ({
    // POST /commentreactions/react
    reactToComment: builder.mutation<ApiResponseDto<CommentReactionResponse>, { commentId: string; type: string }>({
      query: (body) => ({
        url: '/react',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { commentId }) => [{ type: 'CommentReaction', id: commentId }],
    }),

    // GET /commentreactions/:commentId/reactions
    getCommentReactions: builder.query<{ success: boolean; reactions: CommentReactionResponse[] }, string>({
      query: (commentId) => `/${commentId}/reactions`,
      providesTags: (result, error, commentId) => [{ type: 'CommentReaction', id: commentId }],
    }),
  }),
});

export const {
  useReactToCommentMutation,
  useGetCommentReactionsQuery,
} = commentReactionApi;
