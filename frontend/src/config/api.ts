// Get API base URL from environment or default to localhost
export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Remove /api suffix if present to get the base URL
    return envUrl.endsWith('/api') ? envUrl.slice(0, -4) : envUrl;
  }
  return 'http://localhost:8000';
};

export const getAuthUrl = (): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api/auth`;
};
