/** Minimal keyed registry used by every kernel extension point. */
export class Registry {
  #name;
  #items = new Map();

  constructor(name) {
    this.#name = name;
  }

  register(id, value) {
    if (typeof id !== "string" || !id.trim()) {
      throw new TypeError(`${this.#name}: invalid identifier.`);
    }
    if (this.#items.has(id)) {
      throw new Error(`${this.#name}: “${id}” is already registered.`);
    }
    this.#items.set(id, value);
    return () => this.#items.delete(id);
  }

  set(id, value) {
    this.#items.set(id, value);
    return value;
  }

  get(id) { return this.#items.get(id); }
  has(id) { return this.#items.has(id); }
  delete(id) { return this.#items.delete(id); }
  entries() { return [...this.#items.entries()]; }
  values() { return [...this.#items.values()]; }
  keys() { return [...this.#items.keys()]; }

  get size() { return this.#items.size; }
}

/** Named subclass kept as a semantic extension point for shared services. */
export class ServiceRegistry extends Registry {
  constructor() {
    super("services");
  }
}
