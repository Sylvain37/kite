import { cloneValue, nextNumericId } from "../../shared/data.js";

/** Directory adapter: contacts are the source of tags, team membership and hierarchy. */
export const manifest = { id: "directory", version: "1.0.0", kind: "business" };

// These canonical labels are translated by translateTerm() in the shared renderer.
// Imported values remain untouched unless they match a bundled canonical value.
const DIRECTORY_TERMS = Object.freeze({
  title: "Directory",
  chart: "Organisation chart",
  contact: "contact",
  team: "team",
  members: "members",
  untitled: "Untitled",
  untitledTeam: "Untitled team"
});

const text = (value) => String(value ?? "").trim();
const list = (value) => Array.isArray(value) ? value.flatMap(list) : String(value ?? "").split(",").map(text).filter(Boolean);
const key = (value) => text(value).toLocaleLowerCase();
const field = (name, value, type = "text") => value ? { key: name, label: name, value, type } : null;
const fields = (...entries) => entries.filter(Boolean);

function ensureDirectory(model) {
  model.setup ??= { plugins: [{ name: manifest.id, version: manifest.version }] };
  model.data ??= {};
  model.data.directory ??= {};
  const directory = model.data.directory;
  directory.contacts = Array.isArray(directory.contacts) ? directory.contacts : [];
  directory.teams = Array.isArray(directory.teams) ? directory.teams : [];
  return model;
}

function contactLabel(contact) {
  return text(contact.name) || text(contact.label) || DIRECTORY_TERMS.untitled;
}

function contactTags(contact) {
  return list(contact.tags).map((label) => ({ id: `tag-${key(label)}`, label }));
}

function contactItem(contact) {
  return {
    id: `contact-${contact.id}`,
    label: contactLabel(contact),
    link: text(contact.link),
    tags: contactTags(contact),
    profileTitle: text(contact.role),
    fields: fields(
      field("email", text(contact.email), "email"),
      field("phone", text(contact.phone), "phone"),
      field("organization", text(contact.organization)),
      field("role", text(contact.role))
    )
  };
}

function isMemberOf(contact, team) {
  const references = list(contact.member).map(key);
  return references.includes(key(team.id)) || references.includes(key(team.name)) || references.includes(key(team.label));
}

function teamMembers(team, contacts) {
  return contacts.filter((contact) => isMemberOf(contact, team));
}

function teamItem(team, contacts) {
  const members = teamMembers(team, contacts).map(contactLabel);
  return {
    id: `team-${team.id}`,
    label: text(team.name) || text(team.label) || DIRECTORY_TERMS.untitledTeam,
    displayTags: false,
    fields: fields(field(DIRECTORY_TERMS.members, members.join(" · ")))
  };
}

function resolveParent(reference, contacts, teams) {
  const value = text(reference);
  if (!value) return "";
  const normalized = key(value);
  const typed = normalized.match(/^(contact|team)[:/-](.+)$/);
  if (typed) return `${typed[1]}-${typed[2]}`;
  const contact = contacts.find((entry) => key(entry.id) === normalized || key(contactLabel(entry)) === normalized);
  if (contact) return `contact-${contact.id}`;
  const team = teams.find((entry) => key(entry.id) === normalized || key(entry.name ?? entry.label) === normalized);
  return team ? `team-${team.id}` : "";
}

function organisationChart(contacts, teams) {
  const teamNodes = teams.map((team) => ({
    id: `team-${team.id}`,
    parent: "",
    label: text(team.name) || text(team.label) || DIRECTORY_TERMS.untitledTeam,
    sourceType: DIRECTORY_TERMS.team,
    sourceLabel: text(team.name) || text(team.label) || DIRECTORY_TERMS.untitledTeam
  }));
  const contactNodes = contacts.map((contact) => {
    const explicitParent = resolveParent(contact.parent ?? contact.manager ?? contact.reportsTo, contacts, teams);
    const memberTeam = teams.find((team) => isMemberOf(contact, team));
    const membershipParent = memberTeam ? `team-${memberTeam.id}` : "";
    return {
      id: `contact-${contact.id}`,
      parent: explicitParent || membershipParent,
      label: contactLabel(contact),
      sourceType: DIRECTORY_TERMS.contact,
      sourceLabel: contactLabel(contact)
    };
  });
  return [...teamNodes, ...contactNodes];
}

function toView(model) {
  const directory = ensureDirectory(model).data.directory;
  const items = [
    ...directory.contacts.map(contactItem),
    ...directory.teams.map((team) => teamItem(team, directory.contacts))
  ];
  const chart = organisationChart(directory.contacts, directory.teams);
  if (chart.length) items.push({ id: "directory-orgchart", cardType: "orgchart", label: DIRECTORY_TERMS.chart, orgchart: chart, displayTags: false, fields: [] });
  const tags = new Map();
  for (const contact of directory.contacts) for (const tag of contactTags(contact)) tags.set(tag.id, tag);
  return { type: "directory", title: text(directory.title) || DIRECTORY_TERMS.title, subtitle: text(directory.subtitle), quote: text(directory.quote), tags: [...tags.values()], items };
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
      for (const name of ["role", "email", "phone", "organization", "link", "tags", "member", "parent"]) {
        if (text(values[name])) entry[name] = name === "member" ? list(values[name]) : text(values[name]);
      }
      directory.contacts.push(entry);
      return entry;
    }
    if (type === "team") {
      const entry = { id: nextNumericId(directory.teams), name };
      directory.teams.push(entry);
      return entry;
    }
    throw new Error("Unsupported directory entry type.");
  },
  remove(model, id) {
    const directory = ensureDirectory(model).data.directory;
    const [kind, ...parts] = String(id).split("-");
    const collection = kind === "contact" ? directory.contacts : kind === "team" ? directory.teams : null;
    if (!collection) return false;
    const index = collection.findIndex((entry) => String(entry.id) === parts.join("-"));
    return index >= 0 ? Boolean(collection.splice(index, 1)) : false;
  }
};

export function activate(context) { return context.documents.register(adapter.id, adapter); }
