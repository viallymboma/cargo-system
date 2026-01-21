import apiClient, { handleApiError, tokenManager } from "./client";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from "@/types/auth.types";
import {
  toFrontendUser,
  toBackendRegisterDto,
  toBackendUserUpdateDto,
  type BackendAuthResponse,
  type BackendUser,
} from "./adapters";

export const authApi = {
  /**
   * Login user with email and password
   * Backend: POST /auth/login
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log("Logging in with credentials:", credentials);
      const response = await apiClient.post<BackendAuthResponse>(
        "/auth/login",
        credentials
      );
      console.log("Response data:", response.data);

      const { accessToken, refreshToken, user: backendUser } = response.data;
      tokenManager.setTokens(accessToken, refreshToken);

      // Transform backend user to frontend format
      const user = toFrontendUser(backendUser);

      return { user, accessToken, refreshToken };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Register new user
   * Backend: POST /auth/register
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      // Transform frontend registration data to backend format
      const backendData = toBackendRegisterDto(data);

      const response = await apiClient.post<BackendAuthResponse>(
        "/auth/register",
        backendData
      );

      const { accessToken, refreshToken, user: backendUser } = response.data;
      tokenManager.setTokens(accessToken, refreshToken);

      // Transform backend user to frontend format
      const user = toFrontendUser(backendUser);

      return { user, accessToken, refreshToken };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Logout user
   * Backend: POST /auth/logout
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore errors on logout
    } finally {
      tokenManager.clearTokens();
    }
  },

  /**
   * Get current user profile
   * Backend: GET /auth/me
   */
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<BackendUser>("/auth/me");
      return toFrontendUser(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update current user profile
   * Backend: PATCH /users/:id (need to get user ID first)
   * Note: Backend doesn't have PATCH /auth/me, so we use the users endpoint
   */
  updateProfile: async (
    data: Partial<Pick<User, "firstName" | "lastName" | "phone">>
  ): Promise<User> => {
    try {
      // First get current user to get the ID
      const currentUser = await apiClient.get<BackendUser>("/auth/me");
      const userId = currentUser.data.id;

      // Transform to backend format
      const backendData = toBackendUserUpdateDto(data);

      // Update via users endpoint
      const response = await apiClient.patch<BackendUser>(
        `/users/${userId}`,
        backendData
      );
      return toFrontendUser(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Change password
   * Backend: POST /auth/change-password
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    try {
      await apiClient.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Request password reset
   * Backend: POST /auth/forgot-password
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    try {
      await apiClient.post("/auth/forgot-password", { email });
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Reset password with token
   * Backend: POST /auth/reset-password
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.post("/auth/reset-password", { token, newPassword });
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Verify email with token
   * Backend: POST /auth/verify-email
   */
  verifyEmail: async (token: string): Promise<void> => {
    try {
      await apiClient.post("/auth/verify-email", { token });
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Resend verification email
   * Backend: POST /auth/resend-verification
   */
  resendVerificationEmail: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/resend-verification");
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Check if token is valid (for middleware)
   */
  isAuthenticated: (): boolean => {
    return !!tokenManager.getAccessToken();
  },
};
