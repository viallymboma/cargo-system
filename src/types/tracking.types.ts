import { ShipmentStatus } from "./shipment.types";

// Tracking event type
export type TrackingEventType =
  | "status_change"
  | "location_update"
  | "scan"
  | "note"
  | "exception"
  | "delivery_attempt"
  | "customs";

// Location
export interface Location {
  city: string;
  country: string;
  facility?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Tracking event
export interface TrackingEvent {
  id: string;
  shipmentId: string;
  type: TrackingEventType;
  status: ShipmentStatus;
  location: Location;
  description: string;
  timestamp: string;
  createdById?: string;
  metadata?: Record<string, unknown>;
}

// Tracking timeline item (for UI display)
export interface TrackingTimelineItem {
  id: string;
  status: ShipmentStatus;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

// Tracking summary
export interface TrackingSummary {
  trackingNumber: string;
  currentStatus: ShipmentStatus;
  currentLocation: Location;
  origin: Location;
  destination: Location;
  estimatedDelivery?: string;
  lastUpdate: string;
  events: TrackingEvent[];
}

// Create tracking event data
export interface CreateTrackingEventData {
  shipmentId: string;
  type: TrackingEventType;
  status: ShipmentStatus;
  location: Location;
  description: string;
  metadata?: Record<string, unknown>;
}

// Warehouse scan data
export interface WarehouseScanData {
  trackingNumber: string;
  warehouseId: string;
  scanType: "arrival" | "departure" | "inventory";
  notes?: string;
}

// Status mapping for display (aligned with backend)
export const StatusLabels: Record<ShipmentStatus, string> = {
  pending: "Pending",
  confirmed: "Received at Origin",
  in_warehouse_china: "At Origin Warehouse",
  in_transit: "In Transit",
  customs_clearance: "Customs Clearance",
  in_warehouse_cameroon: "At Destination Warehouse",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
};

// Status colors for UI
export const StatusColors: Record<ShipmentStatus, string> = {
  pending: "gray",
  confirmed: "blue",
  in_warehouse_china: "indigo",
  in_transit: "purple",
  customs_clearance: "yellow",
  in_warehouse_cameroon: "indigo",
  out_for_delivery: "orange",
  delivered: "green",
  returned: "red",
  cancelled: "red",
};
