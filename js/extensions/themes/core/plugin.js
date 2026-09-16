/** Core registry entries for the themes implemented by css/app.css. */
export const manifest = {
  id: "org.kite.theme.core",
  version: "1.0.0",
  kind: "theme"
};

export function activate(context) {
  const unregisterCallbacks = [
    context.themes.register("system", { id: "system", label: "System" }),
    context.themes.register("light", { id: "light", label: "Light" }),
    context.themes.register("dark", { id: "dark", label: "Dark" })
  ];
  return () => unregisterCallbacks.reverse().forEach((unregister) => unregister());
}
