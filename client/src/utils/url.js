// client/src/utils/url.js
export function makePublicUrl(url) {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return apiBase.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
}
