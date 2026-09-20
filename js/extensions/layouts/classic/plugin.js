/** Self-contained classic document layout. */
export const manifest = {
  id: "org.kite.layout.classic",
  version: "1.0.0",
  kind: "layout"
};

export async function activate(context) {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("./style.css", import.meta.url).href;
  const loaded = new Promise((resolve, reject) => {
    stylesheet.addEventListener("load", resolve, { once: true });
    stylesheet.addEventListener("error", () => reject(new Error("Unable to load the classic layout stylesheet.")), { once: true });
  });
  document.head.append(stylesheet);
  try {
    await loaded;
    const unregister = context.layouts.register("classic", { id: "classic", label: "Classic", labelKey: "layoutClassic" });
    return () => {
      unregister();
      stylesheet.remove();
    };
  } catch (error) {
    stylesheet.remove();
    throw error;
  }
}
