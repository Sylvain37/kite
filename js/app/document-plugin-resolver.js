import { createPluginContext, validatePluginModule } from "../contracts/plugin.js";

const PLUGIN_NAME_PATTERN = /^[a-z][a-z0-9-]{0,63}$/;

/**
 * Resolve and activate business plugins declared by a YAML document.
 * Loaded versions are memoised so the same plugin cannot be activated twice.
 */
export class DocumentPluginResolver {
  #runtime;
  #loadedPlugins = new Map();

  constructor(runtime) {
    this.#runtime = runtime;
  }

  async loadDeclared(documentObject) {
    const declarations = documentObject?.setup?.plugins;
    if (!Array.isArray(declarations) || declarations.length === 0) {
      await this.load("cv", "1.0.0");
      return ["cv"];
    }

    const pluginIds = [];
    for (const declaration of declarations) {
      const name = String(declaration?.name ?? "");
      const version = String(declaration?.version ?? "");
      await this.load(name, version);
      pluginIds.push(name);
    }
    return pluginIds;
  }

  async load(name, version) {
    if (!PLUGIN_NAME_PATTERN.test(name)) {
      throw new Error(`Rejected plugin name: “${name}”.`);
    }
    if (!version) {
      throw new Error(`Missing version for plugin “${name}”.`);
    }

    const previous = this.#loadedPlugins.get(name);
    if (previous) {
      if (previous.version !== version) {
        throw new Error(`Plugin “${name}” ${previous.version} is already loaded; version ${version} was requested.`);
      }
      return previous;
    }

    const url = new URL(`../plugins/${name}/plugin.js`, import.meta.url);
    const module = await import(url.href);
    validatePluginModule(module, { id: name, version, kind: "business" });
    const deactivate = await module.activate(createPluginContext(this.#runtime, module.manifest));
    const entry = { name, version, module, deactivate };
    this.#loadedPlugins.set(name, entry);
    return entry;
  }
}

/** Pick the adapter with the highest positive probe score. */
export function selectDocumentAdapter(runtime, documentObject) {
  const rankedAdapters = runtime.documents.values()
    .map((adapter) => ({ adapter, score: Number(adapter.probe?.(documentObject) ?? 0) }))
    .filter(({ score }) => Number.isFinite(score) && score > 0)
    .sort((left, right) => right.score - left.score);

  if (!rankedAdapters.length) {
    throw new Error("No business adapter recognises this document.");
  }
  return rankedAdapters[0].adapter;
}
