/** Contract shared by foundation extensions and dynamically loaded business plugins. */
const VALID_PLUGIN_KINDS = new Set(["codec", "theme", "layout", "business"]);

export function validatePluginModule(module, expected = {}) {
  if (!module || typeof module !== "object") {
    throw new TypeError("Invalid plugin module.");
  }
  const { manifest, activate } = module;
  if (!manifest || typeof manifest !== "object") {
    throw new TypeError("A plugin must export a manifest.");
  }
  for (const key of ["id", "version", "kind"]) {
    if (typeof manifest[key] !== "string" || !manifest[key].trim()) {
      throw new TypeError(`Plugin manifest must define ${key}.`);
    }
  }
  if (!VALID_PLUGIN_KINDS.has(manifest.kind)) {
    throw new TypeError(`Unknown plugin kind: ${manifest.kind}.`);
  }
  if (typeof activate !== "function") {
    throw new TypeError("A plugin must export activate(context).");
  }
  if (expected.id && manifest.id !== expected.id) {
    throw new Error(`Unexpected plugin: ${manifest.id} (expected: ${expected.id}).`);
  }
  if (expected.version && manifest.version !== expected.version) {
    throw new Error(`Incompatible version for ${manifest.id}: ${manifest.version} (expected: ${expected.version}).`);
  }
  if (expected.kind && manifest.kind !== expected.kind) {
    throw new Error(`Incompatible plugin kind for ${manifest.id}: ${manifest.kind}.`);
  }
  return true;
}

/** Expose the runtime plus an immutable manifest to a plugin activation hook. */
export function createPluginContext(runtime, manifest) {
  return Object.freeze({ ...runtime, plugin: Object.freeze({ ...manifest }) });
}
