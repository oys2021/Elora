const API_BASE = `${import.meta.env.VITE_API_URL}/api/v1`

export class ApiError extends Error {
  status: number
  code?: string
  // Per-field validation messages, e.g. { deliveryAddress: 'Delivery address is required' }.
  details?: Record<string, string>

  constructor(message: string, status: number, code?: string, details?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

interface ErrorBody {
  error?: { message?: string; code?: string; details?: Record<string, string> }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (res.status === 204) {
    return undefined as T
  }

  const body = await res.json().catch(() => null)

  if (!res.ok) {
    const errBody = body as ErrorBody | null
    throw new ApiError(
      errBody?.error?.message ?? 'Request failed',
      res.status,
      errBody?.error?.code,
      errBody?.error?.details
    )
  }

  return body as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
