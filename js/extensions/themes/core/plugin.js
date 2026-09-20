/** Core theme family and its self-contained stylesheet. */
export const manifest = {
  id: "org.kite.theme.core",
  version: "1.0.0",
  kind: "theme"
};

export function activate(context) {
  return context.themes.register("core", {
    id: "core", label: "Core",
    stylesheet: new URL("./style.css", import.meta.url).href
  });
}
