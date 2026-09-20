/** Self-contained classic document layout. */
export const manifest = {
  id: "org.kite.layout.classic",
  version: "1.0.0",
  kind: "layout"
};

export function activate(context) {
  return context.layouts.register("classic", {
    id: "classic", label: "Classic", labelKey: "layoutClassic",
    stylesheet: new URL("./style.css", import.meta.url).href
  });
}
