/**
 * API Adapters - Transform data between frontend and backend formats
 *
 * This file handles all the conversions needed to align the frontend
 * data models with the Logistics_Management backend API.
 */

import { type User, type Role, type Agency, RolePermissions } from "@/types/auth.types";
import type {
  Shipment,
  ShipmentStatus,
  CreateShipmentData,
  UpdateShipmentData,
  Sender,
  Receiver
} from "@/types/shipment.types";
import type {
  TrackingEvent,
  TrackingSummary,
  CreateTrackingEventData
} from "@/types/tracking.types";

// ============================================================================
// BACKEND TYPES (what the API returns/expects)
// ============================================================================

/** Backend role enum (uppercase, 4 roles) */
export type BackendRole = "SUPER_ADMIN" | "ADMIN" | "AGENT" | "CLIENT";

/** Backend shipment status enum (uppercase, 10 statuses) */
export type BackendShipmentStatus =
  | "PENDING"
  | "RECEIVED_ORIGIN"
  | "IN_TRANSIT"
  | "ARRIVED_HUB"
  | "IN_WAREHOUSE"
  | "CUSTOMS_CLEARANCE"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

/** Backend user (single name field) */
export interface BackendUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: BackendRole;
  isActive: boolean;
  agencyId?: string;
  agency?: BackendAgency;
  lastLoginAt?: string;
  lastLoginIp?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Backend agency */
