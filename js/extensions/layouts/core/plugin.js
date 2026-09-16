/** Core registry entries for the layouts implemented by css/app.css. */
export const manifest = {
  id: "org.kite.layout.core",
  version: "1.0.0",
  kind: "layout"
};

export function activate(context) {
  const unregisterCallbacks = [
    context.layouts.register("two-column", { id: "two-column", label: "Banner + 2 columns" }),
    context.layouts.register("one-page", { id: "one-page", label: "One page" })
  ];
  return () => unregisterCallbacks.reverse().forEach((unregister) => unregister());
}
