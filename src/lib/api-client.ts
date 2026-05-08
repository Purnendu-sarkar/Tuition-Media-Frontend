import { publicEnv } from "@/lib/public-env";

interface ApiErrorShape {
  message?: string;
}

async function request<TResponse>(path: string, init?: RequestInit) {
  const isFormData = init?.body instanceof FormData;
  
  const headers = new Headers(init?.headers);
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_BASE_URL}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as ApiErrorShape | null;
      throw new Error(errorBody?.message ?? `Request failed with status ${response.status}`);
    }

    return (await response.json()) as TResponse;
  } catch (error: any) {
    console.error(`API Request Failed [${path}]:`, error.message);
    throw error;
  }
}

export const apiClient = {
  get<TResponse>(path: string, headers?: HeadersInit) {
    return request<TResponse>(path, {
      method: "GET",
      headers,
    });
  },
  post<TResponse>(path: string, body: unknown, headers?: HeadersInit) {
    return request<TResponse>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    });
  },
  put<TResponse>(path: string, body: unknown, headers?: HeadersInit) {
    return request<TResponse>(path, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    });
  },
  patch<TResponse>(path: string, body: unknown, headers?: HeadersInit) {
    return request<TResponse>(path, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    });
  },
  delete<TResponse>(path: string, headers?: HeadersInit) {
    return request<TResponse>(path, {
      method: "DELETE",
      headers,
    });
  },
};