export interface BackendAgency {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/** Backend shipment (flat sender/receiver fields) */
export interface BackendShipment {
  id: string;
  trackingNumber: string;
  status: BackendShipmentStatus;
  // Sender fields (flat)
  senderName: string;
  senderPhone: string;
  senderEmail?: string;
  senderAddress: string;
  // Receiver fields (flat)
  receiverName: string;
  receiverPhone: string;
  receiverEmail?: string;
  receiverAddress: string;
  receiverCity: string;
  // Route
  origin: "CHINA" | "DUBAI" | "USA" | "TURKEY";
  destination: "CAMEROON" | "GABON" | "CONGO" | "CHAD";
  // Package info
  weight: number;
  volume?: number;
  declaredValue: number;
  description?: string;
  numberOfPackages: number;
  // Location
  currentLocation?: string;
  warehouseId?: string;
  // Users
  clientId?: string;
  agentId?: string;
  // Dates
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

/** Backend create shipment DTO */
export interface BackendCreateShipmentDto {
  senderName: string;
  senderPhone: string;
  senderEmail?: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail?: string;
  receiverAddress: string;
  receiverCity: string;
  origin: "CHINA" | "DUBAI" | "USA" | "TURKEY";
  destination: "CAMEROON" | "GABON" | "CONGO" | "CHAD";
  weight: number;
  volume?: number;
  declaredValue: number;
  description?: string;
  numberOfPackages?: number;
}

/** Backend update shipment DTO */
export interface BackendUpdateShipmentDto {
  status?: BackendShipmentStatus;
  receiverName?: string;
  receiverPhone?: string;
  receiverEmail?: string;
  receiverAddress?: string;
  receiverCity?: string;
  description?: string;
  estimatedDeliveryDate?: string;
  currentLocation?: string;
}

/** Backend auth response */
export interface BackendAuthResponse {
  user: BackendUser;
  accessToken: string;
  refreshToken: string;
  expiresIn?: string;
}

/** Backend tracking event */
export interface BackendTrackingEvent {
  _id?: string;
  shipmentId: string;
  status: BackendShipmentStatus;
  location: string;
  country: string;
  description: string;
  metadata?: Record<string, unknown>;
  actor: "SYSTEM" | "AGENT" | "CLIENT";
  actorId?: string;
  timestamp: string;
}

/** Backend tracking timeline response */
export interface BackendTrackingResponse {
  shipmentId: string;
  totalEvents: number;
  currentStatus: BackendShipmentStatus;
  currentLocation: string;
  lastUpdate: string;
  timeline: BackendTrackingEvent[];
}

/** Backend create tracking event DTO */
export interface BackendCreateTrackingEventDto {
  shipmentId: string;
  status: BackendShipmentStatus;
  location: string;
  country: string;
  description: string;
  metadata?: Record<string, unknown>;
  actor?: "SYSTEM" | "AGENT" | "CLIENT";
  actorId?: string;
}

/** Backend cost calculation request */
export interface BackendCalculateCostDto {
  origin: "CHINA" | "DUBAI" | "USA" | "TURKEY";
  destination: "CAMEROON" | "GABON" | "CONGO" | "CHAD";
  weight: number;
  volume?: number;
  declaredValue: number;
}

/** Backend cost calculation response */
export interface BackendCostResponse {
  breakdown: {
    baseRate: number;
    weightCost: number;
    volumeCost: number;
    insuranceCost: number;
  };
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  tariffApplied: string;
}

/** Backend dashboard/statistics response */
export interface BackendDashboardResponse {
  shipments: {
    total: number;
    pending: number;
    inTransit: number;
    delivered: number;
  };
  revenue: {
    total: number;
    paid: number;
    pending: number;
  };
}

// ============================================================================
// ROLE MAPPING
// ============================================================================

/** Map frontend role to backend role */
export function toBackendRole(role: Role): BackendRole {
  const mapping: Record<Role, BackendRole> = {
    super_admin: "SUPER_ADMIN",
    admin: "ADMIN",
    manager: "ADMIN",        // manager maps to ADMIN
    agent: "AGENT",
    warehouse_staff: "AGENT", // warehouse_staff maps to AGENT
    customer: "CLIENT",
  };
  return mapping[role];
}

/** Map backend role to frontend role */
export function toFrontendRole(role: BackendRole): Role {
  const mapping: Record<BackendRole, Role> = {
    SUPER_ADMIN: "super_admin" as Role,
    ADMIN: "admin" as Role,
    AGENT: "agent" as Role,
    CLIENT: "customer" as Role,
  };
  return mapping[role];
}

// ============================================================================
// STATUS MAPPING
// ============================================================================

/** Map frontend status to backend status */
export function toBackendStatus(status: ShipmentStatus): BackendShipmentStatus {
  const mapping: Record<ShipmentStatus, BackendShipmentStatus> = {
    pending: "PENDING",
    confirmed: "RECEIVED_ORIGIN",
    in_warehouse_china: "ARRIVED_HUB",
    in_transit: "IN_TRANSIT",
    customs_clearance: "CUSTOMS_CLEARANCE",
    in_warehouse_cameroon: "IN_WAREHOUSE",
    out_for_delivery: "OUT_FOR_DELIVERY",
    delivered: "DELIVERED",
    returned: "RETURNED",
    cancelled: "CANCELLED",
  };
  return mapping[status];
}

/** Map backend status to frontend status */
export function toFrontendStatus(status: BackendShipmentStatus): ShipmentStatus {
  const mapping: Record<BackendShipmentStatus, ShipmentStatus> = {
    PENDING: "pending",
    RECEIVED_ORIGIN: "confirmed",
    IN_TRANSIT: "in_transit",
    ARRIVED_HUB: "in_warehouse_china",
    IN_WAREHOUSE: "in_warehouse_cameroon",
    CUSTOMS_CLEARANCE: "customs_clearance",
    OUT_FOR_DELIVERY: "out_for_delivery",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    RETURNED: "returned",
  };
  return mapping[status];
}

// ============================================================================
// USER TRANSFORMATIONS
// ============================================================================

/** Split full name into first and last name */
function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
}

/** Join first and last name into full name */
function joinName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

/** Transform backend agency to frontend agency */
export function toFrontendAgency(agency: BackendAgency): Agency {
  return {
    id: agency.id,
    name: agency.name,
    code: agency.code,
    address: agency.address,
    city: agency.city,
    country: agency.country,
    phone: agency.phone,
    email: agency.email,
    isActive: agency.isActive,
    createdAt: agency.createdAt,
    updatedAt: agency.updatedAt,
  };
}

/** Transform backend user to frontend user */
export function toFrontendUser(backendUser: BackendUser): User {
  const { firstName, lastName } = splitName(backendUser.name);
  const role = toFrontendRole(backendUser.role);

  // Permissions for role

  return {
    id: backendUser.id,
    email: backendUser.email,
    firstName,
    lastName,
    phone: backendUser.phone,
    role,
    permissions: RolePermissions[role] || [],
    agencyId: backendUser.agencyId || backendUser.agency?.id,
    agency: backendUser.agency ? toFrontendAgency(backendUser.agency) : undefined,
    avatarUrl: undefined, // Backend doesn't have avatar
    isActive: backendUser.isActive,
    emailVerified: true, // Backend doesn't track this, assume verified
    lastLoginAt: backendUser.lastLoginAt,
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt,
  };
}

/** Transform frontend user data for backend registration */
export function toBackendRegisterDto(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): {
  email: string;
  password: string;
  name: string;
  phone?: string;
} {
  return {
    email: data.email,
    password: data.password,
    name: joinName(data.firstName, data.lastName),
    phone: data.phone,
  };
}

/** Transform frontend user update data for backend */
export function toBackendUserUpdateDto(data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
}): {
  name?: string;
  phone?: string;
} {
  const result: { name?: string; phone?: string } = {};

  if (data.firstName !== undefined || data.lastName !== undefined) {
    result.name = joinName(data.firstName || "", data.lastName || "");
  }

  if (data.phone !== undefined) {
    result.phone = data.phone;
  }

  return result;
}

