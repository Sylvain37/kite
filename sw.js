/**
 * Offline application shell.
 *
 * The service worker uses a stale-while-revalidate strategy for same-origin GET
 * requests. Bump CACHE_VERSION whenever a release changes shell resources.
 */
const CACHE_VERSION = "v0.5.201";
const APP_SHELL = [
  "./",
  "./index.html",
  "./css/app.css",
  "./css/settings.css",
  "./css/wizard.css",
  "./config/kite.json",
  "./data/template.yml",
  "./site.webmanifest",
  "./js/main.js",
  "./js/app/wizard.js",
  "./js/i18n.js",
  "./js/app/constants.js",
  "./js/app/document-plugin-resolver.js",
  "./js/app/foundation-modules.js",
  "./js/contracts/plugin.js",
  "./js/kernel/registries.js",
  "./js/kernel/runtime.js",
  "./js/platform/file-gateway.js",
  "./js/platform/pwa.js",
  "./js/platform/stylesheet.js",
  "./js/shared/data.js",
  "./js/shared/dom.js",
  "./js/extensions/codecs/yaml/plugin.js",
  "./js/extensions/themes/core/plugin.js",
  "./js/extensions/themes/core/style.css",
  "./js/extensions/themes/selene/plugin.js",
  "./js/extensions/themes/selene/style.css",
  "./js/extensions/layouts/classic/plugin.js",
  "./js/extensions/layouts/classic/style.css",
  "./js/extensions/layouts/workspace/plugin.js",
  "./js/extensions/layouts/workspace/style.css",
  "./js/plugins/bookmarks/plugin.js",
  "./js/plugins/cv/plugin.js",
  "./js/plugins/directory/plugin.js",
  "./js/plugins/writer/plugin.js",
  "./js/plugins/writer/renderer.js",
  "./js/vendor/mermaid.min.js",
  "./js/vendor/highlight/highlight.min.js",
  "./js/vendor/highlight/powershell.min.js",
  "./js/vendor/highlight/default.min.css",
  "./js/vendor/markdown/markdown-it.min.js",
  "./js/vendor/markdown/markdown-it-task-lists.min.js",
  "./js/vendor/markdown/markdown-it-footnote.min.js",
  "./js/vendor/markdown/markdown-it-deflist.min.js",
  "./js/vendor/markdown/markdown-it-mark.min.js",
  "./js/vendor/markdown/markdown-it-sub.min.js",
  "./js/vendor/markdown/markdown-it-sup.min.js",
  "./js/vendor/katex/katex.min.js",
  "./js/vendor/katex/katex.min.css",
  "./js/vendor/katex/fonts/KaTeX_Main-Regular.woff2",
  "./js/vendor/katex/fonts/KaTeX_Main-Italic.woff2",
  "./js/vendor/katex/fonts/KaTeX_Math-Italic.woff2",
  "./js/vendor/katex/fonts/KaTeX_Size1-Regular.woff2",
  "./js/vendor/katex/fonts/KaTeX_Size2-Regular.woff2",
  "./js/vendor/katex/fonts/KaTeX_Size3-Regular.woff2",
  "./js/vendor/katex/fonts/KaTeX_Size4-Regular.woff2",
  "./images/favicon.svg",
  "./images/favicon.ico",
  "./images/favicon-16x16.png",
  "./images/favicon-32x32.png",
  "./images/apple-touch-icon.png",
  "./images/android-chrome-192x192.png",
  "./images/android-chrome-512x512.png",
  "./images/ic_launcher.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // User data is optional and must never become part of the application shell cache.
  if (url.pathname.endsWith("/data/data.yml")) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) {
      // Refresh cached resources opportunistically while returning immediately.
      event.waitUntil(
        fetch(request)
          .then((response) => {
            if (response.ok) return caches.open(CACHE_VERSION).then((cache) => cache.put(request, response.clone()));
            return undefined;
          })
          .catch(() => undefined)
      );
      return cached;
    }

    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_VERSION);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      // Navigations can still start the app while offline after first install.
      if (request.mode === "navigate") {
        const fallback = await caches.match("./index.html");
        if (fallback) return fallback;
      }
      throw error;
    }
  })());
});
