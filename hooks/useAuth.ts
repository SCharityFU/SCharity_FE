import { useAppSelector } from "@/lib/store/hooks";

/**
 * Custom hook to easily grab auth state (user, token, isAuthenticated) from Redux.
 * This simplifies accessing the current logged-in user and token across the app.
 */
export function useAuth() {
  const { user, token, isAuthenticated } = useAppSelector((state) => state.auth);

  return {
    user,
    token,
    isAuthenticated,
  };
}

/**
 * Custom hook just to quickly get the current access token.
 */
export function useAccessToken() {
  const { token } = useAppSelector((state) => state.auth);
  return token;
}

/**
 * Custom hook just to quickly get the current user profile.
 */
export function useCurrentUser() {
  const { user } = useAppSelector((state) => state.auth);
  return user;
}
