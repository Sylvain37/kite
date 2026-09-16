import { createPluginContext, validatePluginModule } from "../contracts/plugin.js";

/**
 * Load core extensions declared in config/kite.json and compose their cleanup
 * callbacks so shutdown happens in reverse activation order.
 */
export async function loadFoundationModules(runtime, definitions) {
  const cleanupCallbacks = [];
  for (const definition of definitions ?? []) {
    if (!definition?.id || !definition?.module || !definition?.kind) {
      throw new Error("Invalid core plugin definition in configuration.");
    }
    const url = new URL(`../../${definition.module.replace(/^\.\//, "")}`, import.meta.url);
    const module = await import(url.href);
    validatePluginModule(module, { id: definition.id, kind: definition.kind });
    const cleanup = await module.activate(createPluginContext(runtime, module.manifest));
    if (typeof cleanup === "function") cleanupCallbacks.push(cleanup);
  }
  return () => cleanupCallbacks.reverse().forEach((cleanup) => cleanup());
}
