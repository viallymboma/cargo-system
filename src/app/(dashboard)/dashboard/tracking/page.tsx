"use client";

import { useState } from "react";
import { shipmentsApi } from "@/lib/api";
import { useMockDataStore } from "@/lib/stores/mock-data-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  Plane,
  Ship,
  Warehouse,
  FileCheck,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import type { TrackingSummary, TrackingEvent } from "@/types/tracking.types";
import type { ShipmentStatus } from "@/types/shipment.types";

const statusConfig: Record<
  ShipmentStatus,
  { icon: React.ReactNode; color: string; label: string }
> = {
  pending: { icon: <Clock className="h-5 w-5" />, color: "text-yellow-500", label: "Pending" },
  confirmed: { icon: <CheckCircle className="h-5 w-5" />, color: "text-blue-500", label: "Confirmed" },
  picked_up: { icon: <Package className="h-5 w-5" />, color: "text-indigo-500", label: "Picked Up" },
  in_warehouse_china: { icon: <Warehouse className="h-5 w-5" />, color: "text-purple-500", label: "In Warehouse (China)" },
  in_transit: { icon: <Plane className="h-5 w-5" />, color: "text-cyan-500", label: "In Transit" },
  customs_clearance: { icon: <FileCheck className="h-5 w-5" />, color: "text-orange-500", label: "Customs Clearance" },
  in_warehouse_cameroon: { icon: <Warehouse className="h-5 w-5" />, color: "text-teal-500", label: "In Warehouse (Cameroon)" },
  out_for_delivery: { icon: <Truck className="h-5 w-5" />, color: "text-lime-500", label: "Out for Delivery" },
  delivered: { icon: <CheckCircle className="h-5 w-5" />, color: "text-green-500", label: "Delivered" },
  cancelled: { icon: <Clock className="h-5 w-5" />, color: "text-red-500", label: "Cancelled" },
  returned: { icon: <Package className="h-5 w-5" />, color: "text-gray-500", label: "Returned" },
};

const statusOrder: ShipmentStatus[] = [
  "pending",
  "confirmed",
  "picked_up",
  "in_warehouse_china",
  "in_transit",
  "customs_clearance",
  "in_warehouse_cameroon",
  "out_for_delivery",
  "delivered",
];

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [tracking, setTracking] = useState<TrackingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError("");
    setTracking(null);

    try {
      const result = await shipmentsApi.getTracking(trackingNumber.trim());
      if (result) {
        setTracking(result);
      } else {
        setError("Shipment not found");
      }
    } catch (err) {
      setError("Failed to fetch tracking information");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: ShipmentStatus) => {
    if (!tracking) return;

    setUpdateLoading(true);
    try {
      const shipment = useMockDataStore.getState().getShipmentByTrackingNumber(tracking.trackingNumber);
      if (shipment) {
        await shipmentsApi.addTrackingEvent({
          shipmentId: shipment.id,
          type: "status_change",
          status: newStatus,
          location: {
            city: getLocationForStatus(newStatus),
            country: getCountryForStatus(newStatus),
          },
          description: `Status updated to ${statusConfig[newStatus].label}`,
        });

        // Refresh tracking
        const result = await shipmentsApi.getTracking(tracking.trackingNumber);
        if (result) {
          setTracking(result);
          toast.success(`Status updated to ${statusConfig[newStatus].label}`);
        }
      }
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdateLoading(false);
    }
  };

  const getLocationForStatus = (status: ShipmentStatus): string => {
    switch (status) {
      case "picked_up":
      case "in_warehouse_china":
        return "Guangzhou";
      case "in_transit":
        return "In Air";
      case "customs_clearance":
      case "in_warehouse_cameroon":
      case "out_for_delivery":
      case "delivered":
        return "Douala";
      default:
        return "Unknown";
    }
  };

  const getCountryForStatus = (status: ShipmentStatus): string => {
    switch (status) {
      case "picked_up":
      case "in_warehouse_china":
        return "China";
      case "in_transit":
        return "International";
      default:
        return "Cameroon";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCurrentStatusIndex = () => {
    if (!tracking) return -1;
    return statusOrder.indexOf(tracking.currentStatus);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Track Shipment</h1>
        <p className="text-gray-500">Enter a tracking number to view shipment status</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Enter tracking number (e.g., ST-2401ABC123)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Track"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Links - Recent Shipments */}
      {!tracking && !error && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {useMockDataStore.getState().shipments.slice(0, 4).map((shipment) => (
                <button
                  key={shipment.id}
                  onClick={() => {
                    setTrackingNumber(shipment.trackingNumber);
                    handleSearch({ preventDefault: () => {} } as React.FormEvent);
                  }}
                  className="text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="font-mono font-medium text-sm">{shipment.trackingNumber}</p>
                  <p className="text-sm text-gray-500 mt-1">{shipment.receiver.name}</p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        statusConfig[shipment.status].color
                      } bg-opacity-10`}
                    >
                      {statusConfig[shipment.status].label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Tracking Result */}
      {tracking && (
        <div className="space-y-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTracking(null);
              setTrackingNumber("");
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to list
          </Button>

          {/* Summary Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-mono">{tracking.trackingNumber}</CardTitle>
                  <p className="text-gray-500 mt-1">
                    Last updated: {formatDate(tracking.lastUpdate)}
                  </p>
                </div>
                <div className={`flex items-center gap-2 ${statusConfig[tracking.currentStatus].color}`}>
                  {statusConfig[tracking.currentStatus].icon}
                  <span className="font-semibold text-lg">
                    {statusConfig[tracking.currentStatus].label}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>
                    {tracking.origin.city}, {tracking.origin.country}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>
                    {tracking.destination.city}, {tracking.destination.country}
                  </span>
                </div>
              </div>

              {tracking.estimatedDelivery && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Estimated Delivery: {formatDate(tracking.estimatedDelivery)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Bar */}
          <Card>
            <CardHeader>
              <CardTitle>Shipment Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="flex justify-between">
                  {statusOrder.slice(0, 5).map((status, index) => {
                    const currentIndex = getCurrentStatusIndex();
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                      <div
                        key={status}
                        className={`flex flex-col items-center flex-1 ${
                          index < 4 ? "relative" : ""
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-400"
                          } ${isCurrent ? "ring-4 ring-green-200" : ""}`}
                        >
                          {statusConfig[status].icon}
                        </div>
                        <p
                          className={`text-xs mt-2 text-center ${
                            isCompleted ? "text-green-600 font-medium" : "text-gray-400"
                          }`}
                        >
                          {statusConfig[status].label}
                        </p>
                        {index < 4 && (
                          <div
                            className={`absolute top-5 left-1/2 w-full h-0.5 ${
                              index < currentIndex ? "bg-green-500" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Update Status (Admin) */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select
                  onValueChange={(value) => handleStatusUpdate(value as ShipmentStatus)}
                  disabled={updateLoading}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOrder.map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <span className={statusConfig[status].color}>
                            {statusConfig[status].icon}
                          </span>
                          {statusConfig[status].label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {updateLoading && <Loader2 className="h-5 w-5 animate-spin" />}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {tracking.events.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="relative">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          index === 0
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {statusConfig[event.status].icon}
                      </div>
                      {index < tracking.events.length - 1 && (
                        <div className="absolute top-10 left-1/2 w-0.5 h-full -translate-x-1/2 bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{event.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(event.timestamp)}</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        <MapPin className="inline h-3 w-3 mr-1" />
                        {event.location.city}, {event.location.country}
                        {event.location.facility && ` - ${event.location.facility}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
