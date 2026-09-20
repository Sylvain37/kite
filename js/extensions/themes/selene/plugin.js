/** Selene theme family and its self-contained stylesheet. */
export const manifest = {
  id: "org.kite.theme.selene",
  version: "1.0.0",
  kind: "theme"
};

export function activate(context) {
  return context.themes.register("selene", {
    id: "selene", label: "Selene",
    stylesheet: new URL("./style.css", import.meta.url).href
  });
}
