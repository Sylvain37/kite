/** Selene theme family and its self-contained stylesheet. */
export const manifest = {
  id: "org.kite.theme.selene",
  version: "1.0.0",
  kind: "theme"
};

export async function activate(context) {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("./style.css", import.meta.url).href;
  const loaded = new Promise((resolve, reject) => {
    stylesheet.addEventListener("load", resolve, { once: true });
    stylesheet.addEventListener("error", () => reject(new Error("Unable to load the Selene theme stylesheet.")), { once: true });
  });
  document.head.append(stylesheet);
  try {
    await loaded;
    const unregister = context.themes.register("selene", { id: "selene", label: "Selene" });
    return () => {
      unregister();
      stylesheet.remove();
    };
  } catch (error) {
    stylesheet.remove();
    throw error;
  }
}
