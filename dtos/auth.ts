// ── Auth DTOs ────────────────────────────────────────────────────────────────

import { UserRole, UserStatus } from './enums';

// ── Request DTOs ────────────────────────────────────────────────────────────

export interface RegisterRequestDto {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface GoogleLoginRequestDto {
  idToken: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  token: string;
  password: string;
}

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailQueryDto {
  token: string;
}

// ── Response DTOs ───────────────────────────────────────────────────────────

export interface UserPublicDto {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl: string | null;
  phoneNumber: string | null;
  googleId: string | null;
  isEmailVerified: boolean;
  isKycVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TokenPairDto {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseDto {
  user: UserPublicDto;
  accessToken: string;
  refreshToken: string;
}
