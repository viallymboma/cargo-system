import apiClient, { handleApiError } from "./client";
import type {
  Shipment,
  CreateShipmentData,
  UpdateShipmentData,
  ShipmentListParams,
  PaginatedResponse,
} from "@/types/shipment.types";
import type { TrackingSummary, CreateTrackingEventData } from "@/types/tracking.types";
import {
  toFrontendShipment,
  toBackendCreateShipmentDto,
  toBackendUpdateShipmentDto,
  toFrontendTrackingSummary,
  toBackendCreateTrackingEventDto,
  toBackendCalculateCostDto,
  toFrontendCostResponse,
  toFrontendStatistics,
  toBackendStatus,
  type BackendShipment,
  type BackendTrackingResponse,
  type BackendCostResponse,
  type BackendDashboardResponse,
} from "./adapters";

export const shipmentsApi = {
  /**
   * Get paginated list of shipments
   * Backend: GET /shipments
   */
  getShipments: async (
    params?: ShipmentListParams
  ): Promise<PaginatedResponse<Shipment>> => {
    try {
      // Transform filters to backend format
      const backendParams: Record<string, unknown> = {};

      if (params?.filters?.status) {
        const status = params.filters.status;
        if (Array.isArray(status)) {
          backendParams.status = status.map(s => toBackendStatus(s)).join(",");
        } else {
          backendParams.status = toBackendStatus(status);
        }
      }
      if (params?.filters?.type) {
        // Backend doesn't have shipment type filter
      }
      if (params?.filters?.agencyId) {
        backendParams.agencyId = params.filters.agencyId;
      }
      if (params?.filters?.search) {
        // Backend might support search differently
        backendParams.search = params.filters.search;
      }

      // Backend returns array directly, not paginated
      const response = await apiClient.get<BackendShipment[]>("/shipments", {
        params: backendParams,
      });

      // Transform backend shipments to frontend format
      const shipments = response.data.map(toFrontendShipment);

      // Create pagination wrapper (backend doesn't paginate)
      return {
        data: shipments,
        total: shipments.length,
        page: params?.page || 1,
        pageSize: params?.pageSize || shipments.length,
        totalPages: 1,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get single shipment by ID
   * Backend: GET /shipments/:id
   */
  getShipment: async (id: string): Promise<Shipment> => {
    try {
      const response = await apiClient.get<BackendShipment>(`/shipments/${id}`);
      return toFrontendShipment(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get shipment by tracking number
   * Backend: GET /shipments/track/:trackingNumber
   */
  getShipmentByTrackingNumber: async (
    trackingNumber: string
  ): Promise<Shipment> => {
    try {
      const response = await apiClient.get<BackendShipment>(
        `/shipments/track/${trackingNumber}`
      );
      return toFrontendShipment(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create new shipment
   * Backend: POST /shipments
   */
  createShipment: async (data: CreateShipmentData): Promise<Shipment> => {
    try {
      const backendData = toBackendCreateShipmentDto(data);
      const response = await apiClient.post<BackendShipment>("/shipments", backendData);
      return toFrontendShipment(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update shipment
   * Backend: PATCH /shipments/:id
   */
  updateShipment: async (
    id: string,
    data: UpdateShipmentData
  ): Promise<Shipment> => {
    try {
      const backendData = toBackendUpdateShipmentDto(data);
      const response = await apiClient.patch<BackendShipment>(
        `/shipments/${id}`,
        backendData
      );
      return toFrontendShipment(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete shipment
   * Backend: DELETE /shipments/:id
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
   * Backend: GET /tracking/shipment/:shipmentId
   * Note: Backend uses shipmentId, not tracking number for this endpoint
   */
  getTracking: async (trackingNumber: string): Promise<TrackingSummary> => {
    try {
      // First get the shipment to get its ID
      const shipmentResponse = await apiClient.get<BackendShipment>(
        `/shipments/track/${trackingNumber}`
      );
      const shipment = shipmentResponse.data;

      // Then get tracking using shipment ID
      const response = await apiClient.get<BackendTrackingResponse>(
        `/tracking/shipment/${shipment.id}`
      );

      return toFrontendTrackingSummary(response.data, shipment);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Add tracking event to shipment
   * Backend: POST /tracking/events
   */
  addTrackingEvent: async (
    data: CreateTrackingEventData
  ): Promise<TrackingSummary> => {
    try {
      const backendData = toBackendCreateTrackingEventDto(data);

      // Create the event
      await apiClient.post("/tracking/events", backendData);

      // Get updated tracking summary
      const response = await apiClient.get<BackendTrackingResponse>(
        `/tracking/shipment/${data.shipmentId}`
      );

      return toFrontendTrackingSummary(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Calculate shipping cost
   * Backend: POST /billing/calculate
   */
  calculateShippingCost: async (data: {
    type: string;
    weight: number;
    dimensions?: { length: number; width: number; height: number };
    declaredValue: number;
    insuranceRequired?: boolean;
    origin?: string;
    destination?: string;
  }): Promise<{
    shippingCost: number;
    insuranceCost: number;
    estimatedDays: number;
  }> => {
    try {
      const backendData = toBackendCalculateCostDto(data);
      const response = await apiClient.post<BackendCostResponse>(
        "/billing/calculate",
        backendData
      );
      return toFrontendCostResponse(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get shipment statistics
   * Backend: GET /reports/dashboard
   */
  getStatistics: async (): Promise<{
    total: number;
    pending: number;
    inTransit: number;
    delivered: number;
    revenue: number;
  }> => {
    try {
      const response = await apiClient.get<BackendDashboardResponse>(
        "/reports/dashboard"
      );
      return toFrontendStatistics(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get shipment statistics (alternative endpoint)
   * Backend: GET /shipments/stats
   */
  getShipmentStats: async (): Promise<{
    total: number;
    pending: number;
    inTransit: number;
    delivered: number;
  }> => {
    try {
      const response = await apiClient.get<{ total: number; pending: number; inTransit: number; delivered: number }>(
        "/shipments/stats"
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
