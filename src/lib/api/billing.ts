import apiClient, { handleApiError } from "./client";
import type { Shipment } from "@/types/shipment.types";
import {
  toFrontendShipment,
  toBackendCalculateCostDto,
  toFrontendCostResponse,
  type BackendCostResponse,
  type BackendInvoice,
  type BackendPayment,
  type BackendTariffRule,
  type BackendInvoiceStats,
  type BackendPaymentStats,
  type BackendRevenueReport,
  type BackendOutstandingPayments,
  type BackendPaymentMethodBreakdown,
  type BackendCreateInvoiceDto,
  type BackendUpdateInvoiceDto,
  type BackendCreatePaymentDto,
  type BackendCreateTariffRuleDto,
  type BackendUpdateTariffRuleDto,
  type BackendQueryInvoicesDto,
} from "./adapters";

// Types for billing entities
export interface Invoice {
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
  items: InvoiceItem[];
  taxes?: number;
  discounts?: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate?: number;
}

export interface Payment {
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

export interface TariffRule {
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

export interface CostCalculation {
  shippingCost: number;
  insuranceCost: number;
  estimatedDays: number;
}

export interface InvoiceStats {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
}

export interface PaymentStats {
  totalPayments: number;
  successfulPayments: number;
  pendingPayments: number;
  totalAmount: number;
}

export interface RevenueReport {
  period: {
    startDate: string;
    endDate: string;
  };
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface OutstandingPayment {
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  percentage: number;
  totalAmount: number;
}

export interface QueryInvoicesParams {
  clientId?: string;
  shipmentId?: string;
  status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export const billingApi = {
  // ============================================================================
  // COST CALCULATION
  // ============================================================================

  /**
   * Calculate shipping cost based on route, weight, and other factors
   * Backend: POST /billing/calculate
   */
  calculateShippingCost: async (data: {
    origin: string;
    destination: string;
    weight: number;
    volume?: number;
    declaredValue: number;
  }): Promise<CostCalculation> => {
    try {
      const backendData = toBackendCalculateCostDto({
        type: "air", // Default type
        weight: data.weight,
        dimensions: data.volume ? { length: 0, width: 0, height: 0 } : undefined,
        declaredValue: data.declaredValue,
        origin: data.origin,
        destination: data.destination,
      });

      const response = await apiClient.post<BackendCostResponse>(
        "/billing/calculate",
        backendData
      );

      return toFrontendCostResponse(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ============================================================================
  // INVOICE ENDPOINTS
  // ============================================================================

  /**
   * Create new invoice
   * Backend: POST /billing/invoices
   */
  createInvoice: async (data: {
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
  }): Promise<Invoice> => {
    try {
      const backendData: BackendCreateInvoiceDto = {
        shipmentId: data.shipmentId,
        clientId: data.clientId,
        description: data.description,
        items: data.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
        })),
        taxes: data.taxes,
        discounts: data.discounts,
        dueDate: data.dueDate,
      };

      const response = await apiClient.post<BackendInvoice>("/billing/invoices", backendData);
      return response.data as Invoice; // TODO: Add proper transformation
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get all invoices with optional filters
   * Backend: GET /billing/invoices
   */
  getInvoices: async (params?: QueryInvoicesParams): Promise<Invoice[]> => {
    try {
      const queryParams: BackendQueryInvoicesDto = {};
      if (params?.clientId) queryParams.clientId = params.clientId;
      if (params?.shipmentId) queryParams.shipmentId = params.shipmentId;
      if (params?.status) queryParams.status = params.status;
      if (params?.dateFrom) queryParams.dateFrom = params.dateFrom;
      if (params?.dateTo) queryParams.dateTo = params.dateTo;

      const response = await apiClient.get<BackendInvoice[]>("/billing/invoices", {
        params: queryParams,
      });

      return response.data as Invoice[]; // TODO: Add proper transformation
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get invoice by ID
   * Backend: GET /billing/invoices/:id
   */
  getInvoice: async (id: string): Promise<Invoice> => {
    try {
      const response = await apiClient.get<BackendInvoice>(`/billing/invoices/${id}`);
      return response.data as Invoice; // TODO: Add proper transformation
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get invoice by invoice number
   * Backend: GET /billing/invoices/number/:invoiceNumber
   */
  getInvoiceByNumber: async (invoiceNumber: string): Promise<Invoice> => {
    try {
      const response = await apiClient.get<BackendInvoice>(`/billing/invoices/number/${invoiceNumber}`);
      return response.data as Invoice; // TODO: Add proper transformation
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update invoice
   * Backend: PATCH /billing/invoices/:id
   */
  updateInvoice: async (
    id: string,
    data: Partial<{
      status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
      description: string;
      dueDate: string;
    }>
  ): Promise<Invoice> => {
    try {
      const backendData: BackendUpdateInvoiceDto = {};
      if (data.status !== undefined) backendData.status = data.status;
      if (data.description !== undefined) backendData.description = data.description;
      if (data.dueDate !== undefined) backendData.dueDate = data.dueDate;

      const response = await apiClient.patch<BackendInvoice>(`/billing/invoices/${id}`, backendData);
      return response.data as Invoice; // TODO: Add proper transformation
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cancel invoice
   * Backend: POST /billing/invoices/:id/cancel
   */
  cancelInvoice: async (id: string): Promise<Invoice> => {
    try {
      const response = await apiClient.post<BackendInvoice>(`/billing/invoices/${id}/cancel`);
      return response.data as Invoice; // TODO: Add proper transformation
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete invoice (admin only)
   * Backend: DELETE /billing/invoices/:id
   */
  deleteInvoice: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/billing/invoices/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get invoice statistics
   * Backend: GET /billing/invoices/stats
   */
  getInvoiceStats: async (): Promise<InvoiceStats> => {
    try {
      const response = await apiClient.get<BackendInvoiceStats>("/billing/invoices/stats");
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ============================================================================
  // PAYMENT ENDPOINTS
  // ============================================================================

  /**
   * Add payment to invoice
   * Backend: POST /billing/payments
   */
  addPayment: async (data: {
    invoiceId: string;
    amount: number;
    method: "cash" | "bank_transfer" | "credit_card" | "mobile_money" | "cheque";
    transactionId?: string;
    reference?: string;
    notes?: string;
  }): Promise<Payment> => {
    try {
      const backendData: BackendCreatePaymentDto = {
        invoiceId: data.invoiceId,
        amount: data.amount,
        method: data.method,
        transactionId: data.transactionId,
        reference: data.reference,
        notes: data.notes,
      };

      const response = await apiClient.post<BackendPayment>("/billing/payments", backendData);
      return response.data as Payment; // TODO: Add proper transformation
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get all payments with optional filters
   * Backend: GET /billing/payments
   */
  getPayments: async (filters?: {
    invoiceId?: string;
    method?: string;
  }): Promise<Payment[]> => {
    try {
      const params: Record<string, unknown> = {};
      if (filters?.invoiceId) params.invoiceId = filters.invoiceId;
      if (filters?.method) params.method = filters.method;

      const response = await apiClient.get<BackendPayment[]>("/billing/payments", { params });
      return response.data as Payment[]; // TODO: Add proper transformation
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get payment by ID
   * Backend: GET /billing/payments/:id
   */
  getPayment: async (id: string): Promise<Payment> => {
    try {
      const response = await apiClient.get<BackendPayment>(`/billing/payments/${id}`);
      return response.data as Payment; // TODO: Add proper transformation
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete payment (admin only)
   * Backend: DELETE /billing/payments/:id
   */
  deletePayment: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/billing/payments/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get payment statistics
   * Backend: GET /billing/payments/stats
   */
  getPaymentStats: async (): Promise<PaymentStats> => {
    try {
      const response = await apiClient.get<BackendPaymentStats>("/billing/payments/stats");
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ============================================================================
  // TARIFF RULES ENDPOINTS
  // ============================================================================

  /**
   * Create tariff rule
   * Backend: POST /billing/tariffs
   */
  createTariffRule: async (data: {
    origin: string;
    destination: string;
    baseRate: number;
    ratePerKg: number;
    ratePerVolume: number;
    minCharge: number;
    maxCharge?: number;
    currency: string;
    description?: string;
  }): Promise<TariffRule> => {
    try {
      const backendData: BackendCreateTariffRuleDto = {
        origin: data.origin,
        destination: data.destination,
        baseRate: data.baseRate,
        ratePerKg: data.ratePerKg,
        ratePerVolume: data.ratePerVolume,
        minCharge: data.minCharge,
        maxCharge: data.maxCharge,
        currency: data.currency,
        description: data.description,
      };

      const response = await apiClient.post<BackendTariffRule>("/billing/tariffs", backendData);
      return response.data as TariffRule; // TODO: Add proper transformation
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get all tariff rules with optional filters
   * Backend: GET /billing/tariffs
   */
  getTariffRules: async (filters?: {
    origin?: string;
    destination?: string;
    isActive?: boolean;
  }): Promise<TariffRule[]> => {
    try {
      const params: Record<string, unknown> = {};
      if (filters?.origin) params.origin = filters.origin;
      if (filters?.destination) params.destination = filters.destination;
      if (filters?.isActive !== undefined) params.isActive = filters.isActive;

      const response = await apiClient.get<BackendTariffRule[]>("/billing/tariffs", { params });
      return response.data as TariffRule[]; // TODO: Add proper transformation
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get tariff rule by ID
   * Backend: GET /billing/tariffs/:id
   */
  getTariffRule: async (id: string): Promise<TariffRule> => {
    try {
      const response = await apiClient.get<BackendTariffRule>(`/billing/tariffs/${id}`);
      return response.data as TariffRule; // TODO: Add proper transformation
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update tariff rule
   * Backend: PATCH /billing/tariffs/:id
   */
  updateTariffRule: async (
    id: string,
    data: Partial<{
      origin: string;
      destination: string;
      baseRate: number;
      ratePerKg: number;
      ratePerVolume: number;
      minCharge: number;
      maxCharge?: number;
      currency: string;
      description?: string;
      isActive: boolean;
    }>
  ): Promise<TariffRule> => {
    try {
      const backendData: BackendUpdateTariffRuleDto = {};
      if (data.origin !== undefined) backendData.origin = data.origin;
      if (data.destination !== undefined) backendData.destination = data.destination;
      if (data.baseRate !== undefined) backendData.baseRate = data.baseRate;
      if (data.ratePerKg !== undefined) backendData.ratePerKg = data.ratePerKg;
      if (data.ratePerVolume !== undefined) backendData.ratePerVolume = data.ratePerVolume;
      if (data.minCharge !== undefined) backendData.minCharge = data.minCharge;
      if (data.maxCharge !== undefined) backendData.maxCharge = data.maxCharge;
      if (data.currency !== undefined) backendData.currency = data.currency;
      if (data.description !== undefined) backendData.description = data.description;
      if (data.isActive !== undefined) backendData.isActive = data.isActive;

      const response = await apiClient.patch<BackendTariffRule>(`/billing/tariffs/${id}`, backendData);
      return response.data as TariffRule; // TODO: Add proper transformation
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete tariff rule (admin only)
   * Backend: DELETE /billing/tariffs/:id
   */
  deleteTariffRule: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/billing/tariffs/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ============================================================================
  // REPORTING ENDPOINTS
  // ============================================================================

  /**
   * Get revenue report
   * Backend: GET /billing/reports/revenue
   */
  getRevenueReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<RevenueReport[]> => {
    try {
      const params: Record<string, unknown> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get<RevenueReport[]>("/billing/reports/revenue", { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get outstanding payments report
   * Backend: GET /billing/reports/outstanding
   */
  getOutstandingPayments: async (): Promise<OutstandingPayment[]> => {
    try {
      const response = await apiClient.get<BackendOutstandingPayments[]>("/billing/reports/outstanding");
      return response.data as OutstandingPayment[]; // TODO: Add proper transformation
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get payment methods breakdown
   * Backend: GET /billing/reports/payment-methods
   */
  getPaymentMethodsBreakdown: async (): Promise<PaymentMethodBreakdown[]> => {
    try {
      const response = await apiClient.get<BackendPaymentMethodBreakdown[]>("/billing/reports/payment-methods");
      return response.data as PaymentMethodBreakdown[]; // TODO: Add proper transformation
    } catch (error) {
      return handleApiError(error);
    }
  },
};