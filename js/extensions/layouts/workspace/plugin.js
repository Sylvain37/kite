/** Self-contained workspace document layout. */
export const manifest = {
  id: "org.kite.layout.workspace",
  version: "1.0.0",
  kind: "layout"
};

export async function activate(context) {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("./style.css", import.meta.url).href;
  const loaded = new Promise((resolve, reject) => {
    stylesheet.addEventListener("load", resolve, { once: true });
    stylesheet.addEventListener("error", () => reject(new Error("Unable to load the workspace layout stylesheet.")), { once: true });
  });
  document.head.append(stylesheet);
  try {
    await loaded;
    const unregister = context.layouts.register("workspace", { id: "workspace", label: "Workspace", labelKey: "layoutWorkspace" });
    return () => {
      unregister();
      stylesheet.remove();
    };
  } catch (error) {
    stylesheet.remove();
    throw error;
  }
}
