import { cloneValue } from "../../shared/data.js";

export const manifest = { id: "writer", version: "1.0.0", kind: "business" };

function documentId(index) {
  return `writer-${index}`;
}

function normaliseDocument(document, index) {
  return {
    id: String(document?.id ?? documentId(index + 1)),
    title: String(document?.title ?? `Document ${index + 1}`),
    markdown: String(document?.markdown ?? "")
  };
}

function tagsFromMarkdown(markdown) {
  const tags = new Map();
  String(markdown ?? "").replace(/##([^#\n]+?)##/g, (_, raw) => {
    const label = String(raw).replace(/`/g, "").trim();
    if (!label) return "";
    const id = `writer-tag-${label.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "tag"}`;
    tags.set(id, { id, label });
    return "";
  });
  return [...tags.values()];
}

function ensure(model) {
  model.setup ??= { plugins: [{ name: manifest.id, version: manifest.version }] };
  model.data ??= {};
  model.data.writer ??= {};
  const writer = model.data.writer;
  writer.title = String(writer.title ?? "Writer");
  const legacyMarkdown = writer.markdown;
  const documents = Array.isArray(writer.documents) ? writer.documents : [];
  writer.documents = documents.length
    ? documents.map(normaliseDocument)
    : [normaliseDocument({ id: documentId(1), title: "Document 1", markdown: legacyMarkdown }, 0)];
  delete writer.markdown;
  return model;
}

const adapter = {
  id: manifest.id,
  probe(documentObject) {
    return documentObject?.data?.writer && typeof documentObject.data.writer === "object"
      ? 130
      : documentObject?.setup?.plugins?.some?.((plugin) => plugin?.name === manifest.id) ? 20 : 0;
  },
  load(documentObject) { return ensure(cloneValue(documentObject)); },
  serialize(model) { return cloneValue(ensure(model)); },
  toView(model) {
    const writer = ensure(model).data.writer;
    return {
      type: manifest.id,
      title: writer.title,
      subtitle: "",
      quote: "",
      tags: [...new Map(writer.documents.flatMap((document) => tagsFromMarkdown(document.markdown)).map((tag) => [tag.id, tag])).values()],
      items: writer.documents.map((document) => ({
        id: document.id,
        cardType: "writer",
        label: document.title,
        markdown: document.markdown,
        tags: tagsFromMarkdown(document.markdown),
        displayTags: false,
        fields: []
      }))
    };
  },
  update(model, id, markdown) {
    const writer = ensure(model).data.writer;
    const document = writer.documents.find((entry) => String(entry.id) === String(id));
    if (document) document.markdown = String(markdown ?? "");
  },
  add(model) {
    const writer = ensure(model).data.writer;
    const index = writer.documents.length + 1;
    const document = normaliseDocument({ id: documentId(index), title: `Document ${index}`, markdown: "" }, index - 1);
    writer.documents.push(document);
    return document;
  }
};

export function activate(context) { return context.documents.register(adapter.id, adapter); }
