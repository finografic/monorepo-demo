export function apiBaseUrl(): string {
  const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
  if (configuredApiBaseUrl) {
    return configuredApiBaseUrl;
  }

  return '';
}
