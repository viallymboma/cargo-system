// Simple test to verify our revenue data type changes
import type { RevenueData } from './src/lib/api/reports';

// Test that the type has the expected structure
const testRevenueData: RevenueData = {
  period: {
    startDate: "2025-12-17T16:35:51.697Z",
    endDate: "2026-01-16T16:35:51.697Z"
  },
  totalInvoices: 0,
  totalAmount: 0,
  paidAmount: 0,
  pendingAmount: 0
};

console.log("Revenue data type test passed!");
console.log(testRevenueData);