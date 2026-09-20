import { createRuntime } from "./kernel/runtime.js";
import { loadFoundationModules } from "./app/foundation-modules.js";
import { DocumentPluginResolver, selectDocumentAdapter } from "./app/document-plugin-resolver.js";
import { downloadText, fetchJson, fetchText, getFileExtension, readLocalFile } from "./platform/file-gateway.js";
import { registerServiceWorker } from "./platform/pwa.js";
import { loadStylesheet } from "./platform/stylesheet.js";
import { currentLocale, localizeStaticDom, normalizeLocale, supportedLocales, t, translateTerm } from "./i18n.js";
import { APP_QUOTE, APP_TITLE } from "./app/constants.js";
import { escapeHtml, sanitizeImageUrl, sanitizeUrl } from "./shared/dom.js";

/**
 * Application controller: coordinates the kernel, adapters and DOM rendering.
 * Domain-specific parsing stays in plugins; this module owns UI state and events.
 */

const THEME_MODES = new Set(["system", "light", "dark"]);

const runtime = createRuntime();
const resolver = new DocumentPluginResolver(runtime);

// Central mutable UI state. Business document state itself remains owned by adapters.
const state = {
  config: null,
  adapter: null,
  model: null,
  view: null,
  sections: [],
  sectionAdapters: [],
  activeSection: null,
  sourceName: "document.yml",
  selectedTag: null,
  query: "",
  showStatistics: false,
  preferencesReady: false,
  wizardStep: 0,
  settingsNotificationCount: 0,
  saveNotificationCount: 0
};

const elements = {
  html: document.documentElement,
  settingsButton: document.querySelector("#settingsButton"),
  settingsNotificationBadge: document.querySelector("#settingsNotificationBadge"),
  settingsPanel: document.querySelector("#settingsPanel"),
  languageOptions: document.querySelector("#languageOptions"),
  themeSelect: document.querySelector("#themeSelect"),
  themeColorMeta: document.querySelector('meta[name="theme-color"]'),
  themeModeButtons: [...document.querySelectorAll("[data-theme-mode-value]")],
  layoutOptions: document.querySelector("#layoutOptions"),
  statisticsToggle: document.querySelector("#statisticsToggle"),
  importButton: document.querySelector("#importButton"),
  saveButton: document.querySelector("#saveButton"),
  saveNotificationBadge: document.querySelector("#saveNotificationBadge"),
  fileInput: document.querySelector("#fileInput"),
  title: document.querySelector("#appName"),
  quote: document.querySelector("#appDescription"),
  search: document.querySelector("#searchInput"),
  addButton: document.querySelector("#addButton"),
  addButtonSymbol: document.querySelector("#addButton .add-button-symbol"),
  wizard: document.querySelector("#wizard"),
  wizardForm: document.querySelector("#wizardForm"),
  wizardTrack: document.querySelector("#wizardTrack"),
  contextMenu: document.querySelector("#contextMenu"),
  contextMenuNavigation: document.querySelector("#contextMenuNavigation"),
  settingsSlot: document.querySelector(".context-menu-settings"),
  activeContentTools: document.querySelector(".active-content-tools"),
  activeContent: document.querySelector("#activeContent"),
  activeContentMenu: document.querySelector("#activeContentMenu"),
  tagsTitle: document.querySelector("#tagsTitle"),
  tagsList: document.querySelector("#tagsList"),
  itemsList: document.querySelector("#itemsList"),
  emptyState: document.querySelector("#emptyState"),
  toast: document.querySelector("#toast")
};

let wizardController = null;
let wizardLoading = null;

async function ensureWizardController() {
  if (!wizardLoading) {
    wizardLoading = Promise.all([
      import("./app/wizard.js"),
      loadStylesheet("./css/wizard.css", "feature:wizard")
    ]).then(([module]) => {
      wizardController = module.createWizardController({
        elements, state, runtime, activeContentAdapter, syncContextualTools,
        incrementChangeNotifications, refreshView, showToast
      });
      return wizardController;
    }).catch((error) => {
      wizardLoading = null;
      throw error;
    });
  }
  return wizardLoading;
}

function closeWizard() { wizardController?.close(); }

// ---- Preferences and foundation-driven UI options ---------------------------------

function getStoredPreference(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function setStoredPreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
  }
}

/** Valid URL choices override saved preferences without changing them on load. */
function getUrlPreference(key, isValid) {
  const value = new URLSearchParams(window.location.search).get(key)?.trim();
  return value && isValid(value) ? value : null;
}

/** Keep the address shareable when a visitor changes a setting. */
function syncUrlPreferences() {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", currentLocale());
  if (state.preferencesReady) {
    url.searchParams.set("theme", elements.html.dataset.theme);
    url.searchParams.set("color", elements.html.dataset.themeMode);
    url.searchParams.set("layout", elements.html.dataset.layout);
    url.searchParams.set("stats", String(state.showStatistics));
  }
  try {
    window.history.replaceState(window.history.state, "", url);
  } catch {
    // Some local-file browsers do not allow changing the address bar.
  }
}

const LOCALE_FLAG_SVGS = Object.freeze({
  gb: '<svg class="language-option-flag" aria-hidden="true" viewBox="0 0 60 30" focusable="false"><rect width="60" height="30" fill="#012169"/><path d="M0 0 60 30M60 0 0 30" stroke="#fff" stroke-width="6"/><path d="M0 0 60 30M60 0 0 30" stroke="#c8102e" stroke-width="2"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#c8102e" stroke-width="6"/></svg>',
  fr: '<svg class="language-option-flag" aria-hidden="true" viewBox="0 0 3 2" focusable="false"><path d="M0 0h1v2H0z" fill="#002654"/><path d="M1 0h1v2H1z" fill="#fff"/><path d="M2 0h1v2H2z" fill="#ed2939"/></svg>'
});

/**
 * Build the locale buttons from js/i18n.js instead of hard-coding language
 * metadata into the document shell. This keeps locale availability, flat flag
 * SVGs and language names in one maintainable place.
 */
function renderLanguageOptions() {
  elements.languageOptions.innerHTML = supportedLocales().map((locale) => `
    <button class="secondary-button setting-option language-option" type="button"
      data-locale-value="${escapeHtml(locale.code)}" aria-pressed="false" aria-label="${escapeHtml(locale.name)}">
      ${LOCALE_FLAG_SVGS[locale.flag] ?? ""}
    </button>`).join("");
}

