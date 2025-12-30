import { useMockDataStore } from "@/lib/stores/mock-data-store";
import { simulateDelay } from "@/lib/config";
import { ApiError } from "../client";
import type {
  Shipment,
  CreateShipmentData,
  UpdateShipmentData,
  ShipmentListParams,
  PaginatedResponse,
} from "@/types/shipment.types";
import type { TrackingSummary, CreateTrackingEventData } from "@/types/tracking.types";

/**
 * Mock Shipments API - Uses Zustand store for data persistence
 */
export const mockShipmentsApi = {
  getShipments: async (
    params?: ShipmentListParams
  ): Promise<PaginatedResponse<Shipment>> => {
    await simulateDelay();

    return useMockDataStore.getState().getShipments({
      page: params?.page,
      pageSize: params?.pageSize,
      status: params?.filters?.status as string | undefined,
      search: params?.filters?.search,
    });
  },

  getShipment: async (id: string): Promise<Shipment> => {
    await simulateDelay();

    const shipment = useMockDataStore.getState().getShipment(id);

    if (!shipment) {
      throw new ApiError("Shipment not found", 404, "NOT_FOUND");
    }

    return shipment;
  },

  getShipmentByTrackingNumber: async (trackingNumber: string): Promise<Shipment> => {
    await simulateDelay();

    const shipment = useMockDataStore.getState().getShipmentByTrackingNumber(trackingNumber);

    if (!shipment) {
      throw new ApiError("Shipment not found", 404, "NOT_FOUND");
    }

    return shipment;
  },

  createShipment: async (data: CreateShipmentData): Promise<Shipment> => {
    await simulateDelay(800);

    const currentUser = useMockDataStore.getState().currentUser;
    if (!currentUser) {
      throw new ApiError("Not authenticated", 401, "NOT_AUTHENTICATED");
    }

    return useMockDataStore.getState().createShipment(data);
  },

  updateShipment: async (id: string, data: UpdateShipmentData): Promise<Shipment> => {
    await simulateDelay();

    const shipment = useMockDataStore.getState().updateShipment(id, data);

    if (!shipment) {
      throw new ApiError("Shipment not found", 404, "NOT_FOUND");
    }

    return shipment;
  },

  deleteShipment: async (id: string): Promise<void> => {
    await simulateDelay();

    const success = useMockDataStore.getState().deleteShipment(id);

    if (!success) {
      throw new ApiError("Shipment not found", 404, "NOT_FOUND");
    }
  },

  getTracking: async (trackingNumber: string): Promise<TrackingSummary> => {
    await simulateDelay();

    const tracking = useMockDataStore.getState().getTracking(trackingNumber);

    if (!tracking) {
      throw new ApiError("Tracking not found", 404, "NOT_FOUND");
    }

    return tracking;
  },

  addTrackingEvent: async (data: CreateTrackingEventData): Promise<TrackingSummary> => {
    await simulateDelay();

    const tracking = useMockDataStore.getState().addTrackingEvent(data);

    if (!tracking) {
      throw new ApiError("Shipment not found", 404, "NOT_FOUND");
    }

    return tracking;
  },

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
    await simulateDelay(300);

    // Calculate volumetric weight if dimensions provided
    let chargeableWeight = data.weight;
    if (data.dimensions) {
      const volumetricWeight =
        (data.dimensions.length * data.dimensions.width * data.dimensions.height) / 5000;
      chargeableWeight = Math.max(data.weight, volumetricWeight);
    }

    // Different rates by type
    const rates: Record<string, { perKg: number; minCharge: number; days: number }> = {
      air: { perKg: 15000, minCharge: 50000, days: 7 },
      sea: { perKg: 5000, minCharge: 100000, days: 45 },
      express: { perKg: 25000, minCharge: 75000, days: 3 },
    };

    const rate = rates[data.type] || rates.air;
    const shippingCost = Math.max(chargeableWeight * rate.perKg, rate.minCharge);
    const insuranceCost = data.insuranceRequired ? Math.round(data.declaredValue * 0.01) : 0;

    return {
      shippingCost: Math.round(shippingCost),
      insuranceCost,
      estimatedDays: rate.days,
    };
  },

  getStatistics: async (): Promise<{
    total: number;
    pending: number;
    inTransit: number;
    delivered: number;
    revenue: number;
  }> => {
    await simulateDelay(300);

    return useMockDataStore.getState().getStatistics();
  },
};
