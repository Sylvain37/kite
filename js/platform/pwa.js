/** Register the service worker when the browser exposes the PWA API. */
export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("./sw.js", { scope: "./" });
  } catch (error) {
    console.warn("Service Worker registration failed:", error);
    return null;
  }
}
