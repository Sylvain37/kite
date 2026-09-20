/** Load one optional stylesheet when its theme, layout or feature is used. */
const pendingStyles = new Map();

export function loadStylesheet(href, key) {
  if (pendingStyles.has(key)) return pendingStyles.get(key);

  let link = [...document.querySelectorAll("link[data-kite-style]")]
    .find((candidate) => candidate.dataset.kiteStyle === key);
  const isNew = !link;
  if (!link) {
    link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL(href, document.baseURI).href;
    link.dataset.kiteStyle = key;
  }

  const loading = new Promise((resolve, reject) => {
    if (link.sheet) {
      resolve(link);
      return;
    }
    link.addEventListener("load", () => resolve(link), { once: true });
    link.addEventListener("error", () => reject(new Error(`Unable to load stylesheet: ${href}`)), { once: true });
    if (isNew) document.head.append(link);
  }).catch((error) => {
    pendingStyles.delete(key);
    link.remove();
    throw error;
  });

  pendingStyles.set(key, loading);
  return loading;
}
