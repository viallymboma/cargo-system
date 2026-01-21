import apiClient, { handleApiError } from "./client";

// Types for health check
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: 'connected' | 'disconnected';
    cache: 'connected' | 'disconnected';
    queue: 'connected' | 'disconnected';
  };
  checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  responseTime: number;
  details?: Record<string, unknown>;
}

export const healthApi = {
  /**
   * Get system health status
   * Backend: GET /health
   */
  getHealthStatus: async (): Promise<HealthStatus> => {
    try {
      const response = await apiClient.get<HealthStatus>("/health");
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get detailed health checks
   * Backend: GET /health/checks
   */
  getHealthChecks: async (): Promise<HealthCheck[]> => {
    try {
      const response = await apiClient.get<HealthCheck[]>("/health/checks");
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Perform a specific health check
   * Backend: GET /health/check/:name
   */
  runHealthCheck: async (checkName: string): Promise<HealthCheck> => {
    try {
      const response = await apiClient.get<HealthCheck>(`/health/check/${checkName}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Ping the server
   * Backend: GET /health/ping
   */
  ping: async (): Promise<{ message: string; timestamp: string }> => {
    try {
      const response = await apiClient.get<{ message: string; timestamp: string }>("/health/ping");
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};