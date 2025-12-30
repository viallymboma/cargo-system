import apiClient, { handleApiError, tokenManager } from "./client";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from "@/types/auth.types";

export const authApi = {
  /**
   * Login user with email and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/auth/login",
        credentials
      );

      const { accessToken, refreshToken, user } = response.data;
      tokenManager.setTokens(accessToken, refreshToken);

      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Register new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/auth/register",
        data
      );

      const { accessToken, refreshToken } = response.data;
      tokenManager.setTokens(accessToken, refreshToken);

      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Logout user
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
   */
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<User>("/auth/me");
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update current user profile
   */
  updateProfile: async (
    data: Partial<Pick<User, "firstName" | "lastName" | "phone">>
  ): Promise<User> => {
    try {
      const response = await apiClient.patch<User>("/auth/me", data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Change password
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
