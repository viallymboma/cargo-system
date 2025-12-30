// Invoice status
export type InvoiceStatus =
  | "draft"
  | "pending"
  | "sent"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled"
  | "refunded";

// Payment method
export type PaymentMethod =
  | "cash"
  | "mobile_money"
  | "bank_transfer"
  | "card"
  | "other";

// Payment status
export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

// Mobile money provider
export type MobileMoneyProvider = "mtn" | "orange";

// Invoice line item
export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number; // in XAF
  amount: number; // in XAF
  shipmentId?: string;
}

// Invoice
export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;

  // Customer info
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;

  // Agency info
  agencyId: string;

  // Line items
  lineItems: InvoiceLineItem[];

  // Amounts
  subtotal: number; // in XAF
  taxRate: number; // percentage
  taxAmount: number; // in XAF
  discount?: number; // in XAF
  totalAmount: number; // in XAF
  amountPaid: number; // in XAF
  amountDue: number; // in XAF

  // Dates
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  createdAt: string;
  updatedAt: string;

  // Notes
  notes?: string;
  terms?: string;
}

// Payment
export interface Payment {
  id: string;
  invoiceId: string;
  amount: number; // in XAF
  method: PaymentMethod;
  status: PaymentStatus;

  // Payment details
  transactionId?: string;
  reference?: string;
  mobileMoneyProvider?: MobileMoneyProvider;
  mobileMoneyNumber?: string;

  // Dates
  paymentDate: string;
  createdAt: string;
  updatedAt: string;

  // Notes
  notes?: string;
}

// Tariff (pricing)
export interface Tariff {
  id: string;
  name: string;
  description?: string;

  // Pricing
  pricePerKg: number; // in XAF
  minimumCharge: number; // in XAF
  volumetricDivisor: number; // typically 5000 or 6000

  // Applicable to
  shipmentType: string; // air, sea, express
  originCountry: string;
  destinationCountry: string;

  // Validity
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

// Create tariff data
export interface CreateTariffData {
  name: string;
  description?: string;
  pricePerKg: number;
  minimumCharge: number;
  volumetricDivisor?: number;
  shipmentType: string;
  originCountry: string;
  destinationCountry: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}

// Create invoice data
export interface CreateInvoiceData {
  customerId: string;
  lineItems: Omit<InvoiceLineItem, "id">[];
  dueDate: string;
  notes?: string;
  terms?: string;
  discount?: number;
}

// Create payment data
export interface CreatePaymentData {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  mobileMoneyProvider?: MobileMoneyProvider;
  mobileMoneyNumber?: string;
  notes?: string;
}

// Invoice filters
export interface InvoiceFilters {
  status?: InvoiceStatus | InvoiceStatus[];
  customerId?: string;
  agencyId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Invoice list params
export interface InvoiceListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: InvoiceFilters;
}

// Invoice status labels
export const InvoiceStatusLabels: Record<InvoiceStatus, string> = {
  draft: "Draft",
  pending: "Pending",
  sent: "Sent",
  partially_paid: "Partially Paid",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

// Invoice status colors
export const InvoiceStatusColors: Record<InvoiceStatus, string> = {
  draft: "gray",
  pending: "yellow",
  sent: "blue",
  partially_paid: "orange",
  paid: "green",
  overdue: "red",
  cancelled: "gray",
  refunded: "purple",
};
