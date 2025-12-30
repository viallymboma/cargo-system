import { useMockDataStore } from "@/lib/stores/mock-data-store";
import { simulateDelay } from "@/lib/config";
import { ApiError, tokenManager } from "../client";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from "@/types/auth.types";

/**
 * Mock Auth API - Uses Zustand store for data persistence
 */
export const mockAuthApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await simulateDelay();

    const result = useMockDataStore.getState().login(credentials.email, credentials.password);

    if (!result) {
      throw new ApiError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    // Store tokens in localStorage and cookie (same as real API)
    tokenManager.setTokens(result.accessToken, result.refreshToken);

    return result;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    await simulateDelay();

    const result = useMockDataStore.getState().register(data);

    if (!result) {
      throw new ApiError("Email already exists", 409, "EMAIL_EXISTS");
    }

    // Store tokens in localStorage and cookie (same as real API)
    tokenManager.setTokens(result.accessToken, result.refreshToken);

    return result;
  },

  logout: async (): Promise<void> => {
    await simulateDelay(200);
    useMockDataStore.getState().logout();
    // Clear tokens from localStorage and cookie
    tokenManager.clearTokens();
  },

  getCurrentUser: async (): Promise<User> => {
    await simulateDelay(300);

    const user = useMockDataStore.getState().getCurrentUser();

    if (!user) {
      throw new ApiError("Not authenticated", 401, "NOT_AUTHENTICATED");
    }

    return user;
  },

  updateProfile: async (
    data: Partial<Pick<User, "firstName" | "lastName" | "phone">>
  ): Promise<User> => {
    await simulateDelay();

    const user = useMockDataStore.getState().updateProfile(data);

    if (!user) {
      throw new ApiError("Not authenticated", 401, "NOT_AUTHENTICATED");
    }

    return user;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    await simulateDelay();

    const state = useMockDataStore.getState();
    const currentUser = state.currentUser;

    if (!currentUser) {
      throw new ApiError("Not authenticated", 401, "NOT_AUTHENTICATED");
    }

    const user = state.users.find((u) => u.id === currentUser.id);
    if (!user || user.password !== currentPassword) {
      throw new ApiError("Current password is incorrect", 400, "INVALID_PASSWORD");
    }

    // Update password in store
    useMockDataStore.setState({
      users: state.users.map((u) =>
        u.id === currentUser.id ? { ...u, password: newPassword } : u
      ),
    });
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    await simulateDelay();

    const user = useMockDataStore.getState().users.find((u) => u.email === email);
    if (!user) {
      // Don't reveal if email exists
      return;
    }

    console.log(`[MOCK] Password reset requested for ${email}`);
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await simulateDelay();
    console.log(`[MOCK] Password reset with token: ${token}`);
  },

  verifyEmail: async (token: string): Promise<void> => {
    await simulateDelay();
    console.log(`[MOCK] Email verified with token: ${token}`);
  },

  resendVerificationEmail: async (): Promise<void> => {
    await simulateDelay();
    console.log("[MOCK] Verification email resent");
  },

  isAuthenticated: (): boolean => {
    return !!useMockDataStore.getState().accessToken;
  },
};
