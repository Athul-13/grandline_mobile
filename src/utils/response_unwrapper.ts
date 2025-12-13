import type { ApiResponse } from '../constants/api';

/**
 * Unwraps server response data
 * Server returns: { success: true, ...data, message?: string } for objects
 * Server returns: { success: true, data: [...], message?: string } for arrays
 */
export function unwrapResponse<T>(response: ApiResponse<T> | unknown): T {
  // Check if this is an array response (has 'data' property that is an array)
  if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
    return response.data as T;
  }

  // For object responses, the data is spread directly in the response
  // Remove 'success' and 'message' fields to get the actual data
  if (response && typeof response === 'object') {
    const { success, message, ...data } = response;
    return data as T;
  }

  // Fallback: return as-is
  return response as T;
}

/**
 * Unwraps response from axios response object
 */
export function unwrapAxiosResponse<T>(axiosResponse: { data: unknown }): T {
  return unwrapResponse(axiosResponse.data);
}

