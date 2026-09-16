import { APP_QUOTE, APP_TITLE } from "../../app/constants.js";
import { t } from "../../i18n.js";
import { cleanText, cloneValue, isScalar, nextNumericId, normalizeKey, normalizeRatio, splitLines, splitList } from "../../shared/data.js";

/**
 * CV business adapter.
 *
 * Structured CV documents receive specialised cards while arbitrary YAML keeps
 * a generic recursive fallback. Schema-normalisation helpers are shared with
 * other plugins to keep business adapters focused on domain rules.
 */
export const manifest = {
  id: "cv",
  version: "1.0.0",
  kind: "business"
};

function inferFieldType(key, value) {
  const normalized = normalizeKey(key);
  if (normalized === "email") return "email";
  if (normalized === "phone") return "phone";
  if (normalized === "illustration") return "image";
  if (normalized === "rate") return "ratio";
  if (normalized === "link" || (typeof value === "string" && /^https?:\/\//i.test(value))) return "url";
  return "text";
}

function createField(key, value, label = key) {
  return { key, label, value, type: inferFieldType(key, value) };
}

function compactFields(fields) {
  return fields.filter((entry) => {
    const value = entry?.value;
    if (value == null || value === "") return false;
    return !Array.isArray(value) || value.length > 0;
  });
}

const RECOGNIZED_KEYS = new Set([
  "firstname", "lastname", "title", "subtitle", "quote", "email", "phone", "location",
  "skill", "skills", "organization", "date", "startdate", "finishdate", "category", "rate",
  "illustration", "link", "label", "tags"
]);


function getObjectLabel(object, path) {
  const value = object.label ?? object.organization ?? object.skill ?? object.title;
  if (value != null && isScalar(value)) return String(value);
  const first = object.firstname ?? object.firstName ?? "";
  const last = object.lastname ?? object.lastName ?? "";
  const name = `${first} ${last}`.trim();
  if (name) return name;
  return path.at(-1) || "Information";
}

function getObjectTags(object) {
  const tags = object.tags ?? object.skills;
  if (!Array.isArray(tags)) return [];
  return tags.filter(isScalar).map((value, index) => ({ id: `${index}-${String(value)}`, label: String(value) }));
}

/** Flatten arbitrary nested YAML objects into generic cards. */
function collectGenericItems(root) {
  const items = [];
  let counter = 0;

  function visit(value, path = []) {
    if (Array.isArray(value)) {
      value.forEach((child, index) => visit(child, [...path, String(index + 1)]));
      return;
    }
    if (!value || typeof value !== "object") return;

    const entries = Object.entries(value);
    const recognizedKeys = entries.map(([key]) => normalizeKey(key)).filter((key) => RECOGNIZED_KEYS.has(key));
    const hasContentField = recognizedKeys.some((key) => !["title", "subtitle", "quote", "firstname", "lastname"].includes(key));
    const leafFields = entries.filter(([, child]) => isScalar(child));
    const meaningful = hasContentField || (leafFields.length >= 2 && path.length > 0);

    if (meaningful) {
      const label = getObjectLabel(value, path);
      const linkEntry = entries.find(([key]) => normalizeKey(key) === "link");
      const tags = getObjectTags(value);
      const fields = entries
        .filter(([key, child]) => isScalar(child) && !["label", "title", "subtitle", "quote", "link"].includes(normalizeKey(key)))
        .map(([key, child]) => ({ key, label: key, value: child, type: inferFieldType(key, child) }));

      items.push({
        id: `cv-${++counter}`,
        label,
        link: linkEntry && isScalar(linkEntry[1]) ? String(linkEntry[1]) : "",
        tags,
        fields
      });
    }

    for (const [key, child] of entries) {
      if (child && typeof child === "object") visit(child, [...path, key]);
    }
  }

  visit(root, []);
  return items;
}

function findFirstScalar(object, keys) {
  if (!object || typeof object !== "object") return "";
  for (const key of keys) {
    const direct = Object.entries(object).find(([candidate, value]) => normalizeKey(candidate) === key && isScalar(value));
    if (direct) return String(direct[1] ?? "");
  }
  return "";
}

function genericCvView(model) {
  const data = model?.data && typeof model.data === "object" ? model.data : model;
  let title = findFirstScalar(data, ["title", "label"]);
  if (!title) {
    const first = findFirstScalar(data, ["firstname"]);
    const last = findFirstScalar(data, ["lastname"]);
    title = `${first} ${last}`.trim() || "Document";
  }

  const items = collectGenericItems(data);
  const tagMap = new Map();
  for (const item of items) {
    for (const tag of item.tags ?? []) {
      const key = String(tag.label).toLocaleLowerCase();
      if (!tagMap.has(key)) tagMap.set(key, { id: key, label: String(tag.label) });
      tag.id = key;
    }
  }

  return {
    type: "cv",
    title,
    subtitle: findFirstScalar(data, ["subtitle"]),
    quote: findFirstScalar(data, ["quote"]),
    tags: [...tagMap.values()],
    items
  };
}

/** Build the specialised CV view while resolving tag references from the catalog. */
function structuredCvView(model) {
  const data = model.data;
  const cv = data.cv;
  const catalog = new Map(
    (Array.isArray(data.tags) ? data.tags : [])
      .filter((tag) => tag && typeof tag === "object" && tag.id != null)
      .map((tag) => [String(tag.id), tag])
  );
  const usedTags = new Map();

  function resolveTag(reference) {
    const object = reference && typeof reference === "object" ? reference : { id: reference };
    if (object.id == null) return null;

    const id = String(object.id);
    const source = catalog.get(id);
    const label = String(source?.label ?? object.label ?? object.id);
    const rate = normalizeRatio(object.rate ?? source?.rate);
    const tag = { id, label };
    if (rate != null) tag.rate = rate;

    const previous = usedTags.get(id);
    if (!previous) {
      usedTags.set(id, { ...tag });
    } else if (rate != null) {
      previous.rate = previous.rate == null ? rate : Math.max(previous.rate, rate);
    }
    return tag;
  }

  function resolveTags(references) {
    return (Array.isArray(references) ? references : [])
      .map(resolveTag)
      .filter(Boolean);
  }

  const items = [];
  const fullName = [cv.firstName, cv.lastName].filter((value) => value != null && value !== "").join(" ").trim();

  const profileTags = [];
  const socialFields = [];
  for (const [index, social] of (Array.isArray(cv.social) ? cv.social : []).entries()) {
    const tag = resolveTag(social);
    if (tag) profileTags.push(tag);
    const link = isScalar(social?.link) ? String(social.link ?? "") : "";
    if (link) {
      const socialLabel = tag?.label ?? t("socialLink", { index: index + 1 });
      socialFields.push({
        key: `social-${index + 1}`,
        label: socialLabel,
        value: link,
        type: "url",
        icon: normalizeKey(socialLabel) === "linkedin" ? "linkedin" : "link"
      });
    }
  }

  const profileFields = compactFields([
    { ...createField("phone", cv.phone, "phone"), icon: "phone" },
    { ...createField("email", cv.email, "email"), icon: "email" },
    ...socialFields,
    { ...createField("location", cv.location, "location"), icon: "location" },
    createField("illustration", cv.illustration, "illustration")
  ]);
  if (profileFields.length || fullName) {
    items.push({
      id: "cv-profile",
      cardType: "profile",
      label: fullName || String(cv.title ?? t("profile")),
      link: "",
      tags: profileTags,
      displayTags: false,
      fieldsLayout: "inline-contact",
      profileTitle: cv.title == null ? "" : String(cv.title),
      profileQuote: cv.quote == null ? APP_QUOTE : String(cv.quote),
      fields: profileFields
    });
  }

  // Section headings are semantic UI labels, not document data. They are
  // resolved through i18n when the view is built; main.js rebuilds the view on
  // locale changes so these headings always follow the active language.
  const languageTags = [];
  for (const language of (Array.isArray(cv.languages) ? cv.languages : [])) {
    const tag = resolveTag(language);
    if (tag) languageTags.push(tag);
  }
  if (languageTags.length) {
    items.push({
      id: "cv-languages",
      label: t("languages"),
      link: "",
      tags: languageTags,
      displayTagRates: true,
      fields: []
    });
  }

  const courseTags = [];
  const courseFields = [];
  for (const [index, course] of (Array.isArray(cv.courses) ? cv.courses : []).entries()) {
    const tag = resolveTag(course);
    if (tag) courseTags.push(tag);

    const date = course?.date == null ? "" : String(course.date);
    const location = course?.location == null ? "" : String(course.location);
    const details = [date, location].filter(Boolean).join(" \u00B7 ");

    courseFields.push({
      ...createField(
        `course-${index + 1}`,
        details || tag?.label || t("courseFallback", { index: index + 1 }),
        tag?.label ?? t("courseFallback", { index: index + 1 })
      ),
      courseMeta: { date, location }
    });
  }
  if (courseFields.length) {
    items.push({
      id: "cv-courses",
      label: t("courses"),
      link: "",
      tags: courseTags,
      displayTags: false,
      fieldLabelClass: "profile-title",
      fields: courseFields
    });
  }

  for (const [index, experience] of (Array.isArray(cv.experiences) ? cv.experiences : []).entries()) {
    const tags = resolveTags(experience?.employedSkills);
    items.push({
      id: `cv-experience-${index + 1}`,
      cardType: "experience",
      label: String(experience?.title ?? experience?.organization ?? t("experienceFallback", { index: index + 1 })),
      link: isScalar(experience?.link) ? String(experience.link ?? "") : "",
      tags,
      experience: {
        title: String(experience?.title ?? experience?.organization ?? t("experienceFallback", { index: index + 1 })),
        subtitle: experience?.subtitle == null ? "" : String(experience.subtitle),
        organization: experience?.organization == null ? "" : String(experience.organization),
        kind: experience?.kind == null ? "" : String(experience.kind),
        format: experience?.format == null ? "" : String(experience.format),
        location: experience?.location == null ? "" : String(experience.location),
        startDate: experience?.startDate == null ? "" : String(experience.startDate),
        finishDate: experience?.finishDate == null ? "" : String(experience.finishDate),
        illustration: experience?.illustration == null ? "" : String(experience.illustration),
        achievements: Array.isArray(experience?.achievements) ? experience.achievements.map((value) => String(value)) : []
      },
      fields: compactFields([
        createField("subtitle", experience?.subtitle, "subtitle"),
        createField("organization", experience?.organization, "organization"),
        createField("kind", experience?.kind, "kind"),
        createField("format", experience?.format, "format"),
        createField("location", experience?.location, "location"),
        createField("startDate", experience?.startDate, "startDate"),
        createField("finishDate", experience?.finishDate, "finishDate"),
        createField("illustration", experience?.illustration, "illustration"),
        createField("achievements", experience?.achievements, "achievements")
      ])
    });
  }

  const orderedTags = [];
  const appended = new Set();
  for (const source of (Array.isArray(data.tags) ? data.tags : [])) {
    const id = source?.id == null ? null : String(source.id);
    if (id == null || !usedTags.has(id)) continue;
    orderedTags.push({ ...usedTags.get(id) });
    appended.add(id);
  }
  for (const [id, tag] of usedTags) {
    if (!appended.has(id)) orderedTags.push({ ...tag });
  }

  return {
    type: "cv",
    title: fullName || String(cv.title ?? APP_TITLE),
    subtitle: cv.title == null ? "" : String(cv.title),
    quote: cv.quote == null ? APP_QUOTE : String(cv.quote),
    tags: orderedTags,
    items
  };
}


/** Ensure mutable CV collections exist before wizard additions. */
function ensureStructuredCv(model) {
  model.data ??= {};
  model.data.cv ??= {};
  model.data.tags = Array.isArray(model.data.tags) ? model.data.tags : [];
  const cv = model.data.cv;
  cv.languages = Array.isArray(cv.languages) ? cv.languages : [];
  cv.courses = Array.isArray(cv.courses) ? cv.courses : [];
  cv.experiences = Array.isArray(cv.experiences) ? cv.experiences : [];
  return model;
}


function findOrCreateTag(documentObject, label) {
  const cleanLabel = String(label ?? "").trim();
  if (!cleanLabel) return null;
  const tags = documentObject.data.tags;
  let tag = tags.find((item) => String(item?.label ?? "").localeCompare(cleanLabel, undefined, { sensitivity: "accent" }) === 0);
  if (!tag) {
    tag = { id: nextNumericId(tags, 0), label: cleanLabel };
    tags.push(tag);
  }
  return tag;
}

function rateFromPercent(value) {
  if (value === "" || value == null) return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.min(100, number)) / 100;
}


const adapter = {
  id: "cv",

  probe(documentObject) {
    if (documentObject?.data?.cv && typeof documentObject.data.cv === "object" && !Array.isArray(documentObject.data.cv)) return 120;
    const declared = documentObject?.setup?.plugins?.some?.((plugin) => plugin?.name === "cv");
    if (declared) return 20;
    return documentObject && typeof documentObject === "object" ? 5 : 0;
  },

  load(documentObject) {
    return cloneValue(documentObject);
  },

  serialize(model) {
    return cloneValue(model);
  },

  toView(model) {
    if (model?.data?.cv && typeof model.data.cv === "object" && !Array.isArray(model.data.cv)) {
      return structuredCvView(model);
    }

    return genericCvView(model);
  },

  add(model, values) {
    const documentObject = ensureStructuredCv(model);
    const cv = documentObject.data.cv;
    const type = cleanText(values.type);

    if (type === "language") {
      const tag = findOrCreateTag(documentObject, values.label);
      if (!tag) throw new Error(t("languageNameRequired"));
      const language = { id: tag.id };
      const rate = rateFromPercent(values.rate);
      if (rate != null) language.rate = rate;
      cv.languages.push(language);
      return language;
    }

    if (type === "course") {
      const tag = findOrCreateTag(documentObject, values.label);
      if (!tag) throw new Error(t("courseNameRequired"));
      const course = { id: tag.id };
      const rate = rateFromPercent(values.rate);
      if (rate != null) course.rate = rate;
      if (cleanText(values.date)) course.date = cleanText(values.date);
      if (cleanText(values.location)) course.location = cleanText(values.location);
      cv.courses.push(course);
      return course;
    }

    if (type === "experience") {
      const title = cleanText(values.title);
      if (!title) throw new Error(t("experienceTitleRequired"));
      const experience = { title };
      for (const key of ["subtitle", "organization", "kind", "format", "location", "startDate", "finishDate"]) {
        const value = cleanText(values[key]);
        if (value) experience[key] = value;
      }
      const illustration = cleanText(values.illustration);
      if (/^data:image\/(?:png|jpe?g|webp);base64,/i.test(illustration)) experience.illustration = illustration;
      const skills = splitList(values.skills)
        .map((label) => findOrCreateTag(documentObject, label))
        .filter(Boolean)
        .map((tag) => ({ id: tag.id }));
      if (skills.length) experience.employedSkills = skills;
      const achievements = splitLines(values.achievements);
      if (achievements.length) experience.achievements = achievements;
      cv.experiences.push(experience);
      return experience;
    }

    throw new Error(t("unsupportedCvItemType"));
  }
};

/** Register the CV adapter and return the kernel cleanup callback. */
export function activate(context) {
  return context.documents.register(adapter.id, adapter);
}
