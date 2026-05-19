export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  timeout?: number; 
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    timeout,
  } = options;

  let lastError: any;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Apply timeout if specified
      if (timeout) {
        return await Promise.race([
          fn(),
          new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout)
          ),
        ]);
      }
      return await fn();
    } catch (error: any) {
      lastError = error;

      const errorMessage = error?.message || '';

      // Check for non-retryable errors
      const isUnauthorized =
        error?.response?.status === 401 ||
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('Invalid API key');

      const isBadRequest =
        error?.response?.status === 400 ||
        errorMessage.includes('Bad Request');

      const isForbidden =
        error?.response?.status === 403 ||
        errorMessage.includes('Forbidden');

      const isPaymentRequired =
        error?.response?.status === 402 ||
        errorMessage.includes('Payment Required');

      // Don't retry on certain error types
      const shouldNotRetry = isUnauthorized || isBadRequest || isForbidden || isPaymentRequired;

      if (shouldNotRetry || attempt === maxRetries) {
        throw error;
      }

      // Check for rate limit errors (both HTTP 429 and Replicate's error messages)
      const isRateLimit =
        error?.response?.status === 429 ||
        errorMessage.includes('Too Many Requests') ||
        errorMessage.includes('Rate limit');

      if (isRateLimit) {
        const retryAfter = error?.response?.headers?.['retry-after'];
        if (retryAfter) {
          // Retry-After can be in seconds or a date
          const retryAfterMs = parseInt(retryAfter) * 1000;
          delay = Math.min(retryAfterMs, maxDelay);
        } else {
          // If no Retry-After header, use longer delay for rate limits
          delay = Math.min(delay * 3, maxDelay);
        }
      }

      console.log(
        `[RETRY] Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${delay}ms...`,
        errorMessage || error
      );

      await new Promise((resolve) => setTimeout(resolve, delay));

      // Exponential backoff with max delay cap (unless it's a rate limit)
      if (!isRateLimit) {
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }
  }

  throw lastError;
}
