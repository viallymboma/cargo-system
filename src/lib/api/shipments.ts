import apiClient, { handleApiError } from "./client";
import type {
  Shipment,
  CreateShipmentData,
  UpdateShipmentData,
  ShipmentListParams,
  PaginatedResponse,
} from "@/types/shipment.types";
import type { TrackingSummary, CreateTrackingEventData } from "@/types/tracking.types";

export const shipmentsApi = {
  /**
   * Get paginated list of shipments
   */
  getShipments: async (
    params?: ShipmentListParams
  ): Promise<PaginatedResponse<Shipment>> => {
    try {
      const response = await apiClient.get<PaginatedResponse<Shipment>>(
        "/shipments",
        { params }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get single shipment by ID
   */
  getShipment: async (id: string): Promise<Shipment> => {
    try {
      const response = await apiClient.get<Shipment>(`/shipments/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get shipment by tracking number
   */
  getShipmentByTrackingNumber: async (
    trackingNumber: string
  ): Promise<Shipment> => {
    try {
      const response = await apiClient.get<Shipment>(
        `/shipments/track/${trackingNumber}`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create new shipment
   */
  createShipment: async (data: CreateShipmentData): Promise<Shipment> => {
    try {
      const response = await apiClient.post<Shipment>("/shipments", data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update shipment
   */
  updateShipment: async (
    id: string,
    data: UpdateShipmentData
  ): Promise<Shipment> => {
    try {
      const response = await apiClient.patch<Shipment>(
        `/shipments/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete shipment
   */
  deleteShipment: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/shipments/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get tracking information for a shipment
   */
  getTracking: async (trackingNumber: string): Promise<TrackingSummary> => {
    try {
      const response = await apiClient.get<TrackingSummary>(
        `/tracking/${trackingNumber}`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Add tracking event to shipment
   */
  addTrackingEvent: async (
    data: CreateTrackingEventData
  ): Promise<TrackingSummary> => {
    try {
      const response = await apiClient.post<TrackingSummary>(
        `/tracking/events`,
        data
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Calculate shipping cost
   */
  calculateShippingCost: async (data: {
    type: string;
    weight: number;
    dimensions?: { length: number; width: number; height: number };
    declaredValue: number;
    insuranceRequired?: boolean;
  }): Promise<{
    shippingCost: number;
    insuranceCost: number;
    estimatedDays: number;
  }> => {
    try {
      const response = await apiClient.post<{
        shippingCost: number;
        insuranceCost: number;
        estimatedDays: number;
      }>("/shipments/calculate", data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get shipment statistics
   */
  getStatistics: async (): Promise<{
    total: number;
    pending: number;
    inTransit: number;
    delivered: number;
    revenue: number;
  }> => {
    try {
      const response = await apiClient.get<{
        total: number;
        pending: number;
        inTransit: number;
        delivered: number;
        revenue: number;
      }>("/shipments/statistics");
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
