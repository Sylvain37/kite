/**
 * Browser file/network boundary. Keeping fetch, upload and download primitives
 * here prevents business/UI modules from duplicating platform-specific code.
 */
export async function fetchText(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load ${url} (${response.status}).`);
  return response.text();
}

export async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load ${url} (${response.status}).`);
  return response.json();
}

export function getFileExtension(name) {
  const match = String(name).toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : "";
}

export async function readLocalFile(file) {
  if (!(file instanceof File)) throw new TypeError("Invalid local file.");
  return file.text();
}

export function downloadText(text, filename, type = "text/yaml;charset=utf-8") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.hidden = true;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
