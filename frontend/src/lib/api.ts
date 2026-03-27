import { getStoredTokens, saveAuth, clearAuth, getStoredUser } from "./auth";
import type { Booking, Product, Tokens, User } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  auth?: boolean;
};

async function refreshAccessToken(tokens: Tokens): Promise<Tokens | null> {
  const response = await fetch(`${API_BASE}/users/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: tokens.refresh }),
  });

  if (!response.ok) {
    clearAuth();
    return null;
  }

  const payload = (await response.json()) as { access: string };
  const updated = { ...tokens, access: payload.access };
  const currentUser = getStoredUser();
  if (currentUser) {
    saveAuth(updated, currentUser);
  }

  return updated;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method || "GET";
  const authRequired = options.auth !== false;
  const tokens = getStoredTokens();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authRequired && tokens?.access) {
    headers.Authorization = `Bearer ${tokens.access}`;
  }

  const send = async () =>
    fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

  let response = await send();

  if (response.status === 401 && authRequired && tokens?.refresh) {
    const refreshed = await refreshAccessToken(tokens);
    if (!refreshed) {
      throw new Error("Your session expired. Please sign in again.");
    }

    headers.Authorization = `Bearer ${refreshed.access}`;
    response = await send();
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export async function demoLogin(input: {
  name: string;
  email: string;
  role: string;
}) {
  return request<{ tokens: Tokens; user: User }>("/users/auth/demo/", {
    method: "POST",
    body: input,
    auth: false,
  });
}

export async function googleLogin(token: string) {
  return request<{ tokens: Tokens; user: User }>("/users/auth/google/", {
    method: "POST",
    body: { token },
    auth: false,
  });
}

export async function getProfile() {
  return request<User>("/users/profile/");
}

export async function updateProfile(payload: Partial<User>) {
  return request<User>("/users/profile/", { method: "PATCH", body: payload });
}

export async function getProducts() {
  return request<Product[]>("/products/", { auth: false });
}

export async function getProduct(id: string | number) {
  return request<Product>(`/products/${id}/`, { auth: false });
}

export async function createProduct(payload: {
  name: string;
  description: string;
  price: number;
  image_url?: string;
}) {
  return request<Product>("/products/", { method: "POST", body: payload });
}

export async function getBookings() {
  return request<Booking[]>("/bookings/");
}

export async function createBooking(payload: {
  product: number;
  booking_name: string;
  booking_email: string;
  booking_phone_number: string;
}) {
  return request<Booking>("/bookings/", {
    method: "POST",
    body: payload,
  });
}

export async function getWishlist() {
  return request<any[]>("/products/wishlist/");
}

export async function addToWishlist(productId: number) {
  return request<any>("/products/wishlist/", {
    method: "POST",
    body: { product: productId },
  });
}

export async function getAdminStats() {
  return request<any>("/users/admin-stats/");
}
