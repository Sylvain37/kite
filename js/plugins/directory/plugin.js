import { cloneValue, nextNumericId } from "../../shared/data.js";

/** Contacts are the source of people; teams and organisation-chart nodes reference them. */
export const manifest = { id: "directory", version: "1.0.0", kind: "business" };

function text(value) { return String(value ?? "").trim(); }
function list(value) { return String(value ?? "").split(",").map(text).filter(Boolean); }
function field(key, value, type = "text") { return value ? { key, label: key, value, type } : null; }
function fields(...entries) { return entries.filter(Boolean); }

function ensureDirectory(model) {
  model.setup ??= { plugins: [{ name: manifest.id, version: manifest.version }] };
  model.data ??= {};
  model.data.directory ??= {};
  const directory = model.data.directory;
  directory.contacts = Array.isArray(directory.contacts) ? directory.contacts : [];
  directory.teams = Array.isArray(directory.teams) ? directory.teams : (Array.isArray(directory.team) ? directory.team : []);
  directory.orgchart = Array.isArray(directory.orgchart) ? directory.orgchart : [];
  return model;
}

function contactItem(contact) {
  const label = text(contact.name) || text(contact.label) || "Untitled";
  return {
    id: `contact-${contact.id}`,
    label,
    link: text(contact.link),
    tags: [{ id: "directory-contact", label: "contact" }, ...list(contact.tags).map((tag) => ({ id: `tag-${tag.toLocaleLowerCase()}`, label: tag }))],
    profileTitle: text(contact.role),
    fields: fields(
      field("email", text(contact.email), "email"), field("phone", text(contact.phone), "phone"),
      field("organization", text(contact.organization)), field("role", text(contact.role))
    )
  };
}

function teamItem(team, contacts) {
  const members = (Array.isArray(team.contacts) ? team.contacts : [])
    .map((id) => contacts.get(String(id)))
    .filter(Boolean)
    .map((contact) => text(contact.name) || text(contact.label));
  return {
    id: `team-${team.id}`,
    label: text(team.name) || text(team.label) || "Untitled team",
    tags: [{ id: "directory-team", label: "team" }],
    fields: fields(field("contacts", members.join(" · ")))
  };
}

function organisationChart(directory, contacts, teams) {
  const sourceLabel = (kind, id) => {
    const source = kind === "team" ? teams.get(String(id)) : contacts.get(String(id));
    return text(source?.name) || text(source?.label) || "Untitled";
  };
  return directory.orgchart.map((node) => ({
    id: String(node.id),
    parent: node.parent == null ? "" : String(node.parent),
    label: text(node.label) || sourceLabel(text(node.sourceType) === "team" ? "team" : "contact", node.sourceId),
    sourceType: text(node.sourceType) === "team" ? "team" : "contact",
    sourceLabel: sourceLabel(text(node.sourceType) === "team" ? "team" : "contact", node.sourceId)
  }));
}

function toView(model) {
  const directory = ensureDirectory(model).data.directory;
  const contacts = new Map(directory.contacts.map((contact) => [String(contact.id), contact]));
  const teams = new Map(directory.teams.map((team) => [String(team.id), team]));
  const items = [
    ...directory.contacts.map(contactItem),
    ...directory.teams.map((team) => teamItem(team, contacts))
  ];
  const chart = organisationChart(directory, contacts, teams);
  if (chart.length) items.push({ id: "directory-orgchart", cardType: "orgchart", label: "Organisation chart", orgchart: chart, displayTags: false, fields: [] });
  const tags = new Map();
  for (const item of items) for (const tag of item.tags ?? []) tags.set(tag.id, tag);
  return { type: "directory", title: text(directory.title) || "Directory", subtitle: text(directory.subtitle), quote: text(directory.quote), tags: [...tags.values()], items };
}

const adapter = {
  id: manifest.id,
  probe(documentObject) {
    if (documentObject?.data?.directory && typeof documentObject.data.directory === "object") return 120;
    return documentObject?.setup?.plugins?.some?.((plugin) => plugin?.name === manifest.id) ? 20 : 0;
  },
  load(documentObject) { return ensureDirectory(cloneValue(documentObject)); },
  serialize(model) { return cloneValue(ensureDirectory(model)); },
  toView,
  add(model, values) {
    const directory = ensureDirectory(model).data.directory;
    const type = text(values.type);
    const name = text(values.name);
    if (!name) throw new Error("A name is required.");
    if (type === "contact") {
      const entry = { id: nextNumericId(directory.contacts), name };
      for (const key of ["role", "email", "phone", "organization", "link", "tags"]) if (text(values[key])) entry[key] = text(values[key]);
      directory.contacts.push(entry);
      return entry;
    }
    if (type === "team") {
      const entry = { id: nextNumericId(directory.teams), name, contacts: list(values.contacts) };
      directory.teams.push(entry);
      return entry;
    }
    if (type === "orgchart") {
      const sourceType = text(values.sourceType) === "team" ? "team" : "contact";
      const sourceId = text(values.sourceId);
      if (!sourceId) throw new Error("An organisation-chart source is required.");
      const entry = { id: nextNumericId(directory.orgchart), label: name, sourceType, sourceId };
      if (text(values.parent)) entry.parent = text(values.parent);
      directory.orgchart.push(entry);
      return entry;
    }
    throw new Error("Unsupported directory entry type.");
  },
  remove(model, id) {
    const directory = ensureDirectory(model).data.directory;
    const [kind, ...parts] = String(id).split("-");
    const collection = { contact: directory.contacts, team: directory.teams }[kind];
    if (!collection) return false;
    const index = collection.findIndex((entry) => String(entry.id) === parts.join("-"));
    return index >= 0 ? Boolean(collection.splice(index, 1)) : false;
  }
};

export function activate(context) { return context.documents.register(adapter.id, adapter); }
