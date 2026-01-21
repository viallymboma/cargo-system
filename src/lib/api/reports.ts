import apiClient, { handleApiError } from "./client";
import {
  type BackendDashboardResponse,
  type BackendRevenueReport,
} from "./adapters";

// Types for reports
export interface DashboardStats {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  revenue: number;
}

export interface ShipmentByStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface ShipmentByOrigin {
  origin: string;
  count: number;
}

export interface RevenueData {
  period: {
    startDate: string;
    endDate: string;
  };
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface AverageDeliveryTime {
  days: number;
}

export const reportsApi = {
  /**
   * Get dashboard statistics
   * Backend: GET /reports/dashboard
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await apiClient.get<BackendDashboardResponse>("/reports/dashboard");
      // Transform the response to match frontend format
      return {
        total: response.data.shipments.total,
        pending: response.data.shipments.pending,
        inTransit: response.data.shipments.inTransit,
        delivered: response.data.shipments.delivered,
        revenue: response.data.revenue.total,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get shipments grouped by status
   * Backend: GET /reports/shipments/by-status
   */
  getShipmentsByStatus: async (): Promise<ShipmentByStatus[]> => {
    try {
      const response = await apiClient.get<ShipmentByStatus[]>("/reports/shipments/by-status");
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get shipments grouped by origin
   * Backend: GET /reports/shipments/by-origin
   */
  getShipmentsByOrigin: async (): Promise<ShipmentByOrigin[]> => {
    try {
      const response = await apiClient.get<ShipmentByOrigin[]>("/reports/shipments/by-origin");
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get revenue report by period
   * Backend: GET /reports/revenue
   */
  getRevenue: async (
    startDate?: string,
    endDate?: string
  ): Promise<RevenueData[]> => {
    try {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get<BackendRevenueReport[]>("/reports/revenue", { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get average delivery time
   * Backend: GET /reports/delivery-time
   */
  getAverageDeliveryTime: async (): Promise<number> => {
    try {
      const response = await apiClient.get<{ averageDays: number }>("/reports/delivery-time");
      return response.data.averageDays;
    } catch (error) {
      return handleApiError(error);
    }
  },
};