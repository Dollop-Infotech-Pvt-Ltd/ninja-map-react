import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

// Grid Generation API Types (updated to match new API structure)
export interface GridBounds {
  leftBottomLat: number;
  leftBottomLon: number;
  leftTopLat: number;
  leftTopLon: number;
  rightTopLat: number;
  rightTopLon: number;
  rightBottomLat: number;
  rightBottomLon: number;
}

export interface GridCell {
  row: number;
  col: number;
  bottomLeft: {
    latitude: number;
    longitude: number;
  };
  bottomRight: {
    latitude: number;
    longitude: number;
  };
  topLeft: {
    latitude: number;
    longitude: number;
  };
  topRight: {
    latitude: number;
    longitude: number;
  };
  polyline: Array<{
    latitude: number;
    longitude: number;
  }>;
  center: {
    latitude: number;
    longitude: number;
  };
  blockCode: string;
  cellId: string;
  areaSquareMeters: number;
  polylineAsArray: number[][];
}

export interface GridGenerationResponse {
  gridCells: GridCell[];
  totalRows: number;
  totalColumns: number;
  totalHeightMeters: number;
  totalWidthMeters: number;
  gridDimensions: string;
  totalCells: number;
  summary: string;
  totalAreaSquareMeters: number;
}

// Base URL priority: Vite env -> provided IP -> fallback
const DEFAULT_BASE_URL = "http://192.168.1.95:7002";
const BASE_URL: string = typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL
  ? (import.meta as any).env.VITE_API_BASE_URL
  : DEFAULT_BASE_URL;

let authToken: string | null = null;
let csrfToken: string | null = null;
let csrfHeaderName: string | null = null;
let csrfParamName: string | null = null;

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  // Ensure headers exist and are properly typed
  if (!config.headers) {
    config.headers = {} as any;
  }

  if (authToken) {
    config.headers["Authorization"] = `Bearer ${authToken}`;
  }

  if (csrfToken && csrfHeaderName) {
    config.headers[csrfHeaderName] = csrfToken;
  }

  return config;
});

http.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data as any;
    const serverMessage = typeof data === "object" && data && "message" in data ? String((data as any).message) : undefined;
    const message = serverMessage || error.message || "Request failed";

    const wrapped = new Error(message) as Error & { status?: number; data?: unknown };
    wrapped.status = status;
    wrapped.data = data;
    throw wrapped;
  }
);

export function setAuthToken(token: string | null, persist = true) {
  authToken = token;
  if (token) {
    http.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    if (persist && typeof window !== "undefined") {
      try {
        localStorage.setItem("authToken", token);
      } catch (e) {
        /* ignore storage errors */
      }
    }
  } else {
    delete http.defaults.headers.common["Authorization"];
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("authToken");
      } catch (e) {
        /* ignore */
      }
    }
  }

  // Notify app of auth changes so components (same window) can react
  try {
    if (typeof window !== 'undefined') {
      const ev = new CustomEvent('authChange', { detail: { token } });
      window.dispatchEvent(ev);
    }
  } catch (e) {
    /* ignore */
  }
}

export function setBaseURL(url: string) {
  http.defaults.baseURL = url;
}

export async function get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.get<T>(url, config);
  return res.data as unknown as T;
}

export async function post<T = unknown, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.post<T>(url, body, config);
  return res.data as unknown as T;
}

export async function put<T = unknown, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.put<T>(url, body, config);
  return res.data as unknown as T;
}

export async function patch<T = unknown, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.patch<T>(url, body, config);
  return res.data as unknown as T;
}

export async function del<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.delete<T>(url, config);
  return res.data as unknown as T;
}

/**
 * Fetch CSRF token from server and configure axios to include it on requests.
 * Expected response shape:
 * { parameterName?: string; token?: string; headerName?: string }
 */
export async function fetchCsrf(endpoint = "/api/auth/csrf") {
  try {
    const res = await http.get<{ parameterName?: string; token?: string; headerName?: string }>(endpoint, { timeout: 10000 });
    const body = res.data as any;

    csrfParamName = body?.parameterName ?? null;
    csrfToken = body?.token ?? null;
    csrfHeaderName = body?.headerName ?? null;

    if (csrfToken && csrfHeaderName) {
      http.defaults.headers.common[csrfHeaderName] = csrfToken;
    }

    // For CSR flows: set a readable cookie fallback (useful if server expects a cookie or other libs read it)
    // NOTE: This is a fallback and is less secure than httpOnly cookies. Prefer server-set httpOnly cookies when possible.
    try {
      if (typeof window !== 'undefined' && csrfParamName && csrfToken) {
        const secure = window.location.protocol === 'https:';
        // set cookie for the param name (e.g. _csrf) with short lifetime
        document.cookie = `${csrfParamName}=${csrfToken}; Path=/; Max-Age=${60 * 60}; SameSite=Lax; ${secure ? 'Secure;' : ''}`;
      }
    } catch (e) {
      // ignore cookie write failures
    }

    return { parameterName: csrfParamName, headerName: csrfHeaderName, token: csrfToken };
  } catch (err) {
    return { parameterName: null, headerName: null, token: null };
  }
}

