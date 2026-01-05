// client/src/utils/url.js
export function makePublicUrl(url) {
  if (!url) return url;
  
  // If already a complete URL (http/https), return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  
  // For backward compatibility with any relative paths
  // (though S3 should always return full URLs)
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return apiBase.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
}