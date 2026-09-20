/** Self-contained workspace document layout. */
export const manifest = {
  id: "org.kite.layout.workspace",
  version: "1.0.0",
  kind: "layout"
};

export function activate(context) {
  return context.layouts.register("workspace", {
    id: "workspace", label: "Workspace", labelKey: "layoutWorkspace",
    stylesheet: new URL("./style.css", import.meta.url).href
  });
}
