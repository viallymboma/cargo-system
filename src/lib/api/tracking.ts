import apiClient, { handleApiError } from "./client";
import type { TrackingSummary, TrackingEvent, CreateTrackingEventData } from "@/types/tracking.types";
import type { ShipmentStatus } from "@/types/shipment.types";
import {
  toFrontendTrackingEvent,
  toFrontendTrackingSummary,
  toBackendCreateTrackingEventDto,
  toFrontendStatus,
  type BackendTrackingEvent,
  type BackendTrackingResponse,
  type BackendShipment,
} from "./adapters";

export const trackingApi = {
  /**
   * Get tracking timeline for a shipment
   * Backend: GET /tracking/shipment/:shipmentId
   * Note: This endpoint is public (no auth required)
   */
  getTrackingByShipmentId: async (shipmentId: string): Promise<TrackingSummary> => {
    try {
      const response = await apiClient.get<BackendTrackingResponse>(`/tracking/shipment/${shipmentId}`);
      return toFrontendTrackingSummary(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get tracking by tracking number
   * First fetches shipment, then tracking data
   */
  getTrackingByNumber: async (trackingNumber: string): Promise<TrackingSummary> => {
    try {
      // First get the shipment to get its ID
      const shipmentResponse = await apiClient.get<BackendShipment>(`/shipments/track/${trackingNumber}`);
      const shipment = shipmentResponse.data;

      // Then get tracking using shipment ID
      const trackingResponse = await apiClient.get<BackendTrackingResponse>(`/tracking/shipment/${shipment.id}`);

      return toFrontendTrackingSummary(trackingResponse.data, shipment);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create tracking event
   * Backend: POST /tracking/events
   */
  createTrackingEvent: async (data: CreateTrackingEventData): Promise<TrackingEvent> => {
    try {
      const backendData = toBackendCreateTrackingEventDto(data);
      const response = await apiClient.post<BackendTrackingEvent>("/tracking/events", backendData);
      return toFrontendTrackingEvent(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get recent tracking events
   * Backend: GET /tracking/events/recent
   */
  getRecentEvents: async (limit?: number): Promise<TrackingEvent[]> => {
    try {
      const params: Record<string, unknown> = {};
      if (limit) params.limit = limit;

      const response = await apiClient.get<BackendTrackingEvent[]>("/tracking/events/recent", { params });
      return response.data.map(toFrontendTrackingEvent);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get events filtered by status
   * Backend: GET /tracking/events/status/:status
   */
  getEventsByStatus: async (status: ShipmentStatus): Promise<TrackingEvent[]> => {
    try {
      // Convert frontend status to backend format (uppercase)
      const backendStatus = status.toUpperCase().replace(/_/g, "_");

      const response = await apiClient.get<BackendTrackingEvent[]>(`/tracking/events/status/${backendStatus}`);
      return response.data.map(toFrontendTrackingEvent);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Add status update for a shipment (convenience method)
   * Creates a tracking event and updates shipment status
   */
  updateShipmentStatus: async (
    shipmentId: string,
    status: ShipmentStatus,
    location: { city: string; country: string },
    description?: string
  ): Promise<TrackingEvent> => {
    try {
      const eventData: CreateTrackingEventData = {
        shipmentId,
        type: "status_change",
        status,
        location,
        description: description || `Status updated to ${status.replace(/_/g, " ")}`,
      };

      return await trackingApi.createTrackingEvent(eventData);
    } catch (error) {
      return handleApiError(error);
    }
  },
};