/** Keep the visual and accessibility state of locale buttons in sync. */
function syncLanguageOptions() {
  const locale = currentLocale();
  elements.languageOptions.querySelectorAll("[data-locale-value]").forEach((button) => {
    const isActive = button.dataset.localeValue === locale;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

/**
 * Switch the whole interface locale and persist the preference. Static strings
 * are translated in-place; dynamic cards, counters and the current wizard are
 * rebuilt so a language change is immediate and does not require a reload.
 */
function applyLocale(locale, { persist = true, rerender = true } = {}) {
  const value = normalizeLocale(locale);
  const wizardSnapshot = rerender ? wizardController?.snapshot() : null;

  elements.html.lang = value;
  if (persist) setStoredPreference("kite.locale", value);

  localizeStaticDom();
  syncLanguageOptions();
  if (runtime.layouts.size) renderLayoutOptions();
  elements.statisticsToggle.innerHTML = settingsOptionIcon("statistics");
  elements.statisticsToggle.setAttribute("aria-label", state.showStatistics ? t("hide") : t("show"));
  updateSettingsNotification();
  updateSaveNotification();

  // Rebuild adapter views instead of repainting the previous view object. Some
  // adapters resolve semantic labels with t() while producing their normalised
  // view, so rebuilding guarantees that titles such as Languages/Courses are
  // regenerated in the newly selected locale rather than remaining stale.
  if (rerender && state.view) refreshView();
  if (wizardSnapshot) wizardController.restore(wizardSnapshot);

  runtime.emit("locale:changed", value);
}

/** Theme plugins register families; each family supports the same three color modes. */
function renderThemeOptions() {
  elements.themeSelect.innerHTML = runtime.themes.entries().map(([id, theme]) =>
    `<option value="${escapeHtml(id)}">${escapeHtml(theme.label)}</option>`
  ).join("");
}

function syncBrowserThemeColor() {
  const color = getComputedStyle(elements.html).getPropertyValue("--background").trim();
  if (color) elements.themeColorMeta?.setAttribute("content", color);
}

let themeChangeId = 0;
async function applyTheme(theme, mode = elements.html.dataset.themeMode, { persist = true } = {}) {
  const requestId = ++themeChangeId;
  const value = runtime.themes.has(theme) ? theme : state.config.defaults.theme;
  const selectedMode = THEME_MODES.has(mode) ? mode : "system";
  const stylesheet = runtime.themes.get(value)?.stylesheet;
  if (stylesheet) await loadStylesheet(stylesheet, `theme:${value}`);
  if (requestId !== themeChangeId) return;
  elements.html.dataset.theme = value;
  elements.html.dataset.themeMode = selectedMode;
  syncBrowserThemeColor();
  elements.themeSelect.value = value;
  elements.themeModeButtons.forEach((button) => {
    const isActive = button.dataset.themeModeValue === selectedMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  if (persist) {
    setStoredPreference("kite.theme", value);
    setStoredPreference("kite.themeMode", selectedMode);
  }
  runtime.emit("theme:changed", { theme: value, mode: selectedMode });
  syncSettingsPlacement();
}

/** Layout choices come from installed layout plugins, not the document shell. */
function settingsOptionIcon(name) {
  const paths = {
    classic: '<path d="M4 5h16M4 12h16M4 19h16"/>',
    workspace: '<path d="M4 4h6v16H4zM14 4h6v7h-6zM14 15h6v5h-6z"/>',
    statistics: '<path d="M4 19V10M10 19V5M16 19v-7M22 19V8"/>'
  };
  return `<svg class="setting-option-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] ?? paths.classic}</svg>`;
}

function renderLayoutOptions() {
  elements.layoutOptions.innerHTML = runtime.layouts.entries().map(([id, layout]) => {
    const label = layout.labelKey ? t(layout.labelKey) : layout.label ?? id;
    return `<button class="secondary-button setting-option" type="button" data-layout-value="${escapeHtml(id)}" aria-pressed="false" aria-label="${escapeHtml(label)}">${settingsOptionIcon(id)}</button>`;
  }).join("");
  syncLayoutOptions();
}

function syncLayoutOptions() {
  elements.layoutOptions.querySelectorAll("[data-layout-value]").forEach((button) => {
    const isActive = button.dataset.layoutValue === elements.html.dataset.layout;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

const classicNarrowScreen = window.matchMedia("(max-width: 760px)");

function syncSettingsPlacement() {
  const target = classicNarrowScreen.matches && elements.html.dataset.theme === "selene"
    ? elements.activeContentTools
    : elements.contextMenuNavigation;
  if (elements.settingsSlot.parentElement !== target) target.append(elements.settingsSlot);
}

/** Keep tags adjacent to the statistics panel in the compact document flow. */
function syncTagsPlacement() {
  if (!classicNarrowScreen.matches) {
    if (elements.tagsList.previousElementSibling !== elements.tagsTitle) {
      elements.tagsTitle.after(elements.tagsList);
    }
    return;
  }

  const statisticsPanel = elements.itemsList.querySelector("#statisticsPanel");
  if (statisticsPanel) statisticsPanel.after(elements.tagsList);
  else elements.itemsList.prepend(elements.tagsList);
}

function syncActiveContentMenuOrientation() {
  const horizontal = classicNarrowScreen.matches;
  elements.activeContentMenu.setAttribute("aria-orientation", horizontal ? "horizontal" : "vertical");
}

let layoutChangeId = 0;
async function applyLayout(layout, { persist = true } = {}) {
  const requestId = ++layoutChangeId;
  const fallback = runtime.layouts.has(state.config.defaults.layout)
    ? state.config.defaults.layout
    : runtime.layouts.keys()[0];
  const value = runtime.layouts.has(layout) ? layout : fallback;
  if (!value) throw new Error("No document layouts are installed.");
  const stylesheet = runtime.layouts.get(value)?.stylesheet;
  if (stylesheet) await loadStylesheet(stylesheet, `layout:${value}`);
  if (requestId !== layoutChangeId) return;
  elements.html.dataset.layout = value;
  syncActiveContentMenuOrientation();
  syncLayoutOptions();
  if (persist) setStoredPreference("kite.layout", value);
  runtime.emit("layout:changed", value);
}

function applyStatisticsVisibility(enabled, { persist = true } = {}) {
  state.showStatistics = Boolean(enabled);
  elements.statisticsToggle.classList.toggle("is-active", state.showStatistics);
  elements.statisticsToggle.setAttribute("aria-pressed", String(state.showStatistics));
  elements.statisticsToggle.innerHTML = settingsOptionIcon("statistics");
  elements.statisticsToggle.setAttribute("aria-label", state.showStatistics ? t("hide") : t("show"));
  if (persist) setStoredPreference("kite.statistics", state.showStatistics ? "true" : "false");
  renderStatistics();
}

function codecForFilename(filename) {
  const extension = getFileExtension(filename);
  return runtime.codecs.values().find((codec) => codec.extensions?.includes(extension)) ?? null;
}

function declaredDocumentAdapters(documentObject, primaryAdapter) {
  const declarations = Array.isArray(documentObject?.setup?.plugins) ? documentObject.setup.plugins : [];
  const adapters = [];
  const seen = new Set();

  for (const declaration of declarations) {
    const id = String(declaration?.name ?? "");
    const adapter = runtime.documents.get(id);
    const score = Number(adapter?.probe?.(documentObject) ?? 0);
    if (!adapter || seen.has(adapter.id) || !Number.isFinite(score) || score <= 0) continue;
    adapters.push(adapter);
    seen.add(adapter.id);
  }

  if (!seen.has(primaryAdapter.id)) adapters.unshift(primaryAdapter);
  return adapters;
}

// ---- Document loading and adapter selection ---------------------------------------

async function loadParsedDocument(documentObject, sourceName) {
  await resolver.loadDeclared(documentObject);
  const adapter = selectDocumentAdapter(runtime, documentObject);
  state.adapter = adapter;
  state.sectionAdapters = declaredDocumentAdapters(documentObject, adapter);
  state.model = adapter.load(documentObject);
  state.sourceName = sourceName || "document.yml";
  state.selectedTag = null;
  state.query = "";
  state.activeSection = null;
  elements.search.value = "";
  closeWizard();
  refreshView();
  runtime.emit("document:loaded", { adapter: adapter.id, sourceName: state.sourceName });
}

async function loadConfiguredDocument() {
  const url = new URL(state.config.document, document.baseURI);
  const codec = codecForFilename(url.pathname);
  if (!codec) throw new Error(`No codec is available for ${url.pathname}.`);
  const text = await fetchText(url.href);
  const parsed = codec.parse(text);
  await loadParsedDocument(parsed, url.pathname.split("/").pop() || "default.yml");
}

function refreshView() {
  state.view = state.adapter.toView(state.model);
  state.sections = state.sectionAdapters.map((adapter) => ({
    id: adapter.id,
    adapter,
    view: adapter.id === state.adapter.id
      ? state.view
      : adapter.toView(adapter.load(state.model))
  }));
  render();
}

function setOptionalText(element, value) {
  const text = String(value ?? "").trim();
  element.textContent = text;
  element.hidden = !text;
}

// ---- Search, filtering and contextual tags ----------------------------------------

function normalizeSearchText(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function searchableItem(item) {
  const canonicalValues = [
    item.label,
    ...(item.tags ?? []).map((tag) => tag.label),
    ...(item.fields ?? []).flatMap((field) => [field.label, typeof field.value === "object" ? JSON.stringify(field.value) : field.value])
  ];
  const localizedValues = canonicalValues.map((value) => translateTerm(value));
  return normalizeSearchText([...canonicalValues, ...localizedValues].join(" "));
}

function filteredItems(view = state.view) {
  const query = normalizeSearchText(state.query.trim());
  return (view?.items ?? []).filter((item) => {
    const matchesTag = !state.selectedTag || (item.tags ?? []).some((tag) => String(tag.id) === String(state.selectedTag));
    const matchesQuery = !query || searchableItem(item).includes(query);
    return matchesTag && matchesQuery;
  });
}

function activeSectionTags() {
  const section = activeContentSection() ?? state.sections[0] ?? null;
  if (!section) return [];

  const usedTags = new Map();
  for (const item of section.view?.items ?? []) {
    for (const tag of item.tags ?? []) {
      if (tag?.id == null) continue;
      const id = String(tag.id);
      const previous = usedTags.get(id);
      if (!previous) {
        usedTags.set(id, { ...tag, id });
        continue;
      }
      const previousRate = Number(previous.rate);
      const nextRate = Number(tag.rate);
      if (Number.isFinite(nextRate) && (!Number.isFinite(previousRate) || nextRate > previousRate)) {
        previous.rate = nextRate;
      }
    }
  }

  const tags = [];
  const appended = new Set();
  for (const catalogTag of section.view?.tags ?? []) {
    if (catalogTag?.id == null) continue;
    const id = String(catalogTag.id);
    const usedTag = usedTags.get(id);
    if (!usedTag) continue;
    tags.push({ ...catalogTag, ...usedTag, id });
    appended.add(id);
  }
  for (const [id, tag] of usedTags) {
    if (!appended.has(id)) tags.push({ ...tag, id });
  }
  return tags;
}

function renderTags() {
  const tags = activeSectionTags();
  elements.contextMenu.hidden = false;
  elements.tagsTitle.hidden = tags.length === 0;
  elements.tagsList.hidden = tags.length === 0;
  elements.tagsList.innerHTML = tags.map((tag) => {
    const active = String(tag.id) === String(state.selectedTag);
    const rawRate = tag.rate;
    const numericRate = rawRate == null || rawRate === "" ? NaN : Number(rawRate);
    const hasRate = Number.isFinite(numericRate);
    const rate = hasRate ? Math.max(0, Math.min(1, numericRate)) : 0;
    const percent = Math.round(rate * 100);
    const rateAttributes = hasRate
      ? ` style="--tag-rate: ${percent}%" data-rate="${rate}" title="${escapeHtml(translateTerm(tag.label))} — ${percent}%" aria-label="${escapeHtml(translateTerm(tag.label))} — ${percent}%"`
      : "";
    return `<button class="tag-pill${active ? " is-active" : ""}" type="button" data-tag-id="${escapeHtml(tag.id)}" aria-pressed="${active}"${rateAttributes}><span>${escapeHtml(translateTerm(tag.label))}</span></button>`;
  }).join("");
  syncTagsPlacement();
}

function statisticsData(section = activeContentSection()) {
  if (!section) return null;

  const sectionId = String(section.id);
  const visibleItems = filteredItems(section.view);
  const isCv = sectionId === "cv";
  const hasStructuredCvExperiences = isCv && (section.view?.items ?? []).some((item) => item.cardType === "experience");
  const sourceItems = hasStructuredCvExperiences
    ? visibleItems.filter((item) => item.cardType === "experience")
    : visibleItems;
  const usage = new Map();

  for (const item of sourceItems) {
    const seen = new Set();
    for (const tag of item.tags ?? []) {
      if (tag?.id == null || seen.has(String(tag.id))) continue;
      const id = String(tag.id);
      seen.add(id);
      const current = usage.get(id) ?? { id, label: translateTerm(String(tag.label ?? tag.id)), count: 0 };
      current.count += 1;
      usage.set(id, current);
    }
  }

  const totalItems = sourceItems.length;
  const entries = [...usage.values()]
    .map((entry) => ({
      ...entry,
      percent: totalItems ? Math.round((entry.count / totalItems) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, undefined, { sensitivity: "base" }))
    .slice(0, 10);

  return {
    title: isCv ? t("skillUsage") : t("tagUsage"),
    emptyLabel: isCv ? t("noSkillUsage") : t("noTagUsage"),
    itemLabel: isCv ? t(totalItems === 1 ? "experienceSingular" : "experiencePlural") : t(totalItems === 1 ? "itemSingular" : "itemPlural"),
    totalItems,
    entries
  };
}

function statisticsMarkup(section = activeContentSection()) {
  if (!state.showStatistics) return "";
  const data = statisticsData(section);
  if (!data) return "";

  const body = data.entries.length
    ? `<div class="statistics-chart" role="list" aria-label="${escapeHtml(data.title)}">${data.entries.map((entry) => `
        <div class="statistics-row" role="listitem">
          <span class="item-tag" title="${escapeHtml(entry.label)}">${escapeHtml(entry.label)}</span>
          <span class="statistics-bar" aria-hidden="true"><span style="--statistics-value: ${entry.percent}%"></span></span>
          <span class="statistics-value" aria-label="${entry.count}">${entry.count}</span>
        </div>`).join("")}
      </div>`
    : `<p class="statistics-empty">${escapeHtml(data.emptyLabel)}</p>`;

  return `<section id="statisticsPanel" class="statistics-panel no-print" aria-labelledby="statisticsTitle">
    <div class="statistics-heading">
      <h3 id="statisticsTitle">${escapeHtml(data.title)}</h3>
    </div>
    ${body}
    <div class="statistics-count">
      <h3 class="count-heading">${escapeHtml(t("itemCount"))}</h3>
      <span class="statistics-total">${data.totalItems} ${escapeHtml(data.itemLabel)}</span>
    </div>
  </section>`;
}

function renderStatistics() {
  const current = elements.itemsList.querySelector("#statisticsPanel");
  const markup = statisticsMarkup();

  if (!markup) {
    current?.remove();
    return;
  }

  const template = document.createElement("template");
  template.innerHTML = markup.trim();
  const next = template.content.firstElementChild;
  if (!next) return;

  if (current) {
    current.replaceWith(next);
    return;
  }

  elements.itemsList.prepend(next);
}

function displayValue(value) {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(displayValue).filter(Boolean).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return translateTerm(String(value));
}

// ---- Generic and CV-aware rendering ------------------------------------------------

const FIELD_SYMBOLS = {
  duration: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm11 8H6v10h12V10ZM6 8h12V6h-1v1h-2V6H9v1H7V6H6v2Zm5 4h2v4.2l2.6 1.5-1 1.7-3.6-2.1V12Z"/></svg>`,
  location: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.4 6-12a6 6 0 1 0-12 0c0 6.6 6 12 6 12Zm0-9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"/></svg>`,
  kind: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4h6a2 2 0 0 1 2 2v1h4v13H3V7h4V6a2 2 0 0 1 2-2Zm6 3V6H9v1h6Zm4 5H5v6h14v-6Zm0-3H5v1h14V9Z"/></svg>`,
  format: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h18v13H3V4Zm2 2v9h14V6H5Zm4 13h6v2H9v-2Z"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 3.5 4.6 4.7c-.8.4-1.2 1.3-1 2.2 1.5 6.8 6.7 12 13.5 13.5.9.2 1.8-.2 2.2-1l1.2-2.6c.4-.8.1-1.8-.7-2.3l-3-1.7c-.7-.4-1.6-.3-2.2.3l-1.3 1.3a13.2 13.2 0 0 1-3.7-3.7l1.3-1.3c.6-.6.7-1.5.3-2.2l-1.7-3c-.5-.8-1.5-1.1-2.3-.7Z"/></svg>`,
  email: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3V5Zm2 2v.3l7 5.2 7-5.2V7H5Zm14 10V9.8l-7 5.2-7-5.2V17h14Z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.3 3.8A2.3 2.3 0 1 1 5.3 8.4a2.3 2.3 0 0 1 0-4.6ZM3.4 9.8h3.8V21H3.4V9.8Zm6.1 0h3.6v1.5h.1c.5-.9 1.7-1.9 3.6-1.9 3.8 0 4.5 2.5 4.5 5.8V21h-3.8v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21H9.5V9.8Z"/></svg>`,
  link: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 14.5 14.5 9l1.5 1.4-5 5.5-1.5-1.4Zm-4.8 3.8a4 4 0 0 1 0-5.7l3-3a4 4 0 0 1 5.7 0l.6.6-1.4 1.4-.6-.6a2 2 0 0 0-2.9 0l-3 3a2 2 0 1 0 2.9 2.9l1.1-1.1 1.4 1.4-1.1 1.1a4 4 0 0 1-5.7 0Zm6-4.5-.6-.6 1.4-1.4.6.6a2 2 0 0 0 2.9 0l3-3A2 2 0 1 0 15.1 6l-1.1 1-1.4-1.4 1.1-1.1a4 4 0 0 1 5.7 5.7l-3 3a4 4 0 0 1-5.7 0Z"/></svg>`
};

function renderFieldLabel(field, label, labelClass = "") {
  const symbol = FIELD_SYMBOLS[field.icon];
  const classes = [symbol ? "field-symbol" : "", labelClass].filter(Boolean).join(" ");
  const classAttribute = classes ? ` class="${escapeHtml(classes)}"` : "";
  if (!symbol) return `<dt${classAttribute}>${label}</dt>`;
  return `<dt${classAttribute} title="${label}" aria-label="${label}">${symbol}</dt>`;
}

function renderItemTag(tag, showRate) {
  const label = escapeHtml(translateTerm(tag.label));
  const numericRate = tag.rate == null || tag.rate === "" ? NaN : Number(tag.rate);
  const hasRate = showRate && Number.isFinite(numericRate);
  if (!hasRate) return `<span class="item-tag">${label}</span>`;

  const rate = Math.max(0, Math.min(1, numericRate));
  const percent = Math.round(rate * 100);
  return `<span class="item-tag has-rate" style="--tag-rate: ${percent}%" data-rate="${rate}" title="${label} — ${percent}%" aria-label="${label} — ${percent}%"><span>${label}</span></span>`;
}

function renderInlineContactField(field) {
  const label = escapeHtml(translateTerm(field.label ?? field.key ?? ""));
  const value = displayValue(field.value);
  const type = field.type ?? "text";
  const symbol = FIELD_SYMBOLS[field.icon];
  let rendered;

  if (type === "email") {
    const url = sanitizeUrl(`mailto:${value}`);
    rendered = url ? `<a href="${escapeHtml(url)}">${escapeHtml(value)}</a>` : `<span>${escapeHtml(value)}</span>`;
  } else if (type === "phone") {
    const url = sanitizeUrl(`tel:${value}`);
    rendered = url ? `<a href="${escapeHtml(url)}">${escapeHtml(value)}</a>` : `<span>${escapeHtml(value)}</span>`;
  } else if (type === "url") {
    const url = sanitizeUrl(value);
    rendered = url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(value)}</a>` : `<span>${escapeHtml(value)}</span>`;
  } else {
    rendered = `<span>${escapeHtml(value)}</span>`;
  }

  const icon = symbol
    ? `<span class="profile-contact-symbol" title="${label}" aria-hidden="true">${symbol}</span>`
    : "";
  return `<span class="profile-contact-item" aria-label="${label}: ${escapeHtml(value)}">${icon}${rendered}</span>`;
}

function renderInlineContactFields(fields) {
  return fields.map((field, index) => {
    const separator = index > 0 ? `<span class="profile-contact-separator" aria-hidden="true">&middot;</span>` : "";
    return `${separator}${renderInlineContactField(field)}`;
  }).join("");
}

function renderField(field, labelClass = "") {
  const label = escapeHtml(translateTerm(field.label ?? field.key ?? ""));
  const value = displayValue(field.value);
  const type = field.type ?? "text";
  let rendered;

  if (type === "rating") {
    const score = Math.max(0, Math.min(5, Number(field.value) || 0));
    const rounded = Math.round(score);
    rendered = `<span class="rating" aria-label="${escapeHtml(t("ratingOutOfFive", { score }))}">${"★".repeat(rounded)}${"☆".repeat(5 - rounded)}</span>`;
  } else if (type === "ratio") {
    const rate = Math.max(0, Math.min(1, Number(field.value) || 0));
    const percent = Math.round(rate * 100);
    rendered = `<span class="ratio" aria-label="${percent}%">${percent}%</span>`;
  } else if (type === "image") {
    const url = sanitizeImageUrl(value);
    rendered = url ? `<img class="field-image" src="${escapeHtml(url)}" alt="${label}">` : `<span>${escapeHtml(value)}</span>`;
  } else if (type === "email") {
    const url = sanitizeUrl(`mailto:${value}`);
    rendered = url ? `<a href="${escapeHtml(url)}">${escapeHtml(value)}</a>` : `<span>${escapeHtml(value)}</span>`;
  } else if (type === "phone") {
    const url = sanitizeUrl(`tel:${value}`);
    rendered = url ? `<a href="${escapeHtml(url)}">${escapeHtml(value)}</a>` : `<span>${escapeHtml(value)}</span>`;
  } else if (type === "url") {
    const url = sanitizeUrl(value);
    rendered = url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(value)}</a>` : `<span>${escapeHtml(value)}</span>`;
  } else if (field.courseMeta) {
    rendered = renderCourseMeta(field.courseMeta) || `<span>${escapeHtml(value)}</span>`;
  } else {
    rendered = `<span>${escapeHtml(value)}</span>`;
  }

  const hasSymbol = Boolean(FIELD_SYMBOLS[field.icon]);
  const isCourse = Boolean(field.courseMeta);
  return `<div class="field${hasSymbol ? " has-symbol" : ""}">${renderFieldLabel(field, label, labelClass)}<dd${isCourse ? ' class="course-meta"' : ""}>${rendered}</dd></div>`;
}

function experienceDateParts(value) {
  const text = String(value ?? "").trim();
  let match = text.match(/^(\d{4})(?:[\/-](\d{1,2}))?$/);
  let year;
  let month;

  if (match) {
    year = Number(match[1]);
    month = match[2] == null ? 1 : Number(match[2]);
  } else {
    match = text.match(/^(\d{1,2})[\/-](\d{4})$/);
    if (!match) return null;
    month = Number(match[1]);
    year = Number(match[2]);
  }

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return null;
  return { year, month };
}

function experienceMonthIndex(value) {
  const date = experienceDateParts(value);
  return date ? date.year * 12 + date.month - 1 : null;
}

function formatExperienceStartDate(value) {
  const date = experienceDateParts(value);
  if (!date) return String(value ?? "").trim();
  const instant = new Date(Date.UTC(date.year, date.month - 1, 1));
  return new Intl.DateTimeFormat(currentLocale(), { month: "short", year: "numeric", timeZone: "UTC" }).format(instant);
}

function formatExperienceDuration(startDate, finishDate) {
  const start = String(startDate ?? "").trim();
  const finish = String(finishDate ?? "").trim();
  if (!start) return "";
  if (translateTerm(finish, "en").toLowerCase() === "now") return t("sinceDate", { date: formatExperienceStartDate(start) });

  const startMonth = experienceMonthIndex(start);
  const finishMonth = experienceMonthIndex(finish);
  if (startMonth == null || finishMonth == null || finishMonth < startMonth) {
    return finish ? `${start} – ${finish}` : start;
  }

  const months = finishMonth - startMonth;
  if (months < 1) return t("lessThanMonth");
  if (months < 12) return `${months} ${t(months === 1 ? "monthSingular" : "monthPlural")}`;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const yearLabel = `${years} ${t(years === 1 ? "yearSingular" : "yearPlural")}`;
  const monthLabel = `${remainingMonths} ${t(remainingMonths === 1 ? "monthSingular" : "monthPlural")}`;
  return remainingMonths ? `${yearLabel} ${monthLabel}` : yearLabel;
}

function renderExperienceMetaItem(icon, label, value) {
  const text = translateTerm(String(value ?? "").trim());
  if (!text) return "";
  const symbol = FIELD_SYMBOLS[icon] ?? "";
  return `<span class="experience-meta-item" aria-label="${escapeHtml(label)} : ${escapeHtml(text)}"><span class="experience-meta-symbol" aria-hidden="true">${symbol}</span><span>${escapeHtml(text)}</span></span>`;
}

function renderMetaEntries(entries) {
  return entries.filter(Boolean).map((entry, index) => {
    const separator = index ? `<span class="experience-meta-separator" aria-hidden="true">&middot;</span>` : "";
    return `${separator}${entry}`;
  }).join("");
}

function renderExperienceMeta(experience) {
  return renderMetaEntries([
    renderExperienceMetaItem("duration", t("duration"), formatExperienceDuration(experience.startDate, experience.finishDate)),
    renderExperienceMetaItem("location", t("location"), experience.location),
    renderExperienceMetaItem("kind", t("type"), translateTerm(experience.kind)),
    renderExperienceMetaItem("format", t("format"), translateTerm(experience.format))
  ]);
}

function renderCourseMeta(courseMeta) {
  const entries = renderMetaEntries([
    renderExperienceMetaItem("duration", t("date"), courseMeta?.date),
    renderExperienceMetaItem("location", t("location"), courseMeta?.location)
  ]);
  return entries ? `<span class="experience-meta-line course-meta-line">${entries}</span>` : "";
}

function renderAchievementText(value) {
  return escapeHtml(translateTerm(value))
    .replace(/&lt;b&gt;/gi, "<b>")
    .replace(/&lt;\/b&gt;/gi, "</b>");
}

function isIllustrationField(field) {
  return field?.type === "image" && normalizeSearchText(field?.key).replace(/[\s_-]/g, "") === "illustration";
}

function renderIllustrationFields(fields) {
  return fields.filter(isIllustrationField).map((field) => {
    const url = sanitizeImageUrl(displayValue(field.value));
    const alt = translateTerm(field.label ?? "illustration");
    return url
      ? `<img class="card-illustration" src="${escapeHtml(url)}" alt="${escapeHtml(alt)}">`
      : "";
  }).join("");
}

function renderProfileCard(item, section) {
  const link = sanitizeUrl(item.link);
  const heading = link
    ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener">${escapeHtml(translateTerm(item.label))}</a>`
    : escapeHtml(translateTerm(item.label));
  const tags = item.displayTags === false
    ? ""
    : (item.tags ?? []).map((tag) => renderItemTag(tag, item.displayTagRates === true)).join("");
  const itemFields = item.fields ?? [];
  const illustration = renderIllustrationFields(itemFields);
  const contentFields = itemFields.filter((field) => !isIllustrationField(field));
  const inlineContact = renderInlineContactFields(contentFields);
  const remove = typeof section?.adapter?.remove === "function"
    ? `<button class="remove-button no-print" type="button" data-remove-id="${escapeHtml(item.id)}" data-remove-plugin="${escapeHtml(section.id)}" aria-label="${escapeHtml(t("removeItem", { label: translateTerm(item.label) }))}">×</button>`
    : "";
  const profileTitle = item.profileTitle == null || item.profileTitle === ""
    ? ""
    : `<span class="profile-heading-separator" aria-hidden="true">&middot;</span><span class="profile-heading-title">${escapeHtml(translateTerm(item.profileTitle))}</span>`;
  const profileQuote = item.profileQuote == null || item.profileQuote === ""
    ? ""
    : `<div class="profile-quote">${escapeHtml(translateTerm(item.profileQuote))}</div>`;

  return `<article class="item-card profile-card">
    <div class="card-heading">
      <div class="card-heading-main profile-heading-main">
        ${illustration}
        <div class="profile-heading-copy">
          <h3>${heading}${profileTitle}</h3>
          ${inlineContact ? `<div class="profile-contact-line profile-heading-contact" aria-label="${escapeHtml(t("contactDetails"))}">${inlineContact}</div>` : ""}
        </div>
      </div>
      ${remove}
    </div>
    ${profileQuote}
    ${tags ? `<div class="item-tags">${tags}</div>` : ""}
  </article>`;
}

function renderExperienceCard(item, section) {
  const experience = item.experience ?? {};
  const title = translateTerm(String(experience.title ?? item.label ?? ""));
  const organization = translateTerm(String(experience.organization ?? "").trim());
  const link = sanitizeUrl(item.link);
  const titleMarkup = link
    ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener">${escapeHtml(title)}</a>`
    : escapeHtml(title);
  const heading = organization
    ? `<span class="experience-organization">${escapeHtml(organization)}</span><span class="experience-heading-separator" aria-hidden="true">&middot;</span><span class="experience-title">${titleMarkup}</span>`
    : `<span class="experience-title">${titleMarkup}</span>`;
  const illustrationURL = sanitizeImageUrl(experience.illustration);
  const illustration = illustrationURL
    ? `<img class="card-illustration" src="${escapeHtml(illustrationURL)}" alt="${escapeHtml(organization || title)}">`
    : "";
  const remove = typeof section?.adapter?.remove === "function"
    ? `<button class="remove-button no-print" type="button" data-remove-id="${escapeHtml(item.id)}" data-remove-plugin="${escapeHtml(section.id)}" aria-label="${escapeHtml(t("removeItem", { label: translateTerm(item.label) }))}">×</button>`
    : "";
  const meta = renderExperienceMeta(experience);
  const tags = item.displayTags === false
    ? ""
    : (item.tags ?? []).map((tag) => renderItemTag(tag, item.displayTagRates === true)).join("");
  const subtitle = translateTerm(String(experience.subtitle ?? "").trim());
  const achievements = Array.isArray(experience.achievements)
    ? experience.achievements.map((achievement) => `<li>${renderAchievementText(achievement)}</li>`).join("")
    : "";

  return `<article class="item-card">
    <div class="card-heading">
      <div class="card-heading-main experience-heading-main">
        ${illustration}
        <div class="experience-heading-copy">
          <h3>${heading}</h3>
          ${meta ? `<div class="experience-meta-line">${meta}</div>` : ""}
        </div>
      </div>
      ${remove}
    </div>
    ${tags ? `<div class="item-tags">${tags}</div>` : ""}
    ${subtitle ? `<p class="experience-subtitle">${escapeHtml(subtitle)}</p>` : ""}
    ${achievements ? `<ul class="experience-achievements">${achievements}</ul>` : ""}
  </article>`;
}

function renderItem(item, section) {
  if (item.cardType === "experience") return renderExperienceCard(item, section);
  if (item.cardType === "profile") return renderProfileCard(item, section);

  const link = sanitizeUrl(item.link);
  const heading = link
    ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener">${escapeHtml(translateTerm(item.label))}</a>`
    : escapeHtml(translateTerm(item.label));
  const tags = item.displayTags === false
    ? ""
    : (item.tags ?? []).map((tag) => renderItemTag(tag, item.displayTagRates === true)).join("");
  const itemFields = item.fields ?? [];
  const illustration = renderIllustrationFields(itemFields);
  const contentFields = itemFields.filter((field) => !isIllustrationField(field));
  const inlineContact = item.fieldsLayout === "inline-contact"
    ? renderInlineContactFields(contentFields)
    : "";
  const fields = item.fieldsLayout === "inline-contact"
    ? ""
    : contentFields.map((field) => renderField(field, item.fieldLabelClass ?? "")).join("");
  const remove = typeof section?.adapter?.remove === "function"
    ? `<button class="remove-button no-print" type="button" data-remove-id="${escapeHtml(item.id)}" data-remove-plugin="${escapeHtml(section.id)}" aria-label="${escapeHtml(t("removeItem", { label: translateTerm(item.label) }))}">×</button>`
    : "";
  const profileTitle = item.profileTitle == null || item.profileTitle === ""
    ? ""
    : `<div class="profile-title">${escapeHtml(translateTerm(item.profileTitle))}</div>`;
  const profileQuote = item.profileQuote == null || item.profileQuote === ""
    ? ""
    : `<div class="profile-quote">${escapeHtml(translateTerm(item.profileQuote))}</div>`;

  return `<article class="item-card">
    <div class="card-heading">
      <div class="card-heading-main">${illustration}<h3>${heading}</h3></div>
      ${remove}
    </div>
    ${profileTitle}
    ${profileQuote}
    ${tags ? `<div class="item-tags">${tags}</div>` : ""}
    ${inlineContact ? `<div class="profile-contact-line" aria-label="${escapeHtml(t("contactDetails"))}">${inlineContact}</div>` : ""}
    ${fields ? `<dl class="fields">${fields}</dl>` : ""}
  </article>`;
}

// ---- Multi-adapter active content sections -------------------------------------------------

function sectionDomSuffix(id) {
  const words = String(id).split(/[^a-zA-Z0-9]+/).filter(Boolean);
  const suffix = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("");
  return suffix || "Document";
}

function activeContentSection() {
  return state.sections.find((section) => String(section.id) === String(state.activeSection)) ?? null;
}

function activeContentAdapter() {
  return activeContentSection()?.adapter ?? null;
}

function syncContextualTools() {
  const section = activeContentSection();
  const sectionId = section ? String(section.id) : "";
  const canAdd = typeof section?.adapter?.add === "function";
  const sectionName = translateTerm(sectionId);
  const searchLabel = sectionId ? t("searchSection", { section: sectionName }) : t("searchDocument");

  elements.search.placeholder = sectionId ? t("searchSectionPlaceholder", { section: sectionName }) : t("search");
  elements.search.setAttribute("aria-label", searchLabel);
  elements.addButton.hidden = !canAdd;
  elements.wizard.setAttribute("aria-label", sectionId ? t("addItemSection", { section: sectionName }) : t("addItem"));

  if (elements.wizard.hidden) {
    elements.addButtonSymbol.textContent = "+";
    elements.addButton.setAttribute("aria-label", sectionId ? t("addItemSection", { section: sectionName }) : t("addItem"));
    elements.addButton.setAttribute("aria-expanded", "false");
  }
}

function selectActiveContentSection(id, { focus = false } = {}) {
  const sectionId = String(id ?? "");
  if (!state.sections.some((section) => String(section.id) === sectionId)) return;

  const sectionChanged = String(state.activeSection) !== sectionId;
  const hadSelectedTag = state.selectedTag != null;
  if (sectionChanged && !elements.wizard.hidden) closeWizard();
  if (sectionChanged) state.selectedTag = null;
  state.activeSection = sectionId;

  if (sectionChanged && hadSelectedTag) {
    renderActiveContent();
    if (focus) elements.activeContentMenu.querySelector(`[data-active-content-section="${CSS.escape(sectionId)}"]`)?.focus();
  } else {
    const tabs = [...elements.activeContentMenu.querySelectorAll("[role=\"tab\"]")];
    const panels = [...elements.itemsList.querySelectorAll("[role=\"tabpanel\"]")];

    tabs.forEach((tab) => {
      const isActive = tab.dataset.activeContentSection === sectionId;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      if (isActive && focus) tab.focus();
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.pluginSection !== sectionId;
    });
  }

  renderTags();
  renderStatistics();
  syncContextualTools();
}

function renderActiveContent() {
  let totalCount = 0;
  const tabs = [];
  const sections = [];
  const sectionIds = state.sections.map((section) => String(section.id));
  const activeSection = sectionIds.includes(String(state.activeSection))
    ? String(state.activeSection)
    : (sectionIds[0] ?? null);
  state.activeSection = activeSection;

  for (const section of state.sections) {
    const sectionId = String(section.id);
    const items = filteredItems(section.view);
    const count = items.length;
    totalCount += count;

    const domSuffix = sectionDomSuffix(sectionId);
    const tabId = `activeContentMenuItem${domSuffix}`;
    const panelId = `activeContentSection${domSuffix}`;
    const isActive = sectionId === activeSection;
    const countLabel = `${count} ${t(count === 1 ? "itemSingular" : "itemPlural")}`;

    tabs.push(`<button id="${escapeHtml(tabId)}" class="active-content-menu-item${isActive ? " is-active" : ""}" type="button" role="tab" aria-selected="${isActive}" aria-controls="${escapeHtml(panelId)}" tabindex="${isActive ? "0" : "-1"}" data-active-content-section="${escapeHtml(sectionId)}">
      <span>${escapeHtml(translateTerm(sectionId))}</span>
      <span class="active-content-menu-count" aria-label="${escapeHtml(countLabel)}">${count}</span>
    </button>`);

    const activeContentCount = sectionId === "bookmarks" || sectionId === "cv"
      ? ""
      : `<p class="active-content-count">${countLabel}</p>`;

    sections.push(`<section id="${escapeHtml(panelId)}" class="active-content-section" role="tabpanel" tabindex="0" data-plugin-section="${escapeHtml(sectionId)}" aria-labelledby="${escapeHtml(tabId)}"${isActive ? "" : " hidden"}>
      <h3 class="active-content-section-title active-content-section-print-title">${escapeHtml(translateTerm(sectionId))}</h3>
      ${activeContentCount}
      <div class="active-content-section-items">${items.map((item) => renderItem(item, section)).join("")}</div>
    </section>`);
  }

  elements.activeContentMenu.setAttribute("aria-label", t("activeContentSections"));
  elements.activeContentMenu.innerHTML = tabs.join("");
  elements.activeContentMenu.hidden = tabs.length === 0;
  const statistics = statisticsMarkup(state.sections.find((section) => String(section.id) === activeSection) ?? null);
  elements.itemsList.innerHTML = `${statistics}${sections.join("")}`;
  elements.emptyState.hidden = totalCount > 0;
}

function render() {
  if (!state.view) return;
  document.title = APP_TITLE;
  elements.title.textContent = APP_TITLE;
  const appQuote = translateTerm(APP_QUOTE);
  const footerQuote = appQuote.startsWith(APP_TITLE + " ") ? appQuote.slice(APP_TITLE.length + 1) : appQuote;
  setOptionalText(elements.quote, footerQuote);
  renderActiveContent();
  renderTags();
  syncContextualTools();
}

function toggleTag(id) {
  state.selectedTag = String(state.selectedTag) === String(id) ? null : id;
  renderTags();
  renderActiveContent();
}

// ---- Unsaved-change notifications --------------------------------------------------

function updateSettingsNotification() {
  const count = Math.max(0, Number(state.settingsNotificationCount) || 0);
  elements.settingsNotificationBadge.hidden = count === 0;

  const open = !elements.settingsPanel.hidden;
  const baseLabel = open ? t("settingsClose") : t("settingsOpen");
  const notificationLabel = !open && count > 0
    ? t("settingsChanges", { count, item: t(count === 1 ? "itemSingular" : "itemPlural"), suffix: count > 1 ? "s" : "", plural: count > 1 ? "s" : "" })
    : "";
  elements.settingsButton.setAttribute("aria-label", `${baseLabel}${notificationLabel}`);
}

function updateSaveNotification() {
  const count = Math.max(0, Number(state.saveNotificationCount) || 0);
  elements.saveNotificationBadge.hidden = count === 0;

  const notificationLabel = count > 0
    ? t("saveChanges", { count, item: t(count === 1 ? "itemSingular" : "itemPlural"), suffix: count > 1 ? "s" : "", plural: count > 1 ? "s" : "" })
    : "";
  elements.saveButton.setAttribute("aria-label", `${t("saveYaml")}${notificationLabel}`);
}

function incrementChangeNotifications() {
  state.settingsNotificationCount += 1;
  state.saveNotificationCount += 1;
  updateSettingsNotification();
  updateSaveNotification();
}

function clearChangeNotifications() {
  if (state.settingsNotificationCount === 0 && state.saveNotificationCount === 0) return;
  state.settingsNotificationCount = 0;
  state.saveNotificationCount = 0;
  updateSettingsNotification();
  updateSaveNotification();
}

let toastTimer = null;
function showToast(message, isError = false) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.toggle("is-error", isError);
  elements.toast.hidden = false;
  toastTimer = setTimeout(() => { elements.toast.hidden = true; }, 3600);
}

async function importDocument(file) {
  const codec = codecForFilename(file.name);
  if (!codec) throw new Error(t("unsupportedYaml"));
  const text = await readLocalFile(file);
  const parsed = codec.parse(text);
  await loadParsedDocument(parsed, file.name);
  showToast(t("importedFile", { name: file.name }));
}

function saveDocument() {
  if (!state.adapter || !state.model) return;
  const codec = runtime.codecs.get("yaml");
  const serialized = state.adapter.serialize(state.model);
  const text = codec.stringify(serialized);
  const base = state.sourceName.replace(/\.(?:ya?ml)$/i, "") || "document";
  downloadText(text, `${base}-export.yml`);
  clearChangeNotifications();
  showToast(t("yamlSaveReady"));
}


async function toggleSettings(force) {
  const open = typeof force === "boolean" ? force : elements.settingsPanel.hidden;

  if (open) {
    try {
      await loadStylesheet("./css/settings.css", "feature:settings");
    } catch (error) {
      showToast(error.message || String(error), true);
      return;
    }
    elements.settingsPanel.hidden = false;
  } else {
    elements.settingsPanel.hidden = true;
  }

  elements.activeContent.classList.toggle("is-settings-open", open);
  elements.settingsButton.setAttribute("aria-expanded", String(open));
  updateSettingsNotification();
}

// ---- DOM events and application bootstrap -----------------------------------------

function bindEvents() {
  elements.settingsButton.addEventListener("click", () => toggleSettings());
  elements.contextMenu.addEventListener("click", (event) => {
    if (!elements.settingsPanel.hidden && !event.target.closest("#settingsButton")) toggleSettings(false);
  });
  elements.languageOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-locale-value]");
    if (button) {
      applyLocale(button.dataset.localeValue);
      syncUrlPreferences();
    }
  });
  elements.themeSelect.addEventListener("change", async () => {
    try {
      await applyTheme(elements.themeSelect.value);
      syncUrlPreferences();
    } catch (error) {
      elements.themeSelect.value = elements.html.dataset.theme;
      showToast(error.message || String(error), true);
    }
  });
  window.matchMedia?.("(prefers-color-scheme: dark)")?.addEventListener?.("change", syncBrowserThemeColor);
  classicNarrowScreen.addEventListener("change", () => {
    syncActiveContentMenuOrientation();
    syncSettingsPlacement();
    syncTagsPlacement();
  });
  elements.themeModeButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await applyTheme(elements.html.dataset.theme, button.dataset.themeModeValue);
        syncUrlPreferences();
      } catch (error) {
        showToast(error.message || String(error), true);
      }
    });
  });
  elements.layoutOptions.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-layout-value]");
    if (button && elements.layoutOptions.contains(button)) {
      try {
        await applyLayout(button.dataset.layoutValue);
        syncUrlPreferences();
      } catch (error) {
        showToast(error.message || String(error), true);
      }
    }
  });
  elements.statisticsToggle.addEventListener("click", () => {
    applyStatisticsVisibility(!state.showStatistics);
    syncUrlPreferences();
  });
  elements.importButton.addEventListener("click", () => elements.fileInput.click());
  elements.saveButton.addEventListener("click", saveDocument);
  elements.fileInput.addEventListener("change", async () => {
    const [file] = elements.fileInput.files;
    elements.fileInput.value = "";
    if (!file) return;
    try {
      await importDocument(file);
      toggleSettings(false);
    } catch (error) {
      console.error(error);
      showToast(error.message || t("importFailed"), true);
    }
  });

  elements.search.addEventListener("input", () => {
    state.query = elements.search.value;
    renderActiveContent();
  });

  elements.tagsList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tag-id]");
    if (button) toggleTag(button.dataset.tagId);
  });

  elements.activeContentMenu.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-active-content-section]");
    if (tab) selectActiveContentSection(tab.dataset.activeContentSection);
  });

  elements.itemsList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-id]");
    if (!button) return;
    const adapter = runtime.documents.get(button.dataset.removePlugin);
    if (typeof adapter?.remove !== "function") return;
    const removed = adapter.remove(state.model, button.dataset.removeId);
    if (removed) {
      incrementChangeNotifications();
      refreshView();
      runtime.emit("document:changed", { operation: "remove", plugin: adapter.id });
    }
  });

  elements.activeContentMenu.addEventListener("keydown", (event) => {
    const currentTab = event.target.closest("[role=\"tab\"]");
    if (!currentTab) return;

    const tabs = [...elements.activeContentMenu.querySelectorAll("[role=\"tab\"]")];
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex < 0) return;

    let nextIndex = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex == null) return;

    event.preventDefault();
    selectActiveContentSection(tabs[nextIndex].dataset.activeContentSection, { focus: true });
  });

  elements.addButton.addEventListener("click", async () => {
    if (wizardLoading && !wizardController) return;
    const section = state.activeSection;
    try {
      const controller = await ensureWizardController();
      if (section !== state.activeSection) return;
      if (elements.wizard.hidden) controller.open();
      else if (state.wizardStep > 0) controller.setStep(state.wizardStep - 1);
      else controller.close();
    } catch (error) {
      showToast(error.message || String(error), true);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!elements.wizard.hidden) closeWizard();
    else if (!elements.settingsPanel.hidden) toggleSettings(false);
  });

}

