import { APP_QUOTE, APP_TITLE } from "../../app/constants.js";
import { cloneValue, nextNumericId } from "../../shared/data.js";

/**
 * Bookmark business adapter.
 *
 * The adapter owns only bookmark-specific schema rules. Generic cloning and ID
 * generation live in shared helpers so every business plugin follows the same
 * behaviour and naming conventions.
 */
export const manifest = {
  id: "bookmarks",
  version: "1.0.0",
  kind: "business"
};

function ensureDocumentShape(documentObject) {
  documentObject.setup ??= { plugins: [{ name: "bookmarks", version: manifest.version }] };
  documentObject.data ??= {};
  documentObject.data.bookmarks = Array.isArray(documentObject.data.bookmarks) ? documentObject.data.bookmarks : [];
  documentObject.data.tags = Array.isArray(documentObject.data.tags) ? documentObject.data.tags : [];
  return documentObject;
}

const adapter = {
  id: "bookmarks",

  probe(documentObject) {
    if (Array.isArray(documentObject?.data?.bookmarks)) return 100;
    const declared = documentObject?.setup?.plugins?.some?.((plugin) => plugin?.name === "bookmarks");
    return declared ? 90 : 0;
  },

  load(documentObject) {
    return ensureDocumentShape(cloneValue(documentObject));
  },

  serialize(model) {
    return cloneValue(ensureDocumentShape(model));
  },

  toView(model) {
    const data = ensureDocumentShape(model).data;
    const tagMap = new Map(data.tags.map((tag) => [String(tag.id), String(tag.label ?? tag.id)]));

    return {
      type: "bookmarks",
      title: APP_TITLE,
      subtitle: data.subtitle == null ? "" : String(data.subtitle),
      quote: APP_QUOTE,
      tags: data.tags.map((tag) => ({ id: String(tag.id), label: String(tag.label ?? tag.id) })),
      items: data.bookmarks.map((bookmark) => {
        const tags = (Array.isArray(bookmark.tags) ? bookmark.tags : [])
          .map((id) => ({ id: String(id), label: tagMap.get(String(id)) ?? String(id) }));
        const fields = Object.entries(bookmark)
          .filter(([key]) => !["id", "label", "link", "tags"].includes(key))
          .map(([key, value]) => ({ key, label: key, value, type: key === "illustration" ? "image" : "text" }));

        return {
          id: String(bookmark.id),
          label: String(bookmark.label ?? "Untitled"),
          link: String(bookmark.link ?? ""),
          tags,
          fields
        };
      })
    };
  },

  add(model, values) {
    const documentObject = ensureDocumentShape(model);
    const tagIds = [];
    const requestedLabels = String(values.tags ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    for (const label of requestedLabels) {
      let tag = documentObject.data.tags.find((item) => (
        String(item.label ?? "").localeCompare(label, undefined, { sensitivity: "accent" }) === 0
      ));
      if (!tag) {
        tag = { id: nextNumericId(documentObject.data.tags), label };
        documentObject.data.tags.push(tag);
      }
      if (!tagIds.some((id) => String(id) === String(tag.id))) tagIds.push(tag.id);
    }

    const bookmark = {
      id: nextNumericId(documentObject.data.bookmarks),
      label: String(values.label ?? "").trim(),
      link: String(values.url ?? "").trim(),
      illustration: /^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(String(values.illustration ?? ""))
        ? String(values.illustration)
        : "",
      tags: tagIds
    };
    documentObject.data.bookmarks.push(bookmark);
    return bookmark;
  },

  remove(model, id) {
    const documentObject = ensureDocumentShape(model);
    const index = documentObject.data.bookmarks.findIndex((bookmark) => String(bookmark.id) === String(id));
    if (index < 0) return false;
    documentObject.data.bookmarks.splice(index, 1);
    return true;
  }
};

/** Register this adapter and return the unregister callback expected by the kernel. */
export function activate(context) {
  return context.documents.register(adapter.id, adapter);
}
