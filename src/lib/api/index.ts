import { config } from "@/lib/config";

// Export utilities (always from real client)
export { default as apiClient, tokenManager, ApiError, handleApiError } from "./client";

// Dynamically select API implementations based on config
// Using functions to ensure lazy evaluation and proper switching

let _authApi: typeof import("./auth").authApi | typeof import("./mock/auth.mock").mockAuthApi;
let _shipmentsApi: typeof import("./shipments").shipmentsApi | typeof import("./mock/shipments.mock").mockShipmentsApi;

if (config.USE_MOCK_API) {
  // Mock API - no backend required
  const { mockAuthApi } = require("./mock/auth.mock");
  const { mockShipmentsApi } = require("./mock/shipments.mock");
  _authApi = mockAuthApi;
  _shipmentsApi = mockShipmentsApi;
} else {
  // Real API - requires backend
  const { authApi: realAuthApi } = require("./auth");
  const { shipmentsApi: realShipmentsApi } = require("./shipments");
  _authApi = realAuthApi;
  _shipmentsApi = realShipmentsApi;
}

/**
 * Auth API - Switches between real and mock based on config.USE_MOCK_API
 */
export const authApi = _authApi;

/**
 * Shipments API - Switches between real and mock based on config.USE_MOCK_API
 */
export const shipmentsApi = _shipmentsApi;

// Log which mode is active (only in development)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log(
    `%c[ShipTrack] API Mode: ${config.USE_MOCK_API ? "MOCK (Simulated)" : "REAL (Backend)"}`,
    `color: ${config.USE_MOCK_API ? "#f59e0b" : "#10b981"}; font-weight: bold;`
  );
}
