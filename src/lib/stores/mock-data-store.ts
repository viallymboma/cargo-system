import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, Agency, Role, Permission } from "@/types/auth.types";
import { RolePermissions } from "@/types/auth.types";
import type {
  Shipment,
  ShipmentStatus,
  ShipmentType,
  PackageType,
  CreateShipmentData,
  UpdateShipmentData,
} from "@/types/shipment.types";
import type {
  TrackingEvent,
  TrackingEventType,
  TrackingSummary,
  CreateTrackingEventData,
} from "@/types/tracking.types";
import {
  type Invoice,
  type InvoiceStatus,
  type Payment,
  type PaymentStatus,
  type PaymentMethod,
  type CreateInvoiceData,
  type CreatePaymentData,
  type MobileMoneyProvider,
  type Tariff,
  type CreateTariffData,
} from "@/types/billing.types";

// ============================================
// HELPER FUNCTIONS
// ============================================

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

const generateTrackingNumber = (): string => {
  const prefix = "ST";
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}${month}${random}`;
};

const generateInvoiceNumber = (): string => {
  const prefix = "INV";
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}-${year}-${random}`;
};

// ============================================
// INITIAL MOCK DATA
// ============================================

const initialAgencies: Agency[] = [
  {
    id: "agency-1",
    name: "ShipTrack Douala",
    code: "STD",
    address: "123 Port Avenue",
    city: "Douala",
    country: "Cameroon",
    phone: "+237 233 456 789",
    email: "douala@shiptrack.cm",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "agency-2",
    name: "ShipTrack Yaounde",
    code: "STY",
    address: "456 Central Street",
    city: "Yaounde",
    country: "Cameroon",
    phone: "+237 222 345 678",
    email: "yaounde@shiptrack.cm",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

const initialUsers: (User & { password: string })[] = [
  {
    id: "user-1",
    email: "admin@shiptrack.cm",
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
    phone: "+237 690 000 001",
    role: "super_admin" as Role,
    permissions: Object.values(RolePermissions["super_admin" as Role]),
    agencyId: "agency-1",
    agency: initialAgencies[0],
    isActive: true,
    emailVerified: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-2",
    email: "manager@shiptrack.cm",
    password: "manager123",
    firstName: "Jean",
    lastName: "Dupont",
    phone: "+237 690 000 002",
    role: "manager" as Role,
    permissions: Object.values(RolePermissions["manager" as Role]),
    agencyId: "agency-1",
    agency: initialAgencies[0],
    isActive: true,
    emailVerified: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-3",
    email: "agent@shiptrack.cm",
    password: "agent123",
    firstName: "Marie",
    lastName: "Kamga",
    phone: "+237 690 000 003",
    role: "agent" as Role,
    permissions: Object.values(RolePermissions["agent" as Role]),
    agencyId: "agency-2",
    agency: initialAgencies[1],
    isActive: true,
    emailVerified: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

const initialShipments: Shipment[] = [
  {
    id: "shipment-1",
    trackingNumber: "ST-2401ABC123",
    status: "in_transit" as ShipmentStatus,
    type: "air" as ShipmentType,
    packageType: "box" as PackageType,
    sender: {
      id: "sender-1",
      name: "Li Wei",
      phone: "+86 138 0000 0001",
      email: "liwei@example.cn",
      address: "123 Guangzhou Road",
      city: "Guangzhou",
      province: "Guangdong",
      country: "China",
    },
    receiver: {
      id: "receiver-1",
      name: "Paul Biya",
      phone: "+237 690 111 222",
      email: "paul@example.cm",
      address: "456 Independence Ave",
      city: "Douala",
      region: "Littoral",
      country: "Cameroon",
    },
    agencyId: "agency-1",
    createdById: "user-2",
    items: [
      {
        id: "item-1",
        description: "Electronics - Smartphones",
        quantity: 10,
        weight: 5,
        unitPrice: 150000,
        category: "Electronics",
      },
    ],
    dimensions: { length: 50, width: 40, height: 30 },
    totalWeight: 5,
    volumetricWeight: 10,
    chargeableWeight: 10,
    declaredValue: 1500000,
    shippingCost: 250000,
    insuranceCost: 15000,
    totalCost: 265000,
    pickupDate: "2024-12-20T10:00:00Z",
    estimatedDeliveryDate: "2025-01-05T18:00:00Z",
    createdAt: "2024-12-19T08:00:00Z",
    updatedAt: "2024-12-28T14:00:00Z",
    insuranceRequired: true,
    signatureRequired: true,
    fragile: true,
  },
  {
    id: "shipment-2",
    trackingNumber: "ST-2401DEF456",
    status: "delivered" as ShipmentStatus,
    type: "sea" as ShipmentType,
    packageType: "container" as PackageType,
    sender: {
      id: "sender-2",
      name: "Zhang Ming",
      phone: "+86 139 0000 0002",
      address: "789 Shanghai Port",
      city: "Shanghai",
      country: "China",
    },
    receiver: {
      id: "receiver-2",
      name: "Emmanuel Fotso",
      phone: "+237 677 333 444",
      address: "123 Commercial Zone",
      city: "Yaounde",
      region: "Centre",
      country: "Cameroon",
    },
    agencyId: "agency-2",
    createdById: "user-3",
    items: [
      {
        id: "item-2",
        description: "Textiles - Fabric Rolls",
        quantity: 100,
        weight: 500,
        unitPrice: 50000,
        category: "Textiles",
      },
    ],
    totalWeight: 500,
    declaredValue: 5000000,
    shippingCost: 800000,
    totalCost: 800000,
    pickupDate: "2024-11-01T08:00:00Z",
    estimatedDeliveryDate: "2024-12-15T18:00:00Z",
    actualDeliveryDate: "2024-12-14T16:30:00Z",
    createdAt: "2024-10-28T10:00:00Z",
    updatedAt: "2024-12-14T16:30:00Z",
    insuranceRequired: false,
    signatureRequired: true,
    fragile: false,
  },
  {
    id: "shipment-3",
    trackingNumber: "ST-2401GHI789",
    status: "customs_clearance" as ShipmentStatus,
    type: "air" as ShipmentType,
    packageType: "box" as PackageType,
    sender: {
      id: "sender-3",
      name: "Wang Fang",
      phone: "+86 137 0000 0003",
      address: "456 Shenzhen Tech Park",
      city: "Shenzhen",
      country: "China",
    },
    receiver: {
      id: "receiver-3",
      name: "Jeanne Nkeng",
      phone: "+237 655 555 666",
      address: "789 Business District",
      city: "Bafoussam",
      region: "West",
      country: "Cameroon",
    },
    agencyId: "agency-1",
    createdById: "user-2",
    items: [
      {
        id: "item-3",
        description: "Computer Parts - Motherboards",
        quantity: 50,
        weight: 25,
        unitPrice: 80000,
        category: "Electronics",
      },
    ],
    dimensions: { length: 60, width: 50, height: 40 },
    totalWeight: 25,
    volumetricWeight: 24,
    chargeableWeight: 25,
    declaredValue: 4000000,
    shippingCost: 350000,
    customsDuty: 120000,
    insuranceCost: 40000,
    totalCost: 510000,
    pickupDate: "2024-12-22T09:00:00Z",
    estimatedDeliveryDate: "2025-01-03T18:00:00Z",
    createdAt: "2024-12-21T14:00:00Z",
    updatedAt: "2024-12-29T10:00:00Z",
    insuranceRequired: true,
    signatureRequired: true,
    fragile: true,
  },
  {
    id: "shipment-4",
    trackingNumber: "ST-2401JKL012",
    status: "pending" as ShipmentStatus,
    type: "express" as ShipmentType,
    packageType: "envelope" as PackageType,
    sender: {
      id: "sender-4",
      name: "Chen Yu",
      phone: "+86 136 0000 0004",
      address: "321 Beijing Central",
      city: "Beijing",
      country: "China",
    },
    receiver: {
      id: "receiver-4",
      name: "Pierre Mbarga",
      phone: "+237 699 777 888",
      address: "456 Government Quarter",
      city: "Douala",
      region: "Littoral",
      country: "Cameroon",
    },
    agencyId: "agency-1",
    createdById: "user-2",
    items: [
      {
        id: "item-4",
        description: "Documents - Business Papers",
        quantity: 1,
        weight: 0.5,
        unitPrice: 50000,
        category: "Documents",
      },
    ],
    totalWeight: 0.5,
    declaredValue: 50000,
    shippingCost: 45000,
    totalCost: 45000,
    estimatedDeliveryDate: "2025-01-02T12:00:00Z",
    createdAt: "2024-12-30T08:00:00Z",
    updatedAt: "2024-12-30T08:00:00Z",
    insuranceRequired: false,
    signatureRequired: true,
    fragile: false,
  },
];

const initialTrackingEvents: TrackingEvent[] = [
  // Events for shipment-1
  {
    id: "event-1-1",
    shipmentId: "shipment-1",
    type: "status_change" as TrackingEventType,
    status: "pending" as ShipmentStatus,
    location: { city: "Guangzhou", country: "China", facility: "Origin Office" },
    description: "Shipment order created",
    timestamp: "2024-12-19T08:00:00Z",
    createdById: "user-2",
  },
  {
    id: "event-1-2",
    shipmentId: "shipment-1",
    type: "status_change" as TrackingEventType,
    status: "confirmed" as ShipmentStatus,
    location: { city: "Guangzhou", country: "China", facility: "Origin Office" },
    description: "Shipment confirmed and scheduled for pickup",
    timestamp: "2024-12-19T10:00:00Z",
    createdById: "user-2",
  },
  {
    id: "event-1-3",
    shipmentId: "shipment-1",
    type: "status_change" as TrackingEventType,
    status: "picked_up" as ShipmentStatus,
    location: { city: "Guangzhou", country: "China" },
    description: "Package picked up from sender",
    timestamp: "2024-12-20T10:00:00Z",
    createdById: "user-2",
  },
  {
    id: "event-1-4",
    shipmentId: "shipment-1",
    type: "status_change" as TrackingEventType,
    status: "in_warehouse_china" as ShipmentStatus,
    location: { city: "Guangzhou", country: "China", facility: "Main Warehouse" },
    description: "Package received at China warehouse",
    timestamp: "2024-12-21T14:00:00Z",
    createdById: "user-2",
  },
  {
    id: "event-1-5",
    shipmentId: "shipment-1",
    type: "status_change" as TrackingEventType,
    status: "in_transit" as ShipmentStatus,
    location: { city: "Guangzhou", country: "China", facility: "Airport" },
    description: "Package departed - In transit to Cameroon",
    timestamp: "2024-12-25T06:00:00Z",
    createdById: "user-2",
  },
];

const initialInvoices: Invoice[] = [
  {
    id: "invoice-1",
    invoiceNumber: "INV-2024-0001",
    status: "paid" as InvoiceStatus,
    customerId: "receiver-2",
    customerName: "Emmanuel Fotso",
    customerPhone: "+237 677 333 444",
    customerAddress: "123 Commercial Zone, Yaounde",
    agencyId: "agency-2",
    lineItems: [
      {
        id: "line-1",
        description: "Sea Freight - Container Shipping",
        quantity: 1,
        unitPrice: 800000,
        amount: 800000,
        shipmentId: "shipment-2",
      },
    ],
    subtotal: 800000,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 800000,
    amountPaid: 800000,
    amountDue: 0,
    issueDate: "2024-10-28T10:00:00Z",
    dueDate: "2024-11-28T10:00:00Z",
    paidDate: "2024-11-15T14:00:00Z",
    createdAt: "2024-10-28T10:00:00Z",
    updatedAt: "2024-11-15T14:00:00Z",
  },
  {
    id: "invoice-2",
    invoiceNumber: "INV-2024-0002",
    status: "pending" as InvoiceStatus,
    customerId: "receiver-1",
    customerName: "Paul Biya",
    customerPhone: "+237 690 111 222",
    customerAddress: "456 Independence Ave, Douala",
    agencyId: "agency-1",
    lineItems: [
      {
        id: "line-2",
        description: "Air Freight - Electronics",
        quantity: 1,
        unitPrice: 250000,
        amount: 250000,
        shipmentId: "shipment-1",
      },
      {
        id: "line-3",
        description: "Insurance",
        quantity: 1,
        unitPrice: 15000,
        amount: 15000,
        shipmentId: "shipment-1",
      },
    ],
    subtotal: 265000,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 265000,
    amountPaid: 0,
    amountDue: 265000,
    issueDate: "2024-12-19T08:00:00Z",
    dueDate: "2025-01-19T08:00:00Z",
    createdAt: "2024-12-19T08:00:00Z",
    updatedAt: "2024-12-19T08:00:00Z",
  },
];

const initialPayments: Payment[] = [
  {
    id: "payment-1",
    invoiceId: "invoice-1",
    amount: 800000,
    method: "mobile_money" as PaymentMethod,
    status: "completed" as PaymentStatus,
    transactionId: "MTN-2024-123456",
    mobileMoneyProvider: "mtn",
    mobileMoneyNumber: "+237 677 333 444",
    paymentDate: "2024-11-15T14:00:00Z",
    createdAt: "2024-11-15T14:00:00Z",
    updatedAt: "2024-11-15T14:00:00Z",
  },
];

const initialTariffs: Tariff[] = [
  {
    id: "tariff-1",
    name: "Fret Aérien Chine-Cameroun",
    description: "Tarif standard pour le fret aérien depuis la Chine",
    pricePerKg: 15000,
    minimumCharge: 50000,
    volumetricDivisor: 5000,
    shipmentType: "air",
    originCountry: "Chine",
    destinationCountry: "Cameroun",
    effectiveFrom: "2024-01-01T00:00:00Z",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "tariff-2",
    name: "Fret Maritime Chine-Cameroun",
    description: "Tarif standard pour le fret maritime depuis la Chine",
    pricePerKg: 8000,
    minimumCharge: 30000,
    volumetricDivisor: 5000,
    shipmentType: "sea",
    originCountry: "Chine",
    destinationCountry: "Cameroun",
    effectiveFrom: "2024-01-01T00:00:00Z",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "tariff-3",
    name: "Fret Aérien Dubaï-Cameroun",
    description: "Tarif standard pour le fret aérien depuis Dubaï",
    pricePerKg: 12000,
    minimumCharge: 40000,
    volumetricDivisor: 5000,
    shipmentType: "air",
    originCountry: "Émirats Arabes Unis",
    destinationCountry: "Cameroun",
    effectiveFrom: "2024-01-01T00:00:00Z",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "tariff-4",
    name: "Express International",
    description: "Service express avec livraison rapide garantie",
    pricePerKg: 25000,
    minimumCharge: 75000,
    volumetricDivisor: 5000,
    shipmentType: "express",
    originCountry: "International",
    destinationCountry: "Cameroun",
    effectiveFrom: "2024-01-01T00:00:00Z",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

// ============================================
// STORE INTERFACE
// ============================================

interface MockDataState {
  // Data
  users: (User & { password: string })[];
  agencies: Agency[];
  shipments: Shipment[];
  trackingEvents: TrackingEvent[];
  invoices: Invoice[];
  payments: Payment[];
  tariffs: Tariff[];

  // Auth state
  currentUser: User | null;
  accessToken: string | null;
  refreshToken: string | null;

  // Auth actions
  login: (email: string, password: string) => { user: User; accessToken: string; refreshToken: string } | null;
  logout: () => void;
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => { user: User; accessToken: string; refreshToken: string } | null;

  // User actions
  getCurrentUser: () => User | null;
  updateProfile: (data: Partial<Pick<User, "firstName" | "lastName" | "phone">>) => User | null;

  // Shipment actions
  getShipments: (params?: { page?: number; pageSize?: number; status?: string; search?: string }) => { data: Shipment[]; total: number; page: number; pageSize: number; totalPages: number };
  getShipment: (id: string) => Shipment | null;
  getShipmentByTrackingNumber: (trackingNumber: string) => Shipment | null;
  createShipment: (data: CreateShipmentData) => Shipment;
  updateShipment: (id: string, data: UpdateShipmentData) => Shipment | null;
  deleteShipment: (id: string) => boolean;

  // Tracking actions
  getTracking: (trackingNumber: string) => TrackingSummary | null;
  addTrackingEvent: (data: CreateTrackingEventData) => TrackingSummary | null;

  // Invoice actions
  getInvoices: (params?: { page?: number; pageSize?: number; status?: string }) => { data: Invoice[]; total: number; page: number; pageSize: number; totalPages: number };
  getInvoice: (id: string) => Invoice | null;
  createInvoice: (data: CreateInvoiceData) => Invoice;

  // Payment actions
  createPayment: (data: CreatePaymentData) => Payment;

  // Tariff actions
  getTariffs: () => Tariff[];
  createTariff: (data: CreateTariffData) => Tariff;
  updateTariff: (id: string, data: Partial<CreateTariffData & { isActive: boolean }>) => Tariff | null;
  deleteTariff: (id: string) => boolean;

  // Statistics
  getStatistics: () => { total: number; pending: number; inTransit: number; delivered: number; revenue: number };

  // Reset to initial data
  resetData: () => void;
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useMockDataStore = create<MockDataState>()(
  persist(
    (set, get) => ({
      // Initial data
      users: initialUsers,
      agencies: initialAgencies,
      shipments: initialShipments,
      trackingEvents: initialTrackingEvents,
      invoices: initialInvoices,
      payments: initialPayments,
      tariffs: initialTariffs,
      currentUser: null,
      accessToken: null,
      refreshToken: null,

      // Auth actions
      login: (email, password) => {
        const user = get().users.find(
          (u) => u.email === email && u.password === password && u.isActive
        );
        if (!user) return null;

        const { password: _, ...userWithoutPassword } = user;
        const accessToken = `mock-access-${generateId()}`;
        const refreshToken = `mock-refresh-${generateId()}`;

        set({ currentUser: userWithoutPassword, accessToken, refreshToken });
        return { user: userWithoutPassword, accessToken, refreshToken };
      },

      logout: () => {
        set({ currentUser: null, accessToken: null, refreshToken: null });
      },

      register: (data) => {
        const existingUser = get().users.find((u) => u.email === data.email);
        if (existingUser) return null;

        const newUser: User & { password: string } = {
          id: `user-${generateId()}`,
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: "customer" as Role,
          permissions: RolePermissions["customer" as Role],
          isActive: true,
          emailVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({ users: [...state.users, newUser] }));

        const { password: _, ...userWithoutPassword } = newUser;
        const accessToken = `mock-access-${generateId()}`;
        const refreshToken = `mock-refresh-${generateId()}`;

        set({ currentUser: userWithoutPassword, accessToken, refreshToken });
        return { user: userWithoutPassword, accessToken, refreshToken };
      },

      getCurrentUser: () => get().currentUser,

      updateProfile: (data) => {
        const currentUser = get().currentUser;
        if (!currentUser) return null;

        const updatedUser = {
          ...currentUser,
          ...data,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          currentUser: updatedUser,
          users: state.users.map((u) =>
            u.id === currentUser.id ? { ...u, ...data, updatedAt: new Date().toISOString() } : u
          ),
        }));

        return updatedUser;
      },

      // Shipment actions
      getShipments: (params = {}) => {
        const { page = 1, pageSize = 10, status, search } = params;
        let filtered = [...get().shipments];

        if (status) {
          filtered = filtered.filter((s) => s.status === status);
        }

        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter(
            (s) =>
              s.trackingNumber.toLowerCase().includes(searchLower) ||
              s.receiver.name.toLowerCase().includes(searchLower) ||
              s.sender.name.toLowerCase().includes(searchLower)
          );
        }

        // Sort by createdAt descending
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const total = filtered.length;
        const totalPages = Math.ceil(total / pageSize);
        const start = (page - 1) * pageSize;
        const data = filtered.slice(start, start + pageSize);

        return { data, total, page, pageSize, totalPages };
      },

      getShipment: (id) => get().shipments.find((s) => s.id === id) || null,

      getShipmentByTrackingNumber: (trackingNumber) =>
        get().shipments.find((s) => s.trackingNumber === trackingNumber) || null,

      createShipment: (data) => {
        const currentUser = get().currentUser;
        const newShipment: Shipment = {
          id: `shipment-${generateId()}`,
          trackingNumber: generateTrackingNumber(),
          status: "pending" as ShipmentStatus,
          type: data.type,
          packageType: data.packageType,
          sender: { id: `sender-${generateId()}`, ...data.sender },
          receiver: { id: `receiver-${generateId()}`, ...data.receiver },
          agencyId: currentUser?.agencyId || "agency-1",
          createdById: currentUser?.id || "user-1",
          items: data.items.map((item) => ({ id: `item-${generateId()}`, ...item })),
          dimensions: data.dimensions,
          totalWeight: data.totalWeight,
          declaredValue: data.declaredValue,
          shippingCost: Math.round(data.totalWeight * 15000), // Simple calculation
          insuranceCost: data.insuranceRequired ? Math.round(data.declaredValue * 0.01) : 0,
          totalCost: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          insuranceRequired: data.insuranceRequired || false,
          signatureRequired: data.signatureRequired || false,
          fragile: data.fragile || false,
          notes: data.notes,
          specialInstructions: data.specialInstructions,
        };

        newShipment.totalCost = newShipment.shippingCost + (newShipment.insuranceCost || 0);

        // Add initial tracking event
        const initialEvent: TrackingEvent = {
          id: `event-${generateId()}`,
          shipmentId: newShipment.id,
          type: "status_change" as TrackingEventType,
          status: "pending" as ShipmentStatus,
          location: { city: data.sender.city, country: data.sender.country },
          description: "Shipment order created",
          timestamp: new Date().toISOString(),
          createdById: currentUser?.id,
        };

        set((state) => ({
          shipments: [...state.shipments, newShipment],
          trackingEvents: [...state.trackingEvents, initialEvent],
        }));

        return newShipment;
      },

      updateShipment: (id, data) => {
        const shipment = get().shipments.find((s) => s.id === id);
        if (!shipment) return null;

        const updatedShipment: Shipment = {
          ...shipment,
          status: data.status ?? shipment.status,
          receiver: data.receiver ? { ...shipment.receiver, ...data.receiver } : shipment.receiver,
          notes: data.notes ?? shipment.notes,
          specialInstructions: data.specialInstructions ?? shipment.specialInstructions,
          estimatedDeliveryDate: data.estimatedDeliveryDate ?? shipment.estimatedDeliveryDate,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          shipments: state.shipments.map((s) => (s.id === id ? updatedShipment : s)),
        }));

        return updatedShipment;
      },

      deleteShipment: (id) => {
        const shipment = get().shipments.find((s) => s.id === id);
        if (!shipment) return false;

        set((state) => ({
          shipments: state.shipments.filter((s) => s.id !== id),
          trackingEvents: state.trackingEvents.filter((e) => e.shipmentId !== id),
        }));

        return true;
      },

      // Tracking actions
      getTracking: (trackingNumber) => {
        const shipment = get().shipments.find((s) => s.trackingNumber === trackingNumber);
        if (!shipment) return null;

        const events = get()
          .trackingEvents.filter((e) => e.shipmentId === shipment.id)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return {
          trackingNumber: shipment.trackingNumber,
          currentStatus: shipment.status,
          currentLocation: events[0]?.location || { city: "Unknown", country: "Unknown" },
          origin: { city: shipment.sender.city, country: shipment.sender.country },
          destination: { city: shipment.receiver.city, country: shipment.receiver.country },
          estimatedDelivery: shipment.estimatedDeliveryDate,
          lastUpdate: events[0]?.timestamp || shipment.updatedAt,
          events,
        };
      },

      addTrackingEvent: (data) => {
        const shipment = get().shipments.find((s) => s.id === data.shipmentId);
        if (!shipment) return null;

        const currentUser = get().currentUser;
        const newEvent: TrackingEvent = {
          id: `event-${generateId()}`,
          shipmentId: data.shipmentId,
          type: data.type,
          status: data.status,
          location: data.location,
          description: data.description,
          timestamp: new Date().toISOString(),
          createdById: currentUser?.id,
          metadata: data.metadata,
        };

        // Update shipment status
        const updatedShipment = {
          ...shipment,
          status: data.status,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          trackingEvents: [...state.trackingEvents, newEvent],
          shipments: state.shipments.map((s) => (s.id === data.shipmentId ? updatedShipment : s)),
        }));

        return get().getTracking(shipment.trackingNumber);
      },

      // Invoice actions
      getInvoices: (params = {}) => {
        const { page = 1, pageSize = 10, status } = params;
        let filtered = [...get().invoices];

        if (status) {
          filtered = filtered.filter((i) => i.status === status);
        }

        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const total = filtered.length;
        const totalPages = Math.ceil(total / pageSize);
        const start = (page - 1) * pageSize;
        const data = filtered.slice(start, start + pageSize);

        return { data, total, page, pageSize, totalPages };
      },

      getInvoice: (id) => get().invoices.find((i) => i.id === id) || null,

      createInvoice: (data) => {
        const currentUser = get().currentUser;
        const lineItems = data.lineItems.map((item) => ({
          id: `line-${generateId()}`,
          ...item,
          amount: item.quantity * item.unitPrice,
        }));

        const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
        const discount = data.discount || 0;
        const totalAmount = subtotal - discount;

        const newInvoice: Invoice = {
          id: `invoice-${generateId()}`,
          invoiceNumber: generateInvoiceNumber(),
          status: "pending" as InvoiceStatus,
          customerId: data.customerId,
          customerName: "", // Would be filled from customer lookup
          agencyId: currentUser?.agencyId || "agency-1",
          lineItems,
          subtotal,
          taxRate: 0,
          taxAmount: 0,
          discount,
          totalAmount,
          amountPaid: 0,
          amountDue: totalAmount,
          issueDate: new Date().toISOString(),
          dueDate: data.dueDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: data.notes,
          terms: data.terms,
        };

        set((state) => ({ invoices: [...state.invoices, newInvoice] }));
        return newInvoice;
      },

      // Payment actions
      createPayment: (data) => {
        const invoice = get().invoices.find((i) => i.id === data.invoiceId);
        const newPayment: Payment = {
          id: `payment-${generateId()}`,
          invoiceId: data.invoiceId,
          amount: data.amount,
          method: data.method,
          status: "completed" as PaymentStatus,
          reference: data.reference,
          mobileMoneyProvider: data.mobileMoneyProvider,
          mobileMoneyNumber: data.mobileMoneyNumber,
          paymentDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: data.notes,
        };

        // Update invoice
        if (invoice) {
          const newAmountPaid = invoice.amountPaid + data.amount;
          const newAmountDue = invoice.totalAmount - newAmountPaid;
          const newStatus: InvoiceStatus =
            newAmountDue <= 0
              ? "paid"
              : newAmountPaid > 0
                ? "partially_paid"
                : invoice.status;

          set((state) => ({
            payments: [...state.payments, newPayment],
            invoices: state.invoices.map((i) =>
              i.id === data.invoiceId
                ? {
                    ...i,
                    amountPaid: newAmountPaid,
                    amountDue: newAmountDue,
                    status: newStatus,
                    paidDate: newStatus === "paid" ? new Date().toISOString() : i.paidDate,
                    updatedAt: new Date().toISOString(),
                  }
                : i
            ),
          }));
        } else {
          set((state) => ({ payments: [...state.payments, newPayment] }));
        }

        return newPayment;
      },

      // Tariff actions
      getTariffs: () => get().tariffs,

      createTariff: (data) => {
        const newTariff: Tariff = {
          id: `tariff-${generateId()}`,
          name: data.name,
          description: data.description,
          pricePerKg: data.pricePerKg,
          minimumCharge: data.minimumCharge,
          volumetricDivisor: data.volumetricDivisor || 5000,
          shipmentType: data.shipmentType,
          originCountry: data.originCountry,
          destinationCountry: data.destinationCountry,
          effectiveFrom: data.effectiveFrom || new Date().toISOString(),
          effectiveTo: data.effectiveTo,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({ tariffs: [...state.tariffs, newTariff] }));
        return newTariff;
      },

      updateTariff: (id, data) => {
        const tariff = get().tariffs.find((t) => t.id === id);
        if (!tariff) return null;

        const updatedTariff: Tariff = {
          ...tariff,
          ...data,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          tariffs: state.tariffs.map((t) => (t.id === id ? updatedTariff : t)),
        }));

        return updatedTariff;
      },

      deleteTariff: (id) => {
        const tariff = get().tariffs.find((t) => t.id === id);
        if (!tariff) return false;

        set((state) => ({
          tariffs: state.tariffs.filter((t) => t.id !== id),
        }));

        return true;
      },

      // Statistics
      getStatistics: () => {
        const shipments = get().shipments;
        const invoices = get().invoices;

        return {
          total: shipments.length,
          pending: shipments.filter((s) => s.status === "pending" || s.status === "confirmed").length,
          inTransit: shipments.filter(
            (s) =>
              s.status === "picked_up" ||
              s.status === "in_warehouse_china" ||
              s.status === "in_transit" ||
              s.status === "customs_clearance" ||
              s.status === "in_warehouse_cameroon" ||
              s.status === "out_for_delivery"
          ).length,
          delivered: shipments.filter((s) => s.status === "delivered").length,
          revenue: invoices
            .filter((i) => i.status === "paid")
            .reduce((sum, i) => sum + i.totalAmount, 0),
        };
      },

      // Reset data
      resetData: () => {
        set({
          users: initialUsers,
          agencies: initialAgencies,
          shipments: initialShipments,
          trackingEvents: initialTrackingEvents,
          invoices: initialInvoices,
          payments: initialPayments,
          tariffs: initialTariffs,
          currentUser: null,
          accessToken: null,
          refreshToken: null,
        });
      },
    }),
    {
      name: "shiptrack-mock-data",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
