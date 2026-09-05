import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config';
import { ApiError } from './errors';

type QueryValue = string | number | boolean | undefined | null;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: Record<string, QueryValue>;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function withTimeout(signal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException('timeout', 'TimeoutError')), timeoutMs);
  const onAbort = () => controller.abort(signal?.reason);

  if (signal) {
    if (signal.aborted) onAbort();
    else signal.addEventListener('abort', onAbort);
  }

  return {
    signal: controller.signal,
    cleanup() {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    },
    get timedOut() {
      return (controller.signal.reason as Error | undefined)?.name === 'TimeoutError';
    },
  };
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', query, body, signal, timeoutMs = REQUEST_TIMEOUT_MS } = options;
  const url = buildUrl(path, query);
  const abort = withTimeout(signal, timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      signal: abort.signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : null),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    if (signal?.aborted) throw cause;
    if (abort.timedOut) {
      throw new ApiError({ kind: 'timeout', message: `Request timed out: ${url}`, url, cause });
    }
    throw new ApiError({ kind: 'network', message: `Network request failed: ${url}`, url, cause });
  } finally {
    abort.cleanup();
  }

  if (!response.ok) {
    throw new ApiError({
      kind: 'http',
      status: response.status,
      message: `${method} ${url} responded with ${response.status}`,
      url,
    });
  }

  if (response.status === 204) return undefined as T;

  try {
    return (await response.json()) as T;
  } catch (cause) {
    throw new ApiError({ kind: 'parse', message: `Malformed JSON from ${url}`, url, cause });
  }
}
