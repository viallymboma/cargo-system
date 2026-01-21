// Shipment status (aligned with backend)
export type ShipmentStatus =
  | "pending"
  | "confirmed"
  | "in_warehouse_china"
  | "in_transit"
  | "customs_clearance"
  | "in_warehouse_cameroon"
  | "out_for_delivery"
  | "delivered"
  | "returned"
  | "cancelled";

// Shipment type (mode of transport)
export type ShipmentType = "air" | "sea" | "ground" | "express";

// Package type
export type PackageType = "box" | "envelope" | "pallet" | "container" | "other";

// Sender information
export interface Sender {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  province?: string;
  country: string;
  postalCode?: string;
}

// Receiver information
export interface Receiver {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  region?: string;
  country: string;
}

// Package item
export interface PackageItem {
  id: string;
  description: string;
  quantity: number;
  weight: number; // in kg
  unitPrice: number; // in XAF
  hsCode?: string;
  category?: string;
}

// Package dimensions
export interface PackageDimensions {
  length: number; // in cm
  width: number; // in cm
  height: number; // in cm
}

// Shipment
export interface Shipment {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  type: ShipmentType;
  packageType: PackageType;

  // Parties
  sender: Sender;
  receiver: Receiver;
  agencyId: string;
  createdById: string;

  // Package details
  items: PackageItem[];
  dimensions?: PackageDimensions;
  totalWeight: number; // in kg
  volumetricWeight?: number; // in kg
  chargeableWeight?: number; // in kg

  // Pricing
  declaredValue: number; // in XAF
  shippingCost: number; // in XAF
  insuranceCost?: number; // in XAF
  customsDuty?: number; // in XAF
  totalCost: number; // in XAF

  // Dates
  pickupDate?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;

  // Additional info
  notes?: string;
  specialInstructions?: string;
  insuranceRequired: boolean;
  signatureRequired: boolean;
  fragile: boolean;
}

// Shipment creation data
export interface CreateShipmentData {
  type: ShipmentType;
  packageType: PackageType;
  sender: Omit<Sender, "id">;
  receiver: Omit<Receiver, "id">;
  items: Omit<PackageItem, "id">[];
  dimensions?: PackageDimensions;
  totalWeight: number;
  declaredValue: number;
  notes?: string;
  specialInstructions?: string;
  insuranceRequired?: boolean;
  signatureRequired?: boolean;
  fragile?: boolean;
}

// Shipment update data
export interface UpdateShipmentData {
  status?: ShipmentStatus;
  receiver?: Partial<Receiver>;
  notes?: string;
  specialInstructions?: string;
  estimatedDeliveryDate?: string;
}

// Shipment filter options
export interface ShipmentFilters {
  status?: ShipmentStatus | ShipmentStatus[];
  type?: ShipmentType;
  agencyId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Shipment list params
export interface ShipmentListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: ShipmentFilters;
}
