export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'parse';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly url: string;

  constructor(params: {
    kind: ApiErrorKind;
    message: string;
    url: string;
    status?: number;
    cause?: unknown;
  }) {
    super(params.message, { cause: params.cause });
    this.name = 'ApiError';
    this.kind = params.kind;
    this.status = params.status;
    this.url = params.url;
  }

  get isRetryable(): boolean {
    if (this.kind === 'network' || this.kind === 'timeout') return true;
    if (this.kind === 'http' && this.status) return this.status >= 500 || this.status === 429;
    return false;
  }
}

export function toUserMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.kind) {
      case 'network':
        return 'You appear to be offline. Check your connection and try again.';
      case 'timeout':
        return 'The request took too long. Please try again.';
      case 'http':
        return error.status === 404
          ? "We couldn't find what you were looking for."
          : 'The server had a problem handling that request.';
      case 'parse':
        return 'We received an unexpected response from the server.';
    }
  }
  return 'Something went wrong. Please try again.';
}
