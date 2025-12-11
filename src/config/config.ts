let baseUrl = "";
const webUrl = import.meta.env.VITE_LIVE_WEB_URL;

// Default to localhost:8080 for development
const defaultBaseUrl = "http://localhost:8080";

switch (window.location.host) {
  case import.meta.env.VITE_LIVE_HOST:
    baseUrl = import.meta.env.VITE_LIVE_URL;
    break;
  case import.meta.env.VITE_LOCAL_HOST:
    baseUrl = import.meta.env.VITE_SERVER_LOCAL_URL;
    break;
  default:
    baseUrl = import.meta.env.VITE_SERVER_LOCAL_URL || import.meta.env.VITE_LIVE_URL || defaultBaseUrl;
    break;
}

export { baseUrl, webUrl };

