const STORAGE_KEY = "stay_composed_backend_url";

export function getBackendUrl(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) || "";
}

export function setBackendUrl(url: string): void {
  localStorage.setItem(STORAGE_KEY, url.trim().replace(/\/$/, ""));
}

export function clearBackendUrl(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Same backend, but as a ws:// or wss:// URL for the chat WebSocket. */
export function getWsBackendUrl(): string {
  const http = getBackendUrl();
  if (!http) return "";
  return http.replace(/^https:/, "wss:").replace(/^http:/, "ws:");
}