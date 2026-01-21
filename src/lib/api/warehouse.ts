import apiClient, { handleApiError } from "./client";
import {
  toFrontendWarehouse,
  toBackendCreateWarehouseDto,
  type BackendWarehouse,
  type BackendWarehouseInventory,
  type FrontendWarehouse,
} from "./adapters";

export interface WarehouseStats {
  totalCapacity: number;
  currentStock: number;
  occupancyRate: number;
  shipmentsReceived: number;
  shipmentsDispatched: number;
}

export interface WarehouseInventoryItem {
  id: string;
  shipmentId: string;
  warehouseId: string;
  location: string;
  qrCode?: string;
  barcode?: string;
  receivedAt: string;
  dispatchedAt?: string;
  isInWarehouse: boolean;
}

export const warehouseApi = {
  // ============================================================================
  // WAREHOUSE ENDPOINTS
  // ============================================================================

  /**
   * Get all warehouses
   * Backend: GET /warehouse
   */
  getWarehouses: async (filters?: {
    country?: string;
    isActive?: boolean;
  }): Promise<FrontendWarehouse[]> => {
    try {
      const params: Record<string, unknown> = {};
      if (filters?.country) params.country = filters.country;
      if (filters?.isActive !== undefined) params.isActive = filters.isActive;

      const response = await apiClient.get<BackendWarehouse[]>("/warehouse", { params });
      return response.data.map(toFrontendWarehouse);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get warehouse by ID
   * Backend: GET /warehouse/:id
   */
  getWarehouse: async (id: string): Promise<FrontendWarehouse> => {
    try {
      const response = await apiClient.get<BackendWarehouse>(`/warehouse/${id}`);
      return toFrontendWarehouse(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get warehouse statistics
   * Backend: GET /warehouse/:id/stats
   */
  getWarehouseStats: async (id: string): Promise<WarehouseStats> => {
    try {
      const response = await apiClient.get<WarehouseStats>(`/warehouse/${id}/stats`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get all warehouses statistics
   * Backend: GET /warehouse/stats
   */
  getAllWarehouseStats: async (): Promise<WarehouseStats> => {
    try {
      const response = await apiClient.get<WarehouseStats>("/warehouse/stats");
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get warehouse occupancy rate
   * Backend: GET /warehouse/:id/occupancy
   */
  getWarehouseOccupancy: async (id: string): Promise<{ occupancyRate: number; capacity: number; currentStock: number }> => {
    try {
      const response = await apiClient.get(`/warehouse/${id}/occupancy`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get recent warehouse activity
   * Backend: GET /warehouse/:id/recent-activity
   */
  getRecentActivity: async (id: string): Promise<WarehouseInventoryItem[]> => {
    try {
      const response = await apiClient.get<BackendWarehouseInventory[]>(`/warehouse/${id}/recent-activity`);
      return response.data.map((item) => ({
        id: item.id,
        shipmentId: item.shipmentId,
        warehouseId: item.warehouseId,
        location: item.location,
        qrCode: item.qrCode,
        barcode: item.barcode,
        receivedAt: item.receivedAt,
        dispatchedAt: item.dispatchedAt,
        isInWarehouse: item.isInWarehouse,
      }));
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create warehouse
   * Backend: POST /warehouse
   */
  createWarehouse: async (data: {
    name: string;
    code: string;
    city: string;
    country: string;
    address: string;
    phone: string;
    email: string;
    capacity: number;
  }): Promise<FrontendWarehouse> => {
    try {
      const backendData = toBackendCreateWarehouseDto(data);
      const response = await apiClient.post<BackendWarehouse>("/warehouse", backendData);
      return toFrontendWarehouse(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update warehouse
   * Backend: PATCH /warehouse/:id
   */
  updateWarehouse: async (
    id: string,
    data: Partial<{
      name: string;
      code: string;
      city: string;
      country: string;
      address: string;
      phone: string;
      email: string;
      capacity: number;
    }>
  ): Promise<FrontendWarehouse> => {
    try {
      const response = await apiClient.patch<BackendWarehouse>(`/warehouse/${id}`, data);
      return toFrontendWarehouse(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete warehouse
   * Backend: DELETE /warehouse/:id
   */
  deleteWarehouse: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/warehouse/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Activate warehouse
   * Backend: PATCH /warehouse/:id/activate
   */
  activateWarehouse: async (id: string): Promise<FrontendWarehouse> => {
    try {
      const response = await apiClient.patch<BackendWarehouse>(`/warehouse/${id}/activate`);
      return toFrontendWarehouse(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Deactivate warehouse
   * Backend: PATCH /warehouse/:id/deactivate
   */
  deactivateWarehouse: async (id: string): Promise<FrontendWarehouse> => {
    try {
      const response = await apiClient.patch<BackendWarehouse>(`/warehouse/${id}/deactivate`);
      return toFrontendWarehouse(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ============================================================================
  // INVENTORY ENDPOINTS
  // ============================================================================

  /**
   * Get all inventory
   * Backend: GET /warehouse/inventory
   */
  getInventory: async (filters?: {
    warehouseId?: string;
    isInWarehouse?: boolean;
  }): Promise<WarehouseInventoryItem[]> => {
    try {
      const params: Record<string, unknown> = {};
      if (filters?.warehouseId) params.warehouseId = filters.warehouseId;
      if (filters?.isInWarehouse !== undefined) params.isInWarehouse = filters.isInWarehouse;

      const response = await apiClient.get<BackendWarehouseInventory[]>("/warehouse/inventory", { params });
      return response.data.map((item) => ({
        id: item.id,
        shipmentId: item.shipmentId,
        warehouseId: item.warehouseId,
        location: item.location,
        qrCode: item.qrCode,
        barcode: item.barcode,
        receivedAt: item.receivedAt,
        dispatchedAt: item.dispatchedAt,
        isInWarehouse: item.isInWarehouse,
      }));
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get warehouse inventory
   * Backend: GET /warehouse/:warehouseId/inventory
   */
  getWarehouseInventory: async (warehouseId: string): Promise<WarehouseInventoryItem[]> => {
    try {
      const response = await apiClient.get<BackendWarehouseInventory[]>(`/warehouse/${warehouseId}/inventory`);
      return response.data.map((item) => ({
        id: item.id,
        shipmentId: item.shipmentId,
        warehouseId: item.warehouseId,
        location: item.location,
        qrCode: item.qrCode,
        barcode: item.barcode,
        receivedAt: item.receivedAt,
        dispatchedAt: item.dispatchedAt,
        isInWarehouse: item.isInWarehouse,
      }));
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get inventory item by ID
   * Backend: GET /warehouse/inventory/:id
   */
  getInventoryItem: async (id: string): Promise<WarehouseInventoryItem> => {
    try {
      const response = await apiClient.get<BackendWarehouseInventory>(`/warehouse/inventory/${id}`);
      const item = response.data;
      return {
        id: item.id,
        shipmentId: item.shipmentId,
        warehouseId: item.warehouseId,
        location: item.location,
        qrCode: item.qrCode,
        barcode: item.barcode,
        receivedAt: item.receivedAt,
        dispatchedAt: item.dispatchedAt,
        isInWarehouse: item.isInWarehouse,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Add shipment to inventory
   * Backend: POST /warehouse/inventory
   */
  addToInventory: async (data: {
    shipmentId: string;
    warehouseId: string;
    location: string;
    qrCode?: string;
    barcode?: string;
  }): Promise<WarehouseInventoryItem> => {
    try {
      const response = await apiClient.post<BackendWarehouseInventory>("/warehouse/inventory", data);
      const item = response.data;
      return {
        id: item.id,
        shipmentId: item.shipmentId,
        warehouseId: item.warehouseId,
        location: item.location,
        qrCode: item.qrCode,
        barcode: item.barcode,
        receivedAt: item.receivedAt,
        dispatchedAt: item.dispatchedAt,
        isInWarehouse: item.isInWarehouse,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Dispatch shipment from warehouse
   * Backend: PATCH /warehouse/inventory/:id/dispatch
   */
  dispatchFromInventory: async (id: string): Promise<WarehouseInventoryItem> => {
    try {
      const response = await apiClient.patch<BackendWarehouseInventory>(`/warehouse/inventory/${id}/dispatch`);
      const item = response.data;
      return {
        id: item.id,
        shipmentId: item.shipmentId,
        warehouseId: item.warehouseId,
        location: item.location,
        qrCode: item.qrCode,
        barcode: item.barcode,
        receivedAt: item.receivedAt,
        dispatchedAt: item.dispatchedAt,
        isInWarehouse: item.isInWarehouse,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete inventory item
   * Backend: DELETE /warehouse/inventory/:id
   */
  deleteInventoryItem: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/warehouse/inventory/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ============================================================================
  // SCANNING ENDPOINTS
  // ============================================================================

  /**
   * Find shipment by QR code
   * Backend: GET /warehouse/scan/qr/:qrCode
   */
  scanQrCode: async (qrCode: string): Promise<WarehouseInventoryItem | null> => {
    try {
      const response = await apiClient.get<BackendWarehouseInventory>(`/warehouse/scan/qr/${qrCode}`);
      const item = response.data;
      return {
        id: item.id,
        shipmentId: item.shipmentId,
        warehouseId: item.warehouseId,
        location: item.location,
        qrCode: item.qrCode,
        barcode: item.barcode,
        receivedAt: item.receivedAt,
        dispatchedAt: item.dispatchedAt,
        isInWarehouse: item.isInWarehouse,
      };
    } catch (error) {
      // Return null if not found
      return null;
    }
  },

  /**
   * Find shipment by barcode
   * Backend: GET /warehouse/scan/barcode/:barcode
   */
  scanBarcode: async (barcode: string): Promise<WarehouseInventoryItem | null> => {
    try {
      const response = await apiClient.get<BackendWarehouseInventory>(`/warehouse/scan/barcode/${barcode}`);
      const item = response.data;
      return {
        id: item.id,
        shipmentId: item.shipmentId,
        warehouseId: item.warehouseId,
        location: item.location,
        qrCode: item.qrCode,
        barcode: item.barcode,
        receivedAt: item.receivedAt,
        dispatchedAt: item.dispatchedAt,
        isInWarehouse: item.isInWarehouse,
      };
    } catch (error) {
      // Return null if not found
      return null;
    }
  },
};
