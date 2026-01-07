import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import { AuthResponse, GoogleLoginRequest, LoginRequest, RegisterRequest, RefreshTokenRequest } from '../types';

export const authService = {
  /**
   * Login with email and password
   */
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, data, { requiresAuth: false }),

  /**
   * Register with email and password
   */
  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, data, { requiresAuth: false }),

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