async function start() {
  renderLanguageOptions();
  const urlLocale = getUrlPreference("lang", (value) =>
    supportedLocales().some((locale) => locale.code === value));
  applyLocale(urlLocale ?? getStoredPreference("kite.locale", currentLocale()),
    { persist: false, rerender: false });
  bindEvents();
  updateSettingsNotification();
  updateSaveNotification();
  state.config = await fetchJson("./config/kite.json");
  await loadFoundationModules(runtime, state.config.foundation);

  renderThemeOptions();
  renderLayoutOptions();
  const storedTheme = getStoredPreference("kite.theme", state.config.defaults.theme);
  // Existing installations stored the color mode in kite.theme.
  const legacyMode = THEME_MODES.has(storedTheme) ? storedTheme : state.config.defaults.themeMode;
  const theme = THEME_MODES.has(storedTheme) ? "core" : storedTheme;
  const urlTheme = getUrlPreference("theme", (value) => runtime.themes.has(value));
  const urlMode = getUrlPreference("color", (value) => THEME_MODES.has(value));
  await applyTheme(urlTheme ?? theme, urlMode ?? getStoredPreference("kite.themeMode", legacyMode),
    { persist: urlTheme === null && urlMode === null });

  const storedLayout = getStoredPreference("kite.layout", state.config.defaults.layout);
  // Preserve Selene's former workspace geometry for existing installations.
  const layoutVersion = getStoredPreference("kite.layoutVersion",
    getStoredPreference("kite.layoutSchemaVersion", ""));
  const legacySeleneLayout = layoutVersion !== "1"
    && theme === "selene" && storedLayout === "two-column";
  const savedLayout = legacySeleneLayout ? "workspace"
    : (storedLayout === "two-column" || storedLayout === "one-page" ? "classic" : storedLayout);
  if (savedLayout !== storedLayout) setStoredPreference("kite.layout", savedLayout);
  const urlLayout = getUrlPreference("layout", (value) =>
    runtime.layouts.has(value) || value === "two-column" || value === "one-page");
  const resolvedUrlLayout = urlLayout === "two-column" || urlLayout === "one-page" ? "classic" : urlLayout;
  await applyLayout(resolvedUrlLayout ?? savedLayout, { persist: urlLayout === null });
  setStoredPreference("kite.layoutVersion", "1");

  const urlStatistics = getUrlPreference("stats", (value) => value === "true" || value === "false");
  applyStatisticsVisibility(
    (urlStatistics ?? getStoredPreference("kite.statistics", "false")) === "true",
    { persist: urlStatistics === null }
  );
  state.preferencesReady = true;

  await loadConfiguredDocument();
  await registerServiceWorker();
}

start().catch((error) => {
  document.documentElement.classList.remove("presentation-loading");
  elements.activeContentMenu.hidden = true;
  elements.addButton.hidden = true;
  console.error(error);
  elements.itemsList.innerHTML = `<div class="fatal-error"><strong>${escapeHtml(t("startupFailedTitle"))}</strong><p>${escapeHtml(error.message || error)}</p></div>`;
  showToast(error.message || t("startupFailed"), true);
});