// ============================================================================
// SHIPMENT TRANSFORMATIONS
// ============================================================================

/** Map origin country string to backend enum */
function mapOriginCountry(country: string): "CHINA" | "DUBAI" | "USA" | "TURKEY" {
  const normalized = country.toUpperCase();
  if (normalized === "CHINA" || normalized === "CN") return "CHINA";
  if (normalized === "DUBAI" || normalized === "UAE" || normalized === "AE") return "DUBAI";
  if (normalized === "USA" || normalized === "US" || normalized === "UNITED STATES") return "USA";
  if (normalized === "TURKEY" || normalized === "TR") return "TURKEY";
  return "CHINA"; // Default
}

/** Map destination country string to backend enum */
function mapDestinationCountry(country: string): "CAMEROON" | "GABON" | "CONGO" | "CHAD" {
  const normalized = country.toUpperCase();
  if (normalized === "CAMEROON" || normalized === "CM") return "CAMEROON";
  if (normalized === "GABON" || normalized === "GA") return "GABON";
  if (normalized === "CONGO" || normalized === "CG" || normalized === "CD") return "CONGO";
  if (normalized === "CHAD" || normalized === "TD") return "CHAD";
  return "CAMEROON"; // Default
}

/** Transform backend shipment to frontend shipment */
export function toFrontendShipment(backend: BackendShipment): Shipment {
  // Create sender object from flat fields
  const sender: Sender = {
    name: backend.senderName,
    phone: backend.senderPhone,
    email: backend.senderEmail,
    address: backend.senderAddress,
    city: "", // Backend doesn't provide sender city separately
    country: backend.origin,
  };

  // Create receiver object from flat fields
  const receiver: Receiver = {
    name: backend.receiverName,
    phone: backend.receiverPhone,
    email: backend.receiverEmail,
    address: backend.receiverAddress,
    city: backend.receiverCity,
    country: backend.destination,
  };

  return {
    id: backend.id,
    trackingNumber: backend.trackingNumber,
    status: toFrontendStatus(backend.status),
    type: "air", // Backend doesn't have shipment type, default to air
    packageType: "box", // Backend doesn't have package type, default to box
    sender,
    receiver,
    agencyId: "", // Will be populated from context if needed
    createdById: backend.clientId || "",
    items: [], // Backend uses description instead of items array
    dimensions: backend.volume ? {
      length: 0,
      width: 0,
      height: 0,
    } : undefined,
    totalWeight: backend.weight,
    volumetricWeight: backend.volume,
    chargeableWeight: Math.max(backend.weight, backend.volume || 0),
    declaredValue: backend.declaredValue,
    shippingCost: 0, // Would need to be calculated
    insuranceCost: 0,
    customsDuty: 0,
    totalCost: 0,
    estimatedDeliveryDate: backend.estimatedDeliveryDate,
    actualDeliveryDate: backend.actualDeliveryDate,
    createdAt: backend.createdAt,
    updatedAt: backend.updatedAt,
    notes: backend.description,
    specialInstructions: undefined,
    insuranceRequired: false,
    signatureRequired: false,
    fragile: false,
  };
}

