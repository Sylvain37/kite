import { Registry, ServiceRegistry } from "./registries.js";

/**
 * Create the immutable micro-kernel facade. Registries remain mutable through
 * their explicit APIs while the runtime shape itself cannot be replaced.
 */
export function createRuntime() {
  const events = new EventTarget();
  const runtime = {
    codecs: new Registry("codecs"),
    documents: new Registry("documents"),
    themes: new Registry("themes"),
    layouts: new Registry("layouts"),
    services: new ServiceRegistry(),
    events,
    emit(type, detail = undefined) {
      events.dispatchEvent(new CustomEvent(type, { detail }));
    },
    on(type, listener, options) {
      events.addEventListener(type, listener, options);
      return () => events.removeEventListener(type, listener, options);
    }
  };
  return Object.freeze(runtime);
}
