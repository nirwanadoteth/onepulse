/**
 * Exponential backoff reconnection strategy for SpacetimeDB connection.
 * Implements RES-004 requirement for automatic reconnection with exponential backoff.
 */
export class ExponentialBackoffReconnectionStrategy {
  private attemptCount = 0;
  private readonly maxAttempts = Number.POSITIVE_INFINITY;
  private readonly maxBackoffMs = 30000; // 30 seconds
  private readonly baseDelayMs = 1000; // 1 second

  /**
   * Calculate the next reconnection delay using exponential backoff.
   * Formula: min(baseDelay * 2^attemptCount, maxBackoff)
   * Sequence: 1s, 2s, 4s, 8s, 16s, 30s, 30s, ...
   * @returns Delay in milliseconds before next reconnection attempt
   */
  getNextDelay(): number {
    const delayMs = Math.min(
      this.baseDelayMs * Math.pow(2, this.attemptCount),
      this.maxBackoffMs
    );
    this.attemptCount++;
    return delayMs;
  }

  /**
   * Reset the reconnection attempt counter.
   * Should be called after a successful connection is established.
   */
  reset(): void {
    this.attemptCount = 0;
  }

  /**
   * Check if another reconnection attempt is allowed.
   * Currently allows infinite retries (maxAttempts = Infinity).
   * @returns true if reconnection should be attempted
   */
  canRetry(): boolean {
    return this.attemptCount < this.maxAttempts;
  }

  /**
   * Get the current attempt count.
   * @returns Current number of reconnection attempts
   */
  getAttemptCount(): number {
    return this.attemptCount;
  }
}
