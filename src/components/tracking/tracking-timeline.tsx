"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDateTime, formatRelativeTime } from "@/lib/utils/format";
import type { TrackingTimelineItem } from "@/types/tracking.types";
import { StatusColors, StatusLabels } from "@/types/tracking.types";
import { ShipmentStatus } from "@/types/shipment.types";
import {
  Package,
  CheckCircle2,
  Circle,
  Truck,
  Plane,
  Ship,
  Warehouse,
  MapPin,
  Clock,
} from "lucide-react";

// Status to icon mapping
const statusIcons: Partial<Record<ShipmentStatus, React.ElementType>> = {
  pending: Clock,
  confirmed: CheckCircle2,
  in_warehouse_china: Warehouse,
  in_transit: Plane,
  customs_clearance: Package,
  in_warehouse_cameroon: Warehouse,
  out_for_delivery: Truck,
  delivered: CheckCircle2,
};

interface TrackingTimelineProps {
  events: TrackingTimelineItem[];
  className?: string;
}

export function TrackingTimeline({ events, className }: TrackingTimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {events.map((event, index) => {
        const Icon = statusIcons[event.status] || Circle;
        const color = StatusColors[event.status] || "gray";
        const isLast = index === events.length - 1;

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex gap-4"
          >
            {/* Timeline line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[19px] top-10 h-full w-0.5",
                  event.isCompleted ? "bg-green-200" : "bg-gray-200"
                )}
              />
            )}

            {/* Icon */}
            <div
              className={cn(
                "relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
                event.isCurrent
                  ? `bg-${color}-100 ring-4 ring-${color}-50`
                  : event.isCompleted
                    ? "bg-green-100"
                    : "bg-gray-100"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  event.isCurrent
                    ? `text-${color}-600`
                    : event.isCompleted
                      ? "text-green-600"
                      : "text-gray-400"
                )}
              />
            </div>

            {/* Content */}
            <div className={cn("flex-1 pb-8", isLast && "pb-0")}>
              <div
                className={cn(
                  "rounded-lg border p-4",
                  event.isCurrent
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200 bg-white"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4
                      className={cn(
                        "font-medium",
                        event.isCurrent ? "text-blue-900" : "text-gray-900"
                      )}
                    >
                      {event.title}
                    </h4>
                    <p
                      className={cn(
                        "mt-1 text-sm",
                        event.isCurrent ? "text-blue-700" : "text-gray-600"
                      )}
                    >
                      {event.description}
                    </p>
                  </div>
                  {event.isCurrent && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      Current
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span title={formatDateTime(event.timestamp)}>
                      {formatRelativeTime(event.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Compact version for lists
interface TrackingStatusBadgeProps {
  status: ShipmentStatus;
  className?: string;
}

export function TrackingStatusBadge({
  status,
  className,
}: TrackingStatusBadgeProps) {
  const color = StatusColors[status] || "gray";
  const label = StatusLabels[status] || status;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        `bg-${color}-100 text-${color}-800`,
        className
      )}
    >
      {label}
    </span>
  );
}

// Progress indicator
interface TrackingProgressProps {
  currentStatus: ShipmentStatus;
  className?: string;
}

const progressStatuses: ShipmentStatus[] = [
  "pending",
  "confirmed",
  "in_warehouse_china",
  "in_transit",
  "customs_clearance",
  "in_warehouse_cameroon",
  "out_for_delivery",
  "delivered",
];

export function TrackingProgress({
  currentStatus,
  className,
}: TrackingProgressProps) {
  const currentIndex = progressStatuses.indexOf(currentStatus);

  // Handle cancelled/returned statuses
  if (currentStatus === "cancelled" || currentStatus === "returned") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700",
          className
        )}
      >
        <Circle className="h-5 w-5" />
        <span className="font-medium">{StatusLabels[currentStatus]}</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Progress</span>
        <span className="font-medium text-gray-900">
          {Math.round(((currentIndex + 1) / progressStatuses.length) * 100)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{
            width: `${((currentIndex + 1) / progressStatuses.length) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Order Placed</span>
        <span>Delivered</span>
      </div>
    </div>
  );
}
