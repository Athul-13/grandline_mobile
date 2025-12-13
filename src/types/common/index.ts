// Common types used across features
export interface ApiError {
  readonly message: string;
  readonly code?: string;
  readonly data?: unknown;
}

