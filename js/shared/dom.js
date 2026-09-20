/**
 * Browser-side rendering and URL-safety helpers.
 * All user/document values pass through these functions before entering markup.
 */

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "file:", "mailto:", "tel:"]);
const ALLOWED_IMAGE_DATA_URL = /^data:image\/(?:png|jpe?g|webp|gif);base64,[a-z0-9+/=\s]+$/i;

/** Escape text for safe insertion into HTML strings. */
export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Accept only application-approved protocols and return an absolute URL. */
export function sanitizeUrl(value, baseUrl = document.baseURI) {
  try {
    const url = new URL(String(value ?? ""), baseUrl);
    return ALLOWED_PROTOCOLS.has(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

/** Accept safe HTTP(S) images plus embedded image data URLs used by CV illustrations. */
export function sanitizeImageUrl(value, baseUrl = document.baseURI) {
  const text = String(value ?? "").trim();
  if (ALLOWED_IMAGE_DATA_URL.test(text)) return text;

  const url = sanitizeUrl(text, baseUrl);
  if (!url) return "";
  const protocol = new URL(url).protocol;
  return protocol === "http:" || protocol === "https:" ? url : "";
}

/** Validate bookmark links entered in the wizard. */
export function isLinkUrl(value, baseUrl = document.baseURI) {
  const url = sanitizeUrl(value, baseUrl);
  if (!url) return false;
  const protocol = new URL(url).protocol;
  return protocol === "http:" || protocol === "https:" || protocol === "file:";
}