/** Transform frontend create shipment data to backend DTO */
export function toBackendCreateShipmentDto(data: CreateShipmentData): BackendCreateShipmentDto {
  return {
    senderName: data.sender.name,
    senderPhone: data.sender.phone,
    senderEmail: data.sender.email,
    senderAddress: data.sender.address,
    receiverName: data.receiver.name,
    receiverPhone: data.receiver.phone,
    receiverEmail: data.receiver.email,
    receiverAddress: data.receiver.address,
    receiverCity: data.receiver.city,
    origin: mapOriginCountry(data.sender.country),
    destination: mapDestinationCountry(data.receiver.country),
    weight: data.totalWeight,
    volume: data.dimensions
      ? (data.dimensions.length * data.dimensions.width * data.dimensions.height) / 1000000
      : undefined,
    declaredValue: data.declaredValue,
    description: data.notes || data.items.map(i => i.description).join(", "),
    numberOfPackages: data.items.length || 1,
  };
}

/** Transform frontend update shipment data to backend DTO */
export function toBackendUpdateShipmentDto(data: UpdateShipmentData): BackendUpdateShipmentDto {
  const result: BackendUpdateShipmentDto = {};

  if (data.status) {
    result.status = toBackendStatus(data.status);
  }

  if (data.receiver) {
    if (data.receiver.name) result.receiverName = data.receiver.name;
    if (data.receiver.phone) result.receiverPhone = data.receiver.phone;
    if (data.receiver.email) result.receiverEmail = data.receiver.email;
    if (data.receiver.address) result.receiverAddress = data.receiver.address;
    if (data.receiver.city) result.receiverCity = data.receiver.city;
  }

  if (data.notes) {
    result.description = data.notes;
  }

  if (data.estimatedDeliveryDate) {
    result.estimatedDeliveryDate = data.estimatedDeliveryDate;
  }

  return result;
}

// ============================================================================
// TRACKING TRANSFORMATIONS
// ============================================================================

/** Transform backend tracking event to frontend format */
export function toFrontendTrackingEvent(backend: BackendTrackingEvent): TrackingEvent {
  return {
    id: backend._id || `${backend.shipmentId}-${backend.timestamp}`,
    shipmentId: backend.shipmentId,
    type: "status_change", // Backend doesn't differentiate event types
    status: toFrontendStatus(backend.status),
    location: {
      city: backend.location,
      country: backend.country,
      facility: undefined,
    },
    description: backend.description,
    timestamp: backend.timestamp,
    createdById: backend.actorId,
    metadata: backend.metadata,
  };
}

/** Transform backend tracking response to frontend summary */
export function toFrontendTrackingSummary(
  backend: BackendTrackingResponse,
  shipment?: BackendShipment
): TrackingSummary {
  return {
    trackingNumber: shipment?.trackingNumber || "",
    currentStatus: toFrontendStatus(backend.currentStatus),
    currentLocation: {
      city: backend.currentLocation,
      country: "", // Would need to be inferred
    },
    origin: {
      city: "",
      country: shipment?.origin || "",
    },
    destination: {
      city: shipment?.receiverCity || "",
      country: shipment?.destination || "",
    },
    estimatedDelivery: shipment?.estimatedDeliveryDate,
    lastUpdate: backend.lastUpdate,
    events: backend.timeline.map(toFrontendTrackingEvent),
  };
}

/** Transform frontend create tracking event to backend DTO */
export function toBackendCreateTrackingEventDto(data: CreateTrackingEventData): BackendCreateTrackingEventDto {
  return {
    shipmentId: data.shipmentId,
    status: toBackendStatus(data.status),
    location: data.location.city,
    country: data.location.country,
    description: data.description,
    metadata: data.metadata,
    actor: "AGENT", // Default to agent
  };
}

