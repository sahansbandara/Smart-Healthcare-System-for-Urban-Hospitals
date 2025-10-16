export type ApiError = {
  ok: false;
  error: string;
  details?: unknown;
};

export class ApiFetchError extends Error {
  status: number;
  body: ApiError | null;

  constructor(message: string, status: number, body: ApiError | null) {
    super(message);
    this.name = 'ApiFetchError';
    this.status = status;
    this.body = body;
  }
}

export type ApiFetchOptions = RequestInit & {
  idToken?: string | null;
  getIdToken?: () => Promise<string | null>;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}) {
  const { idToken, getIdToken, headers, ...rest } = options;
  const resolvedToken = idToken ?? (getIdToken ? await getIdToken() : null);
  const initHeaders = new Headers(headers ?? {});
  if (resolvedToken) {
    initHeaders.set('Authorization', `Bearer ${resolvedToken}`);
  }
  initHeaders.set('Content-Type', initHeaders.get('Content-Type') ?? 'application/json');

  const response = await fetch(path, {
    ...rest,
    headers: initHeaders,
  });

  const text = await response.text();
  const json = text ? (JSON.parse(text) as { ok: boolean; data?: T } | ApiError) : null;

  if (!response.ok) {
    const body = (json as ApiError) ?? null;
    throw new ApiFetchError(body?.error ?? 'API_ERROR', response.status, body);
  }

  return json as { ok: true; data: T };
}
