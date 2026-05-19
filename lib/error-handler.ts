/**
 * Extracts a human-readable error message from an API error response
 * @param error The error object from axios
 * @returns A user-friendly error message
 */
export function getErrorMessage(error: any): string {
  // Log the error for debugging
  console.log('[ERROR_HANDLER] Full error:', error);
  console.log('[ERROR_HANDLER] Response data:', error?.response?.data);
  console.log('[ERROR_HANDLER] Response status:', error?.response?.status);

  // Check for response data (our custom API error messages)
  if (error?.response?.data) {
    // If it's a string, return it directly
    if (typeof error.response.data === 'string') {
      return error.response.data;
    }

    // If it's an object with a message property
    if (error.response.data.message) {
      return error.response.data.message;
    }

    // If it's an object with an error property
    if (error.response.data.error) {
      return error.response.data.error;
    }
  }

  // Check for network errors
  if (error?.message === 'Network Error') {
    return 'Network error. Please check your internet connection.';
  }

  // Check for timeout errors
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Check for specific HTTP status codes
  const status = error?.response?.status;
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Unauthorized. Please log in again.';
    case 403:
      return 'Access forbidden. You may need to upgrade your plan.';
    case 404:
      return 'Resource not found.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
    case 503:
      return 'Service temporarily unavailable. Please try again.';
    case 504:
      return 'Request timed out. Please try again.';
    default:
      break;
  }

  // Fallback to generic error message
  return 'Something went wrong. Please try again.';
}
