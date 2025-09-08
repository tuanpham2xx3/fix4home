/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Example response type for /api/v1/demo
 */
export interface DemoResponse {
  message: string;
}
