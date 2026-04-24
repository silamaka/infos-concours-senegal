const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const ACCESS_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
let refreshInFlight: Promise<string | null> | null = null;

interface RequestOptions {
  method?: string;
  body?: unknown | FormData;
  headers?: Record<string, string>;
}

export interface ApiUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  role: "USER" | "STAFF" | "ADMIN";
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: ApiUser;
}

export interface Annale {
  id: string;
  title: string;
  category: string;
  price: number;
  oldPrice?: number | null;
  isPopular?: boolean;
  isNew?: boolean;
  description?: string;
  pages?: number;
  year?: number;
  rating?: number;
  reviews?: number;
  downloads?: number;
  image?: string;
  preview_url?: string;
}

export interface Concours {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  registration_url?: string;
  location: string;
  deadline: string;
  status: string;
  image?: string;
  rating?: number;
  reviews?: number;
  is_featured?: boolean;
  conditions?: string;
}

export interface OrderItemPayload {
  annale_id: string;
  quantity: number;
}

export interface OrderItem {
  annale_id: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  status: "pending" | "paid" | "failed";
  total: number;
  created_at: string;
  items: OrderItem[];
}

export interface PaymentInitiateResponse {
  payment_url: string;
  payment_id: string;
  mock_mode?: boolean;
}

export interface PaymentStatus {
  payment_id: string;
  status: "initiated" | "paid" | "failed";
  payment_url: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ServiceRequestPayload {
  service_type: string;
  name: string;
  email: string;
  phone: string;
  target?: string;
  details: string;
  file?: File | null;
}

export interface ServiceRequest {
  id: string;
  service_type: string;
  name: string;
  email: string;
  phone: string;
  target: string;
  details: string;
  attachment_file?: string | null;
  attachment_file_url?: string | null;
  status: "submitted" | "in_progress" | "delivered";
  created_at: string;
}

export interface AdminOverview {
  counts: {
    users: number;
    annales: number;
    concours: number;
    orders: number;
    payments: number;
    contact_messages: number;
    service_requests: number;
  };
  recent_orders: Array<{
    id: string;
    user_email: string;
    status: "pending" | "paid" | "failed";
    total: number;
    created_at: string;
  }>;
  recent_contacts: Array<{
    id: string;
    name: string;
    email: string;
    subject: string;
    is_processed: boolean;
    created_at: string;
  }>;
  recent_service_requests: Array<{
    id: string;
    name: string;
    email: string;
    service_type: string;
    status: "submitted" | "in_progress" | "delivered";
    created_at: string;
  }>;
}

export interface AdminStats {
  total_revenue: number;
  orders_count: number;
  users_count: number;
  annales_sold: number;
}

export interface AdminAnnale {
  id: string;
  title: string;
  category: string;
  price: number;
  oldPrice?: number | null;
  isPopular?: boolean;
  isNew?: boolean;
  description?: string;
  pages?: number;
  year?: number;
  image?: string;
  preview_url?: string;
  pdf_key?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminConcours {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  registration_url?: string;
  location: string;
  deadline: string;
  status: string;
  image?: string;
  is_featured?: boolean;
  conditions?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminOrder {
  id: string;
  user_email: string;
  status: "pending" | "paid" | "failed";
  total: number;
  created_at: string;
  updated_at: string;
}

export interface AdminPayment {
  id: string;
  order_id: string;
  user_email: string;
  provider: string;
  phone: string;
  amount: number;
  status: "initiated" | "paid" | "failed";
  provider_reference: string;
  created_at: string;
  updated_at: string;
}

export interface AdminServiceRequest {
  id: string;
  service_type: string;
  name: string;
  email: string;
  phone: string;
  target: string;
  details: string;
  attachment_file?: string | null;
  attachment_file_url?: string | null;
  status: "submitted" | "in_progress" | "delivered";
  user_email?: string | null;
  created_at: string;
}

export interface AdminContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_processed: boolean;
  created_at: string;
}

export interface AdminContactListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminContactMessage[];
}

export interface AdminUserRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "USER" | "STAFF" | "ADMIN";
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
}

export interface AdminUserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUserRow[];
}

export interface AdminAuditLog {
  id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown>;
  admin_email: string | null;
  created_at: string;
}

export interface AdminUserCreatePayload {
  email: string;
  first_name: string;
  last_name: string;
  role: "USER" | "STAFF" | "ADMIN";
  password: string;
  is_active?: boolean;
}