// ============================================================================
// BILLING TRANSFORMATIONS
// ============================================================================

/** Transform frontend cost calculation request to backend format */
export function toBackendCalculateCostDto(data: {
  type: string;
  weight: number;
  dimensions?: { length: number; width: number; height: number };
  declaredValue: number;
  origin?: string;
  destination?: string;
}): BackendCalculateCostDto {
  const volume = data.dimensions
    ? (data.dimensions.length * data.dimensions.width * data.dimensions.height) / 1000000
    : undefined;

  return {
    origin: mapOriginCountry(data.origin || "CHINA"),
    destination: mapDestinationCountry(data.destination || "CAMEROON"),
    weight: data.weight,
    volume,
    declaredValue: data.declaredValue,
  };
}

/** Transform backend cost response to frontend format */
export function toFrontendCostResponse(backend: BackendCostResponse): {
  shippingCost: number;
  insuranceCost: number;
  estimatedDays: number;
} {
  return {
    shippingCost: backend.subtotal,
    insuranceCost: backend.breakdown.insuranceCost,
    estimatedDays: 14, // Default estimate, backend doesn't provide this
  };
}

/** Transform backend dashboard response to frontend statistics */
export function toFrontendStatistics(backend: BackendDashboardResponse): {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  revenue: number;
} {
  return {
    total: backend.shipments.total,
    pending: backend.shipments.pending,
    inTransit: backend.shipments.inTransit,
    delivered: backend.shipments.delivered,
    revenue: backend.revenue.total,
  };
}

// ============================================================================
// WAREHOUSE TYPES AND TRANSFORMATIONS
// ============================================================================

/** Backend warehouse */
export interface BackendWarehouse {
  id: string;
  name: string;
  code: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  currentStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Backend create warehouse DTO */
export interface BackendCreateWarehouseDto {
  name: string;
  code: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  capacity: number;
  latitude?: number;
  longitude?: number;
}

/** Backend warehouse inventory item */
export interface BackendWarehouseInventory {
  id: string;
  shipmentId: string;
  warehouseId: string;
  location: string;
  qrCode?: string;
  barcode?: string;
  receivedAt: string;
  dispatchedAt?: string;
  isInWarehouse: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Frontend warehouse type */
export interface FrontendWarehouse {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  capacity: number;
  currentStock: number;
  status: "operational" | "maintenance" | "closed";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Transform backend warehouse to frontend format */
export function toFrontendWarehouse(backend: BackendWarehouse): FrontendWarehouse {
  return {
    id: backend.id,
    name: backend.name,
    code: backend.code,
    city: backend.city,
    country: backend.country,
    address: backend.address,
    phone: backend.phone,
    email: backend.email,
    capacity: backend.capacity,
    currentStock: backend.currentStock,
    status: backend.isActive ? "operational" : "closed",
    isActive: backend.isActive,
    createdAt: backend.createdAt,
    updatedAt: backend.updatedAt,
  };
}

/** Transform frontend create warehouse to backend DTO */
export function toBackendCreateWarehouseDto(data: {
  name: string;
  code: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  capacity: number;
}): BackendCreateWarehouseDto {
  return {
    name: data.name,
    code: data.code,
    country: data.country,
    city: data.city,
    address: data.address,
    phone: data.phone,
    email: data.email,
    capacity: data.capacity,
  };
}

// ============================================================================
// USER MANAGEMENT TYPES AND TRANSFORMATIONS
// ============================================================================

/** Backend create user DTO */
export interface BackendCreateUserDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: BackendRole;
  agencyId?: string;
}

/** Backend update user DTO */
export interface BackendUpdateUserDto {
  name?: string;
  phone?: string;
  role?: BackendRole;
  agencyId?: string | null;
}

/** Transform frontend create user to backend DTO */
export function toBackendCreateUserDto(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  agencyId?: string;
}): BackendCreateUserDto {
  return {
    email: data.email,
    password: data.password,
    name: joinName(data.firstName, data.lastName),
    phone: data.phone,
    role: toBackendRole(data.role as Role),
    agencyId: data.agencyId,
  };
}

/** Transform frontend update user to backend DTO */
export function toBackendUpdateUserDto(data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  agencyId?: string | null;
}): BackendUpdateUserDto {
  const result: BackendUpdateUserDto = {};

  if (data.firstName !== undefined || data.lastName !== undefined) {
    result.name = joinName(data.firstName || "", data.lastName || "");
  }

  if (data.phone !== undefined) {
    result.phone = data.phone;
  }

  if (data.role !== undefined) {
    result.role = toBackendRole(data.role as Role);
  }

  if (data.agencyId !== undefined) {
    result.agencyId = data.agencyId;
  }

  return result;
}

