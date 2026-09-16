/**
 * Small data helpers shared by business plugins.
 * Keeping these operations here avoids slightly different copies in each adapter.
 */

/** Return a detached value suitable for plugin model manipulation. */
export function cloneValue(value) {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

/** True when a value can safely be rendered as a scalar field. */
export function isScalar(value) {
  return value == null || ["string", "number", "boolean"].includes(typeof value);
}

/** Normalize schema keys so aliases such as first_name and first-name compare equally. */
export function normalizeKey(value) {
  return String(value ?? "").toLowerCase().replace(/[\s_-]/g, "");
}

/** Trim arbitrary input into a predictable string. */
export function cleanText(value) {
  return String(value ?? "").trim();
}

/** Clamp a numeric ratio to the inclusive 0..1 range. */
export function normalizeRatio(value) {
  if (value === "" || value == null) return null;
  const ratio = Number(value);
  return Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : null;
}

/** Return the next numeric identifier, using startAt for an empty collection. */
export function nextNumericId(items, startAt = 1) {
  const max = (Array.isArray(items) ? items : []).reduce((currentMax, item) => {
    const id = Number(item?.id);
    return Number.isFinite(id) ? Math.max(currentMax, id) : currentMax;
  }, startAt - 1);
  return max + 1;
}

/** Split comma- or newline-separated user input and discard blank entries. */
export function splitList(value) {
  return cleanText(value)
    .split(/[,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** Split a multi-line textarea value while preserving one logical item per line. */
export function splitLines(value) {
  return cleanText(value)
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}