export function getCsrf() {
  return { parameterName: csrfParamName, headerName: csrfHeaderName, token: csrfToken };
}

/**
 * Call refresh-token endpoint and update stored auth token when successful.
 * Expected response shape:
 * {
 *   success: boolean,
 *   message?: string,
 *   http?: string,
 *   data?: string, // access token
 *   statusCode?: number
 * }
 */
export async function refreshAuthToken(endpoint = "/api/auth/refresh-token") {
  try {
    const res = await http.post<{ success?: boolean; message?: string; http?: string; data?: string; statusCode?: number }>(endpoint, { timeout: 10000 });
    const body = res.data as any;

    const token = typeof body?.data === "string" ? body.data : (body?.token || body?.accessToken || null);

    if (token) {
      setAuthToken(token);
      return { ok: true, token };
    }

    // Treat explicit success/statusCode 200 as authenticated even if no token returned
    if (body?.success === true || body?.statusCode === 200) {
      return { ok: true, token: null, body };
    }

    return { ok: false, token: null, body };
  } catch (err: any) {
    return { ok: false, token: null, error: err };
  }
}

export function getAuthToken() {
  return authToken;
}

// Helper to read cookie by name
function readCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Quick check for both access and refresh cookies
export function hasAuthCookies() {
  try {
    if (typeof document === 'undefined') return false;
    const access = readCookie('accessToken');
    const refresh = readCookie('refreshToken');
    return Boolean(access && refresh);
  } catch (e) {
    return false;
  }
}

// Provide a getter that reads token from memory, localStorage or common cookies
export function getStoredAuthToken() {
  if (authToken) return authToken;
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('authToken');
      if (stored) return stored;

      const cookieNames = ['accessToken', 'authToken', 'token'];
      for (const name of cookieNames) {
        const c = readCookie(name);
        if (c) return c;
      }
    }
  } catch (e) {
    /* ignore */
  }
  return null;
}

function initClientAuth() {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem("authToken");
    if (stored) {
      setAuthToken(stored, false);
    } else {
      // fallback: try cookies
      const cookieToken = readCookie('accessToken') || readCookie('authToken') || readCookie('token');
      if (cookieToken) {
        setAuthToken(cookieToken, false);
      }
    }
  } catch (e) {
    /* ignore */
  }

  // ensure CSRF is fetched on client start
  fetchCsrf().catch(() => {
    /* ignore */
  });
}

if (typeof window !== "undefined") {
  initClientAuth();
}



/**
 * Generate grid cells for a given geographic area
 * @param bounds - The geographic bounds for grid generation
 * @param baseUrl - Optional base URL override (defaults to 192.168.1.78:7002)
 * @returns Promise<GridGenerationResponse>
 */
export async function generateGrid(
  bounds: GridBounds,
  baseUrl?: string
): Promise<GridGenerationResponse> {
  const gridApiUrl = baseUrl || "http://192.168.1.78:7002";
  const endpoint = `${gridApiUrl}/api/grid/polylines-with-codes`;
  
  console.log('🔄 Calling grid generation API:', endpoint);
  console.log('📍 Using dynamic bounds from map:', bounds);
  console.log('🕐 Timestamp:', new Date().toISOString());
  console.log('🔧 API Version: v5.0 - Dynamic bounds from map view');
  
  try {
    const response = await axios.post<GridGenerationResponse>(
      endpoint,
      bounds, // Using actual bounds from map
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 30000, // 30 second timeout for grid generation
        withCredentials: false, // Disable credentials for CORS
      }
    );
    
    console.log('✅ Grid generation successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Grid generation failed:', error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message || 'Grid generation failed';
      
      console.error('📊 Error details:', {
        status,
        message,
        url: endpoint,
        data: error.response?.data
      });
      
      const wrappedError = new Error(message) as Error & { status?: number; data?: unknown };
      wrappedError.status = status;
      wrappedError.data = error.response?.data;
      throw wrappedError;
    }
    throw error;
  }
}

export default http;
