/**
 * Application Configuration
 *
 * Toggle USE_MOCK_API to switch between:
 * - true: Use simulated backend (Zustand store with persistence)
 * - false: Use real backend API
 */

export const config = {
  /**
   * Set to true to use mock/simulated API (no backend required)
   * Set to false to use real backend API
   */
  USE_MOCK_API: true,

  /**
   * API URLs (used when USE_MOCK_API is false)
   */
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000",

  /**
   * Simulated API delay (ms) - makes mock feel more realistic
   */
  MOCK_API_DELAY: 500,
};

/**
 * Helper to simulate network delay in mock API
 */
export const simulateDelay = (ms: number = config.MOCK_API_DELAY): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
