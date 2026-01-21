import apiClient, { handleApiError } from "./client";
import type { User, Agency } from "@/types/auth.types";
import {
  toFrontendUser,
  toFrontendAgency,
  toBackendCreateUserDto,
  toBackendUpdateUserDto,
  type BackendUser,
  type BackendAgency,
  type BackendUserStats,
  type BackendAgencyStats,
} from "./adapters";

export const usersApi = {
  // ============================================================================
  // USER ENDPOINTS
  // ============================================================================

  /**
   * Get all users with optional filters
   * Backend: GET /users
   */
  getUsers: async (filters?: {
    role?: string;
    agencyId?: string;
    isActive?: boolean;
  }): Promise<User[]> => {
    try {
      const params: Record<string, unknown> = {};
      if (filters?.role) params.role = filters.role.toUpperCase();
      if (filters?.agencyId) params.agencyId = filters.agencyId;
      if (filters?.isActive !== undefined) params.isActive = filters.isActive;

      const response = await apiClient.get<BackendUser[]>("/users", { params });
      return response.data.map(toFrontendUser);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get user by ID
   * Backend: GET /users/:id
   */
  getUser: async (id: string): Promise<User> => {
    try {
      const response = await apiClient.get<BackendUser>(`/users/${id}`);
      return toFrontendUser(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get user statistics
   * Backend: GET /users/:id/stats
   */
  getUserStats: async (id: string): Promise<BackendUserStats> => {
    try {
      const response = await apiClient.get<BackendUserStats>(`/users/${id}/stats`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create new user
   * Backend: POST /users
   */
  createUser: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: string;
    agencyId?: string;
  }): Promise<User> => {
    try {
      const backendData = toBackendCreateUserDto(data);
      const response = await apiClient.post<BackendUser>("/users", backendData);
      return toFrontendUser(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update user
   * Backend: PATCH /users/:id
   */
  updateUser: async (
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      role?: string;
      agencyId?: string | null;
    }
  ): Promise<User> => {
    try {
      const backendData = toBackendUpdateUserDto(data);
      const response = await apiClient.patch<BackendUser>(`/users/${id}`, backendData);
      return toFrontendUser(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete user
   * Backend: DELETE /users/:id
   */
  deleteUser: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Activate user
   * Backend: PATCH /users/:id/activate
   */
  activateUser: async (id: string): Promise<User> => {
    try {
      const response = await apiClient.patch<BackendUser>(`/users/${id}/activate`);
      return toFrontendUser(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Deactivate user
   * Backend: PATCH /users/:id/deactivate
   */
  deactivateUser: async (id: string): Promise<User> => {
    try {
      const response = await apiClient.patch<BackendUser>(`/users/${id}/deactivate`);
      return toFrontendUser(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ============================================================================
  // AGENCY ENDPOINTS
  // ============================================================================

  /**
   * Get all agencies
   * Backend: GET /users/all/agencies
   */
  getAgencies: async (filters?: {
    isActive?: boolean;
  }): Promise<Agency[]> => {
    try {
      const params: Record<string, unknown> = {};
      if (filters?.isActive !== undefined) params.isActive = filters.isActive;

      const response = await apiClient.get<BackendAgency[]>("/users/all/agencies", { params });
      return response.data.map(toFrontendAgency);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get agency by ID
   * Backend: GET /users/agencies/:id
   */
  getAgency: async (id: string): Promise<Agency> => {
    try {
      const response = await apiClient.get<BackendAgency>(`/users/agencies/${id}`);
      return toFrontendAgency(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get agency statistics
   * Backend: GET /users/agencies/:id/stats
   */
  getAgencyStats: async (id: string): Promise<BackendAgencyStats> => {
    try {
      const response = await apiClient.get<BackendAgencyStats>(`/users/agencies/${id}/stats`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create new agency
   * Backend: POST /users/agencies
   */
  createAgency: async (data: {
    name: string;
    code: string;
    city: string;
    country: string;
    address: string;
    phone: string;
    email: string;
    description?: string;
  }): Promise<Agency> => {
    try {
      const response = await apiClient.post<BackendAgency>("/users/agencies", data);
      return toFrontendAgency(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update agency
   * Backend: PATCH /users/agencies/:id
   */
  updateAgency: async (
    id: string,
    data: Partial<{
      name: string;
      code: string;
      city: string;
      country: string;
      address: string;
      phone: string;
      email: string;
      description: string;
    }>
  ): Promise<Agency> => {
    try {
      const response = await apiClient.patch<BackendAgency>(`/users/agencies/${id}`, data);
      return toFrontendAgency(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete agency
   * Backend: DELETE /users/agencies/:id
   */
  deleteAgency: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/users/agencies/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
};
