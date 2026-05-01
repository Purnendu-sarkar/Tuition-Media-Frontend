import { publicEnv } from "@/lib/public-env";

interface ApiErrorShape {
  message?: string;
}

async function request<TResponse>(path: string, init?: RequestInit) {
  const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as ApiErrorShape | null;
    throw new Error(errorBody?.message ?? "Request failed.");
  }

  return (await response.json()) as TResponse;
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
      body: JSON.stringify(body),
      headers,
    });
  },
  patch<TResponse>(path: string, body: unknown, headers?: HeadersInit) {
    return request<TResponse>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
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