export interface AdminImageUploadResponse {
  url: string;
  path: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface RefreshResponse {
  access: string;
  refresh?: string;
}

function readErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const value = payload as Record<string, unknown>;
  if (typeof value.message === "string") return value.message;
  if (Array.isArray(value.non_field_errors) && typeof value.non_field_errors[0] === "string") {
    return value.non_field_errors[0];
  }
  for (const [field, errorValue] of Object.entries(value)) {
    if (Array.isArray(errorValue) && typeof errorValue[0] === "string") {
      return `${field}: ${errorValue[0]}`;
    }
    if (typeof errorValue === "string") {
      return `${field}: ${errorValue}`;
    }
  }
  return fallback;
}

export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;
  const makeRequest = async (tokenOverride?: string | null) => {
    const token = tokenOverride ?? localStorage.getItem(ACCESS_TOKEN_KEY);
    // Préparer les headers
    const requestHeaders: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    };
    // Ajouter Content-Type seulement si ce n'est pas FormData
    if (!(body instanceof FormData)) {
      requestHeaders["Content-Type"] = "application/json";
    }
    // Préparer le body
    const requestBody = body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined);
    return fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      ...(requestBody ? { body: requestBody } : {}),
    });
  };

  let res = await makeRequest();

  if (res.status === 401 && canRetryWithRefresh(endpoint)) {
    const nextToken = await refreshAccessTokenApi();
    if (nextToken) {
      res = await makeRequest(nextToken);
    }
  }

  // Si toujours 401 après refresh, forcer la déconnexion et rediriger vers /login
  if (res.status === 401) {
    clearAuthTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }

  if (!res.ok) {
    let payload: unknown = null;
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
    throw new Error(readErrorMessage(payload, `API Error: ${res.status} ${res.statusText}`));
  }

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

export function saveAuthTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAuthTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function canRetryWithRefresh(endpoint: string): boolean {
  return ![
    "/auth/login/",
    "/auth/register/",
    "/auth/logout/",
    "/auth/token/refresh/",
  ].includes(endpoint);
}

export async function refreshAccessTokenApi(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refresh = getRefreshToken();
    if (!refresh) return null;

    const res = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      clearAuthTokens();
      return null;
    }

    const payload = (await res.json()) as RefreshResponse;
    localStorage.setItem(ACCESS_TOKEN_KEY, payload.access);
    if (payload.refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, payload.refresh);
    }
    return payload.access;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login/", {
    method: "POST",
    body: { email, password },
  });
}

export async function registerApi(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const fullName = name.trim();
  const [firstName = "", ...rest] = fullName.split(/\s+/);
  const lastName = rest.join(" ") || "Utilisateur";

  return apiFetch<AuthResponse>("/auth/register/", {
    method: "POST",
    body: {
      email,
      password,
      first_name: firstName || "Utilisateur",
      last_name: lastName,
      role: "USER",
    },
  });
}

export async function logoutApi(refresh: string): Promise<void> {
  await apiFetch<void>("/auth/logout/", {
    method: "POST",
    body: { refresh },
  });
}

export async function meApi(): Promise<ApiUser> {
  return apiFetch<ApiUser>("/users/me/");
}

export async function getAnnalesApi(): Promise<Annale[]> {
  const payload = await apiFetch<Annale[] | PaginatedResponse<Annale>>("/annales/");
  return Array.isArray(payload) ? payload : (payload?.results || []);
}

export async function getAnnaleByIdApi(id: string): Promise<Annale> {
  return apiFetch<Annale>(`/annales/${id}/`);
}

export async function getConcoursApi(): Promise<Concours[]> {
  const payload = await apiFetch<Concours[] | PaginatedResponse<Concours>>("/concours/");
  return Array.isArray(payload) ? payload : (payload?.results || []);
}

export async function getConcoursByIdApi(id: string): Promise<Concours> {
  return apiFetch<Concours>(`/concours/${id}/`);
}

export async function createOrderApi(items: OrderItemPayload[]): Promise<Order> {
  return apiFetch<Order>("/orders/", {
    method: "POST",
    body: { items },
  });
}

export async function getMyOrdersApi(): Promise<Order[]> {
  const payload = await apiFetch<Order[] | PaginatedResponse<Order>>("/orders/me/");
  return Array.isArray(payload) ? payload : (payload?.results || []);
}

export async function initiatePaymentApi(
  orderId: string,
  provider: "wave" | "orange" | "paydunya",
  phone: string,
): Promise<PaymentInitiateResponse> {
  return apiFetch<PaymentInitiateResponse>("/payments/initiate/", {
    method: "POST",
    body: {
      order_id: orderId,
      provider,
      phone,
    },
  });
}

export async function getPaymentStatusApi(paymentId: string): Promise<PaymentStatus> {
  return apiFetch<PaymentStatus>(`/payments/${paymentId}/status/`);
}

