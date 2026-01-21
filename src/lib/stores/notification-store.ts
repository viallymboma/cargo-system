import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type NotificationType = "info" | "success" | "warning" | "error";
export type NotificationChannel = "email" | "sms" | "whatsapp" | "push";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  read: boolean;
  shipmentId?: string;
  invoiceId?: string;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;

  // Actions
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;

  // Simulation helpers
  simulateShipmentUpdate: (trackingNumber: string, status: string) => void;
  simulatePaymentReceived: (invoiceNumber: string, amount: number) => void;
  simulateDeliveryNotification: (trackingNumber: string, receiverName: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: "notif-1",
          type: "info",
          title: "Shipment Update",
          message: "Your shipment ST-2401ABC123 has arrived at Douala warehouse",
          channel: "push",
          read: false,
          shipmentId: "shipment-1",
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        },
        {
          id: "notif-2",
          type: "success",
          title: "Payment Confirmed",
          message: "Payment of 800,000 XAF for invoice INV-2024-0001 has been received",
          channel: "email",
          read: false,
          invoiceId: "invoice-1",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        {
          id: "notif-3",
          type: "warning",
          title: "Customs Hold",
          message: "Shipment ST-2401GHI789 is being held at customs for inspection",
          channel: "sms",
          read: true,
          shipmentId: "shipment-3",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        },
      ],
      unreadCount: 2,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${generateId()}`,
          read: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));

        // Show browser notification if permitted
        if (typeof window !== "undefined" && "Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification(notification.title, {
              body: notification.message,
              icon: "/favicon.ico",
            });
          }
        }

        // Log to console for simulation visibility
        console.log(
          `%c[NOTIFICATION - ${notification.channel.toUpperCase()}] ${notification.title}`,
          `color: ${
            notification.type === "success"
              ? "#10b981"
              : notification.type === "warning"
              ? "#f59e0b"
              : notification.type === "error"
              ? "#ef4444"
              : "#3b82f6"
          }; font-weight: bold;`
        );
        console.log(`  ${notification.message}`);
      },

      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const wasUnread = notification && !notification.read;

          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      deleteNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const wasUnread = notification && !notification.read;

          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
          };
        });
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      // Simulation helpers
      simulateShipmentUpdate: (trackingNumber, status) => {
        const statusMessages: Record<string, string> = {
          pending: `Shipment ${trackingNumber} has been created`,
          confirmed: `Shipment ${trackingNumber} has been received at origin`,
          in_warehouse_china: `Shipment ${trackingNumber} has arrived at origin warehouse`,
          in_transit: `Shipment ${trackingNumber} is now in transit to Cameroon`,
          customs_clearance: `Shipment ${trackingNumber} is being processed at customs`,
          in_warehouse_cameroon: `Shipment ${trackingNumber} has arrived at destination warehouse`,
          out_for_delivery: `Shipment ${trackingNumber} is out for delivery`,
          delivered: `Shipment ${trackingNumber} has been delivered successfully!`,
        };

        get().addNotification({
          type: status === "delivered" ? "success" : "info",
          title: "Shipment Update",
          message: statusMessages[status] || `Shipment ${trackingNumber} status: ${status}`,
          channel: "push",
          shipmentId: trackingNumber,
        });
      },

      simulatePaymentReceived: (invoiceNumber, amount) => {
        const formattedAmount = new Intl.NumberFormat("fr-CM", {
          style: "currency",
          currency: "XAF",
          minimumFractionDigits: 0,
        }).format(amount);

        get().addNotification({
          type: "success",
          title: "Payment Received",
          message: `Payment of ${formattedAmount} for invoice ${invoiceNumber} has been confirmed`,
          channel: "email",
          invoiceId: invoiceNumber,
        });
      },

      simulateDeliveryNotification: (trackingNumber, receiverName) => {
        get().addNotification({
          type: "success",
          title: "Package Delivered",
          message: `Package ${trackingNumber} has been delivered to ${receiverName}. Thank you for using DHL CARGO!`,
          channel: "whatsapp",
          shipmentId: trackingNumber,
        });
      },
    }),
    {
      name: "shiptrack-notifications",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Helper function to request notification permissions
export const requestNotificationPermission = async () => {
  if (typeof window !== "undefined" && "Notification" in window) {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
};