/** Backend user stats response */
export interface BackendUserStats {
  totalShipments: number;
  deliveredShipments: number;
  pendingShipments: number;
}

/** Backend agency stats response */
export interface BackendAgencyStats {
  totalUsers: number;
  activeUsers: number;
  totalShipments: number;
}

// ============================================================================
// BILLING TYPES AND TRANSFORMATIONS
// ============================================================================

/** Backend invoice */
export interface BackendInvoice {
  id: string;
  invoiceNumber: string;
  shipmentId: string;
  clientId: string;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  description?: string;
  items: BackendInvoiceItem[];
  taxes?: number;
  discounts?: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

/** Backend invoice item */
export interface BackendInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate?: number;
}

/** Backend payment */
export interface BackendPayment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  method: "cash" | "bank_transfer" | "credit_card" | "mobile_money" | "cheque";
  transactionId?: string;
  status: "pending" | "completed" | "failed" | "refunded";
  processedBy: string;
  processedAt: string;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Backend tariff rule */
export interface BackendTariffRule {
  id: string;
  origin: string;
  destination: string;
  baseRate: number;
  ratePerKg: number;
  ratePerVolume: number;
  minCharge: number;
  maxCharge?: number;
  currency: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/** Backend invoice stats */
export interface BackendInvoiceStats {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
}

/** Backend payment stats */
export interface BackendPaymentStats {
  totalPayments: number;
  successfulPayments: number;
  pendingPayments: number;
  totalAmount: number;
}

/** Backend revenue report */
export interface BackendRevenueReport {
  period: {
    startDate: string;
    endDate: string;
  };
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

/** Backend outstanding payments */
export interface BackendOutstandingPayments {
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

/** Backend payment method breakdown */
export interface BackendPaymentMethodBreakdown {
  method: string;
  count: number;
  percentage: number;
  totalAmount: number;
}

/** Backend create invoice DTO */
export interface BackendCreateInvoiceDto {
  shipmentId: string;
  clientId: string;
  description?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
  }[];
  taxes?: number;
  discounts?: number;
  dueDate?: string;
}

/** Backend update invoice DTO */
export interface BackendUpdateInvoiceDto {
  status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  description?: string;
  dueDate?: string;
}

/** Backend create payment DTO */
export interface BackendCreatePaymentDto {
  invoiceId: string;
  amount: number;
  method: "cash" | "bank_transfer" | "credit_card" | "mobile_money" | "cheque";
  transactionId?: string;
  reference?: string;
  notes?: string;
}

/** Backend create tariff rule DTO */
export interface BackendCreateTariffRuleDto {
  origin: string;
  destination: string;
  baseRate: number;
  ratePerKg: number;
  ratePerVolume: number;
  minCharge: number;
  maxCharge?: number;
  currency: string;
  description?: string;
}

/** Backend update tariff rule DTO */
export interface BackendUpdateTariffRuleDto {
  origin?: string;
  destination?: string;
  baseRate?: number;
  ratePerKg?: number;
  ratePerVolume?: number;
  minCharge?: number;
  maxCharge?: number;
  currency?: string;
  description?: string;
  isActive?: boolean;
}

/** Backend query invoices DTO */
export interface BackendQueryInvoicesDto {
  clientId?: string;
  shipmentId?: string;
  status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  dateFrom?: string;
  dateTo?: string;
}