export async function confirmMockPaymentApi(
  paymentId: string,
  status: "paid" | "failed" = "paid",
): Promise<PaymentStatus> {
  return apiFetch<PaymentStatus>(`/payments/${paymentId}/mock-confirm/`, {
    method: "POST",
    body: { status },
  });
}

export async function submitContactApi(payload: ContactPayload): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/contact/", {
    method: "POST",
    body: payload,
  });
}

export async function submitServiceRequestApi(payload: ServiceRequestPayload): Promise<ServiceRequest> {
  const formData = new FormData();
  
  // Ajouter tous les champs textuels
  Object.entries(payload).forEach(([key, value]) => {
    if (key !== 'file' && value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  
  // Ajouter le fichier s'il existe
  if (payload.file) {
    formData.append('attachment_file', payload.file);
  }
  
  return apiFetch<ServiceRequest>("/services/", {
    method: "POST",
    body: formData,
  });
}

export async function getMyServiceRequestsApi(): Promise<ServiceRequest[]> {
  return apiFetch<ServiceRequest[]>("/services/me/");
}

export async function getAnnaleDownloadApi(annaleId: string): Promise<{ url: string; expires_in: number }> {
  return apiFetch<{ url: string; expires_in: number }>(`/annales/${annaleId}/download/`);
}

export async function getAdminOverviewApi(): Promise<AdminOverview> {
  return apiFetch<AdminOverview>("/admin/overview/");
}

export async function uploadAdminImageApi(file: File): Promise<AdminImageUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const makeRequest = async (tokenOverride?: string | null) => {
    const token = tokenOverride ?? getAccessToken();
    return fetch(`${API_BASE_URL}/admin/upload/image/`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
  };

  let res = await makeRequest();
  if (res.status === 401) {
    const nextToken = await refreshAccessTokenApi();
    if (nextToken) {
      res = await makeRequest(nextToken);
    }
  }

  if (!res.ok) {
    let payload: unknown = null;
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
    throw new Error(readErrorMessage(payload, "Upload image impossible"));
  }

  return res.json() as Promise<AdminImageUploadResponse>;
}

export async function uploadAdminPdfApi(file: File): Promise<AdminImageUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const makeRequest = async (tokenOverride?: string | null) => {
    const token = tokenOverride ?? getAccessToken();
    return fetch(`${API_BASE_URL}/admin/upload/pdf/`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
  };

  let res = await makeRequest();
  if (res.status === 401) {
    const nextToken = await refreshAccessTokenApi();
    if (nextToken) {
      res = await makeRequest(nextToken);
    }
  }

  if (!res.ok) {
    let payload: unknown = null;
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
    throw new Error(readErrorMessage(payload, "Upload PDF impossible"));
  }

  return res.json() as Promise<AdminImageUploadResponse>;
}

export async function getAdminStatsApi(): Promise<AdminStats> {
  return apiFetch<AdminStats>("/admin/stats/");
}

export async function getAdminAnnalesApi(): Promise<AdminAnnale[]> {
  const payload = await apiFetch<AdminAnnale[] | PaginatedResponse<AdminAnnale>>("/admin/annales/");
  return Array.isArray(payload) ? payload : (payload?.results || []);
}

export async function createAdminAnnaleApi(payload: Partial<AdminAnnale>): Promise<AdminAnnale> {
  return apiFetch<AdminAnnale>("/admin/annales/", {
    method: "POST",
    body: payload,
  });
}

export async function updateAdminAnnaleApi(id: string, payload: Partial<AdminAnnale>): Promise<AdminAnnale> {
  return apiFetch<AdminAnnale>(`/admin/annales/${id}/`, {
    method: "PATCH",
    body: payload,
  });
}

export async function deleteAdminAnnaleApi(id: string): Promise<void> {
  return apiFetch<void>(`/admin/annales/${id}/`, { method: "DELETE" });
}

export async function getAdminConcoursApi(): Promise<AdminConcours[]> {
  const payload = await apiFetch<AdminConcours[] | PaginatedResponse<AdminConcours>>("/admin/concours/");
  return Array.isArray(payload) ? payload : (payload?.results || []);
}

export async function createAdminConcoursApi(payload: Partial<AdminConcours>): Promise<AdminConcours> {
  return apiFetch<AdminConcours>("/admin/concours/", {
    method: "POST",
    body: payload,
  });
}

export async function updateAdminConcoursApi(id: string, payload: Partial<AdminConcours>): Promise<AdminConcours> {
  return apiFetch<AdminConcours>(`/admin/concours/${id}/`, {
    method: "PATCH",
    body: payload,
  });
}

export async function deleteAdminConcoursApi(id: string): Promise<void> {
  return apiFetch<void>(`/admin/concours/${id}/`, { method: "DELETE" });
}

export async function getAdminOrdersApi(): Promise<AdminOrder[]> {
  const payload = await apiFetch<AdminOrder[] | PaginatedResponse<AdminOrder>>("/admin/orders/");
  return Array.isArray(payload) ? payload : (payload?.results || []);
}

export async function updateAdminOrderApi(id: string, status: AdminOrder["status"]): Promise<AdminOrder> {
  return apiFetch<AdminOrder>(`/admin/orders/${id}/`, {
    method: "PATCH",
    body: { status },
  });
}

export async function getAdminPaymentsApi(): Promise<AdminPayment[]> {
  const payload = await apiFetch<AdminPayment[] | PaginatedResponse<AdminPayment>>("/admin/payments/");
  return Array.isArray(payload) ? payload : (payload?.results || []);
}

export async function getAdminAuditLogsApi(): Promise<AdminAuditLog[]> {
  const payload = await apiFetch<AdminAuditLog[] | PaginatedResponse<AdminAuditLog>>("/admin/audit-logs/");
  return Array.isArray(payload) ? payload : (payload?.results || []);
}

export async function getAdminServicesApi(): Promise<AdminServiceRequest[]> {
  const payload = await apiFetch<AdminServiceRequest[] | PaginatedResponse<AdminServiceRequest>>("/admin/services/");
  return Array.isArray(payload) ? payload : (payload?.results || []);
}

export async function updateAdminServiceApi(
  id: string,
  status: AdminServiceRequest["status"],
): Promise<AdminServiceRequest> {
  return apiFetch<AdminServiceRequest>(`/admin/services/${id}/`, {
    method: "PATCH",
    body: { status },
  });
}

export async function getAdminUsersApi(filters?: {
  role?: AdminUserRow["role"] | "ALL";
  is_active?: "ALL" | "true" | "false";
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: "date_joined" | "-date_joined" | "email" | "-email";
}): Promise<AdminUserListResponse> {
  const params = new URLSearchParams();
  if (filters?.role && filters.role !== "ALL") params.set("role", filters.role);
  if (filters?.is_active && filters.is_active !== "ALL") params.set("is_active", filters.is_active);
  if (filters?.search?.trim()) params.set("search", filters.search.trim());
  if (filters?.page && filters.page > 0) params.set("page", String(filters.page));
  if (filters?.page_size && filters.page_size > 0) params.set("page_size", String(filters.page_size));
  if (filters?.ordering) params.set("ordering", filters.ordering);

  const suffix = params.toString() ? `?${params.toString()}` : "";
  const payload = await apiFetch<AdminUserRow[] | AdminUserListResponse>(`/admin/users/${suffix}`);
  if (Array.isArray(payload)) {
    return {
      count: payload.length,
      next: null,
      previous: null,
      results: payload,
    };
  }
  return payload;
}

export async function createAdminUserApi(payload: AdminUserCreatePayload): Promise<AdminUserRow> {
  return apiFetch<AdminUserRow>("/admin/users/", {
    method: "POST",
    body: payload,
  });
}

export async function updateAdminUserApi(
  id: string,
  payload: Partial<Pick<AdminUserRow, "role" | "is_active" | "first_name" | "last_name" | "email">> & {
    password?: string;
  },
): Promise<AdminUserRow> {
  return apiFetch<AdminUserRow>(`/admin/users/${id}/`, {
    method: "PATCH",
    body: payload,
  });
}

export async function deleteAdminUserApi(id: string): Promise<void> {
  return apiFetch<void>(`/admin/users/${id}/`, { method: "DELETE" });
}

export async function getAdminContactApi(filters?: {
  is_processed?: "ALL" | "true" | "false";
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<AdminContactListResponse> {
  const params = new URLSearchParams();
  if (filters?.is_processed && filters.is_processed !== "ALL") params.set("is_processed", filters.is_processed);
  if (filters?.search?.trim()) params.set("search", filters.search.trim());
  if (filters?.page && filters.page > 0) params.set("page", String(filters.page));
  if (filters?.page_size && filters.page_size > 0) params.set("page_size", String(filters.page_size));
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<AdminContactListResponse>(`/admin/contact/${suffix}`);
}
export async function updateAdminContactApi(
  id: string,
  payload: Partial<Pick<AdminContactMessage, "is_processed">>,
): Promise<AdminContactMessage> {
  return apiFetch<AdminContactMessage>(`/admin/contact/${id}/`, {
    method: "PATCH",
    body: payload,
  });
}

export async function deleteAdminContactApi(id: string): Promise<void> {
  return apiFetch<void>(`/admin/contact/${id}/`, { method: "DELETE" });
}

