import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import { AuthResponse, GoogleLoginRequest, RefreshTokenRequest } from '../types';

export const authService = {
  /**
   * Login with Google OAuth
   */
  googleLogin: (data: GoogleLoginRequest) =>
    apiClient.post<AuthResponse>(ENDPOINTS.AUTH.GOOGLE, data, { requiresAuth: false }),

  /**
   * Refresh access token
   */
  refreshToken: (data: RefreshTokenRequest) =>
    apiClient.post<AuthResponse>(ENDPOINTS.AUTH.REFRESH, data, { requiresAuth: false }),

  /**
   * Logout user
   */
  logout: () =>
    apiClient.post<void>(ENDPOINTS.AUTH.LOGOUT),
};
