# Generate Kite from scratch

This document is a self-contained prompt intended for a capable coding agent. It describes the complete Kite application at the level required to rebuild the repository from an empty directory with the same architecture, behaviour and public UX. Binary icon pixels and generated demonstration illustrations do not need to be byte-identical, but the generated assets, interfaces, functionality and file contracts must be equivalent. All bundled CV/person data must remain fictional.

## Reference agent / LLM used for this specification

- Product: **ChatGPT by OpenAI**
- Model: **GPT-5.6 Sol**
- Model class: **reasoning model**
- Reasoning effort used for this maintenance pass: **High**
- Agent role: **front-end/PWA code-maintenance agent with local repository editing and validation tools**
- Reference date: **2026-09-17**
- Target Kite release: **v0.5.185**
- Execution context used for maintenance: a Linux sandbox with filesystem/shell access, Python and Node.js available for validation; the application itself must not depend on those tools at runtime.
- Reproducibility boundary: hidden chain-of-thought, private system prompts and platform-internal instructions are not application dependencies and must not be required. The generated repository must be justified by explicit source files, comments and executable/browser-visible behaviour.

---

## Prompt to give the coding agent

```text
You are a senior front-end/PWA maintainer. Starting from an EMPTY DIRECTORY, generate a complete repository named `kite` that satisfies every requirement below. Do not omit files, do not leave TODO placeholders, and do not require a later manual build step.

# 1. Product goal

Build “Kite”, a lightweight, installable, offline-capable PWA that displays, searches, filters, edits, imports and exports structured YAML documents entirely in the browser.

Kite means “see” in Māori. The product quote is the canonical English string:

Kite means "see" in Māori => a lightweight, extensible PWA for displaying, searching and analysing information

The app must be usable as a static website and deploy cleanly to GitHub Pages, including when hosted below a repository sub-path.
The README must prominently identify the reference public demo as `https://sylvain37.github.io/kite/` and invite users to install that deployment as a PWA and submit feedback/fixes through pull requests.

# 2. Non-negotiable technical constraints

- No backend.
- No runtime Node.js dependency.
- No npm/yarn/pnpm/bun package.
- No framework.
- No bundler or transpiler.
- No CDN or remote JavaScript dependency.
- No remote font dependency.
- Use browser-native HTML, CSS, ES modules and Web APIs only.
- Use dynamic `import()` for plugins.
- All production paths must be relative.
- The source/canonical language of code, identifiers, comments, static HTML copy and bundled YAML metadata is English.
- The default rendered locale is English (`DEFAULT_LOCALE = "en"` and `<html lang="en">`); French remains selectable through the local i18n dictionary.
- The interface locale is user-selectable at runtime from the locales declared in `js/i18n.js`; the choice persists locally and must not require a page reload.
- Treat imported YAML as untrusted data.

# 3. Required repository tree

Create at least exactly these functional files (additional tests/docs are allowed if dependency-free):

kite/
  .nojekyll
  README.md
  index.html
  site.webmanifest
  sw.js
  kite.sh
  kite.ps1
  kite.cmd
  config/
    kite.json
  css/
    app.css
    settings.css
    wizard.css
  data/
    template.yml
  docs/
    GENERATE.md
  images/
    favicon.svg
    favicon.ico
    favicon-16x16.png
    favicon-32x32.png
    apple-touch-icon.png
    android-chrome-192x192.png
    android-chrome-512x512.png
    ic_launcher.png
  js/
    main.js
    i18n.js
    app/
      constants.js
      document-plugin-resolver.js
      foundation-modules.js
      wizard.js
    contracts/
      plugin.js
    kernel/
      registries.js
      runtime.js
    platform/
      file-gateway.js
      pwa.js
      stylesheet.js
    shared/
      data.js
      dom.js
    extensions/
      codecs/yaml/plugin.js
      themes/core/plugin.js
      themes/core/style.css
      themes/selene/plugin.js
      themes/selene/style.css
      layouts/classic/plugin.js
      layouts/classic/style.css
      layouts/workspace/plugin.js
      layouts/workspace/style.css
    plugins/
      bookmarks/plugin.js
      cv/plugin.js

# 4. Naming and maintainability conventions

Apply these consistently:

- JS functions/variables: camelCase.
- JS classes: PascalCase.
- module constants: UPPER_SNAKE_CASE.
- DOM ids and JS element references: camelCase.
- CSS classes: kebab-case.
- plugin ids: lower-case names, or dotted reverse-domain ids for foundation extensions.
- event names: namespaced lower-case strings such as `document:loaded` and `theme:changed`.
- canonical user-facing source copy: English.

Comment modules and non-obvious algorithms for a future maintainer. Explain why a boundary exists; do not narrate trivial syntax. Factor repeated data operations into `js/shared/data.js`, repeated escaping/URL rules into `js/shared/dom.js`, and product constants into `js/app/constants.js`.

# 5. App constants

In `js/app/constants.js`, export:

- APP_TITLE = "Kite"
- APP_QUOTE = the exact product quote from section 1.

# 6. Microkernel

Implement a small runtime in `js/kernel/`.

`registries.js`:
- generic Map-backed registry with register/get/has/values behaviour;
- registering returns a cleanup/unregister callback;
- reject invalid/duplicate registrations with clear English errors.

`runtime.js`:
- expose registries: codecs, documents, themes, layouts, services;
- expose `events` based on EventTarget;
- expose `emit(name, detail)` and `on(name, handler)`; `on` returns cleanup.

# 7. Plugin contract and loading

`js/contracts/plugin.js`:
- validate plugin manifests;
- valid kinds are codec, theme, layout and business;
- require id/version/kind and activate function;
- errors in English.

`js/app/foundation-modules.js`:
- load modules declared by config via dynamic import;
- validate and activate each against the runtime;
- retain cleanup callbacks.

`js/app/document-plugin-resolver.js`:
- inspect `document.setup.plugins`;
- plugin names must be safe lower-case identifiers with optional hyphens (prevent path traversal);
- resolve business plugin `name` to `./js/plugins/<name>/plugin.js` relative to the app;
- dynamically import once, validate manifest id/kind/version against the declaration, activate once;
- choose document adapters from the runtime by positive probe score, highest score wins;
- clear English errors for missing/invalid adapters.

# 8. Shared helpers

`js/shared/data.js` must include documented reusable helpers equivalent to:
- cloneValue(value): structuredClone if available, JSON fallback;
- isScalar(value);
- normalizeKey(value): case-insensitive and ignores spaces/underscores/hyphens;
- cleanText(value);
- normalizeRatio(value): clamp numeric ratio to 0..1 or return null;
- nextNumericId(items, startAt = 1);
- splitList(value): comma/newline list;
- splitLines(value): one trimmed logical entry per line.

`js/shared/dom.js` must centralise:
- escapeHtml(value);
- sanitizeUrl(value): only http, https, file, mailto and tel;
- sanitizeImageUrl(value): http/https plus validated base64 data URLs for PNG/JPEG/WebP/GIF;
- isLinkUrl(value): http/https/file only.

Never duplicate these rules in business plugins.

# 9. File/PWA platform gateways

`js/platform/file-gateway.js` exports clearly named functions:
- fetchJson
- getFileExtension
- fetchText
- readLocalFile
- downloadText

Use FileReader for local imports and Blob/object URLs for downloads.

`js/platform/pwa.js` registers `./sw.js` when Service Workers are supported. Failure must not crash the app; log an English warning.

# 10. YAML codec

Create `js/extensions/codecs/yaml/plugin.js` with manifest:
- id `org.kite.codec.yaml`
- version `1.0.0`
- kind `codec`

Register a codec under key `yaml` supporting extensions `yml` and `yaml`.

Implement a local, dependency-free YAML subset sufficient for Kite documents:
- indentation-based maps and arrays;
- nested objects/arrays;
- plain strings;
- single- and double-quoted strings;
- integers/floats;
- booleans;
- null;
- comments outside quotes;
- empty collections where practical;
- deterministic stringify back to readable YAML.

Reject structurally invalid indentation/input with clear English errors. Preserve strings that resemble URLs and embedded base64 image values.

# 11. Theme/layout extensions

Theme plugins:
- Core manifest id `org.kite.theme.core`, version `1.0.0`, kind `theme`; register the `core` family with its stylesheet URL for loading when selected. Adapt Min Light and Min Dark by Miguel Solorio from https://github.com/miguelsolorio/min-theme to the Core roles; use their UI colors for surfaces and blue functional accents, and derive status roles from their token/terminal/diff colors. The Core search field uses the same 1px accent border as its buttons.
- Selene manifest id `org.kite.theme.selene`, version `1.0.0`, kind `theme`; register the `selene` family with its stylesheet URL for loading when selected.
- Both families support `system`, `light` and `dark` color modes. The Settings dropdown is built from registered theme families. Keep the browser theme-color meta tag in sync with the selected palette background, including system color-scheme changes.
- Each light and dark palette defines the same CSS roles: `background`, `landscape-primary`, `landscape-secondary`, `landscape-inverted`, `landscape-delimited`, `landscape-filled`, `inactive-primary`, `inactive-secondary`, `inactive-inverted`, `inactive-delimited`, `inactive-filled`, `active-primary`, `active-secondary`, `active-inverted`, `active-delimited`, `active-filled`, `hover`, `focus`, `accent`, `success-state`, `error-state`, `warning-state`, `pending-state` and `shadow`. Components use the roles instead of hard-coded colors; system mode follows the appropriate palette.

Document layout plugins:
- each layout has its own `plugin.js` and `style.css`, registers one entry with a stylesheet URL in the `layouts` registry, and loads the stylesheet only when selected;
- `org.kite.layout.classic` registers `classic` (“Classic”): two columns above 760px and one document flow at 760px or less;
- `org.kite.layout.workspace` registers `workspace` (“Workspace”): framed top bar and full-height sidebar;
- every layout works with every theme. Settings generates layout buttons from the registry; theme stylesheets provide colors and component skin, while layout stylesheets own document geometry.

# 12. Config

`config/kite.json` declares `./data/data.yml` as the optional user document and `./data/template.yml` as the shipped fallback. It loads the YAML codec, Core and Selene themes, and the two layout foundation modules. It defaults to theme `core`, color mode `system` and layout `classic`.

# 13. i18n policy

Create `js/i18n.js`. English is canonical and is also the default display locale. Set `DEFAULT_LOCALE = "en"`. This module is the single source of truth for which interface languages are selectable.

Expose:
- `DEFAULT_LOCALE`
- `LOCALES`
- normalizeLocale(locale?)
- supportedLocales()
- currentLocale()
- t(key, parameters?)
- translateTerm(value, locale?)
- localizeStaticDom(root?)

`LOCALES` must currently define exactly these immutable descriptors:
- `en`: code `en`, flag `United Kingdom flag`, native name `English`;
- `fr`: code `fr`, flag `French flag`, native name `Français`.

Settings language buttons MUST be generated from these descriptors rather than duplicated in `index.html`. Adding a future locale to `LOCALES` plus its dictionary variants must automatically make it selectable.

Use `TRANSLATIONS` for semantic UI messages and `TERM_TRANSLATIONS` for exact canonical metadata/data values. Unknown user content MUST be returned unchanged by `translateTerm`.

The CV section titles MUST be covered in both translation paths:
- semantic messages: `languages` = `Languages` / `Langues`, `courses` = `Courses` / `Formations`;
- exact terms: `Languages` ↔ `Langues`, `Courses` ↔ `Formations`.

This deliberate overlap prevents stale plugin-view labels: `translateTerm()` can translate an already-materialised section title, while rebuilding a plugin view can resolve the semantic `t()` message again.

`localizeStaticDom` supports attributes:
- data-i18n
- data-i18n-placeholder
- data-i18n-aria-label
- data-i18n-content

At minimum provide EN/FR variants for every UI phrase needed by:
- settings open/close/panel;
- interface Language label;
- Theme / Core / Selene / System / Light / Dark;
- Layout / 2 columns / One page / Workspace;
- Statistics / Show / Hide;
- Data / Import / Save and YAML ARIA labels;
- Search and section-specific search;
- Add/cancel/back controls;
- Tags / Active content / active content sections / empty-content copy;
- item/experience counters and statistics labels;
- Duration, Location, Type, Format, Date, Contact details;
- remove-item and rating ARIA strings;
- date/duration wording (Since, less than one month, month(s), year(s));
- Languages, Courses, Profile, Social link, fallback course/experience labels;
- bookmark wizard prompts;
- CV wizard type/main/additional info, placeholders, image uploader copy;
- import/save/image/startup/validation errors and toasts.

TERM_TRANSLATIONS must include the exact English terms in the bundled `template.yml` that have a French rendering, including at minimum:
- on site -> sur site
- hybrid -> hybride
- self-employed -> freelance
- permanent contract -> CDI
- now -> maintenant
- World Wide Web — first website -> World Wide Web — premier site
- Cloud Platform Architect -> Architecte de plateforme cloud
- Platform Engineer -> Ingénieur plateforme
- Build and operate a shared delivery platform for product teams -> Construire et exploiter une plateforme de livraison partagée pour les équipes produit
- Architecture and enablement for secure cloud-native delivery -> Architecture et accompagnement pour une livraison cloud-native sécurisée
- French -> Français
- English -> Anglais
- Languages -> Langues
- Courses -> Formations
- phone -> téléphone
- location -> lieu
- organization -> organisation
- startDate -> début
- finishDate -> fin
- achievements -> réalisations
- and every translated quote, subtitle, achievement, course and skill term present in the bundled fictional CV data.

# 14. Bookmarks adapter

Manifest: id `bookmarks`, version `1.0.0`, kind `business`.

Schema:
- `data.bookmarks`: array of {id, label, link, tags:[tag ids], ...optional fields}
- `data.tags`: array of {id, label}

Behaviour:
- probe strongly when bookmarks array exists, otherwise when declared;
- clone on load/serialize;
- normalise missing data shape;
- toView returns type/title/subtitle/quote/tags/items;
- title is APP_TITLE and quote is APP_QUOTE;
- add bookmark from label/url/comma-separated tags, reusing existing tags case-insensitively or creating numeric ids;
- remove bookmark by id;
- default missing label is canonical English “Untitled”.

# 15. CV adapter

Manifest: id `cv`, version `1.0.0`, kind `business`.

Support two modes:

A. Structured `data.cv` mode.
- profile identity: firstName, lastName, title, quote, illustration;
- contact: phone, email, location;
- social references to data.tags plus link;
- languages references to tags with optional rate;
- courses references to tags with optional rate/date/location;
- experiences containing title, subtitle, organization, kind, format, location, startDate, finishDate, optional illustration, employedSkills references and achievements.
- resolve ids through data.tags;
- expose specialised view items/card types for profile, language/course groups and experiences;
- rates stay numeric 0..1;
- add wizard supports language, course and experience;
- adding a skill/language/course label reuses or creates a tag;
- experience illustration only accepts JPEG/PNG/WebP base64 data URLs.

B. Generic fallback mode.
- recursively walk arbitrary YAML;
- infer useful labels/tags/scalar fields;
- identify email, phone, URL, image and ratio types from keys/values;
- do not throw on unfamiliar user structures.

Use shared helpers instead of copies.

# 16. Main UI controller

`js/main.js` owns application state, browser events and rendering, not document schema rules. `js/app/wizard.js` owns the add-item editor and loads on first use.

On start:
1. generate language buttons from `supportedLocales()`;
2. apply a valid `lang` URL override or restore `kite.locale`, set `<html lang>`, and localise the static DOM;
3. bind events;
4. load `config/kite.json`;
5. load foundation modules;
6. apply valid `theme`, `color`, `layout` and `stats` URL overrides, falling back to localStorage; migrate former Selene + two-column users to Workspace once;
7. fetch/parse default YAML;
8. load declared business plugins;
9. select adapter(s), render document;
10. register service worker.

State includes config, active adapter/model/view, active content sections, active section, source filename, selected tag, search query, statistics visibility, wizard step and unsaved-change badge counts.

Required UI behaviour:
- Settings places the document title in bold, the translated quote in italics, `· v0.5.185 ·`, and the GitHub link below a separator after the data management controls.
- Search is diacritic-insensitive and matches both canonical and localised exact terms.
- Render the active content sections as a keyboard-operable tab menu in `contextMenu` above `tagsTitle`, including when the active section has no tags. Use a horizontal row in narrow `classic` and a vertical menu otherwise.
- Each menu row keeps its item count aligned to the right; arrow keys/Home/End move among sections.
- Active tag filter is contextual to the active section.
- Tag pills can display 0..100% proportional fill for rates.
- Bookmark cards open safe HTTP(S) and file links in new tabs with noopener.
- CV profile card has portrait/contact line/title/quote.
- Experience cards display optional illustration, organization/title, duration/location/type/format metadata, skill tags, subtitle and achievements.
- Achievement text may support only escaped `<b>...</b>` emphasis; all other markup remains escaped.
- Date ranges accept `YYYY-MM`, render locale-aware abbreviated month/year, compute a human-readable duration and support canonical `now` translated to French.
- Generic fields support text/email/phone/url/rating/image and course metadata.
- All user/document text inserted into HTML is escaped; all URLs go through shared safety helpers.

Settings:
- the Settings button beside `activeContentMenu` (or in `active-content-tools` on narrow Selene screens) uses a centered monochrome two-line filter SVG, colored with currentColor and sized by the active theme, toggles the panel and updates `aria-expanded`; show pending changes with the same 7.5px dot on Settings and Save, positioning the Settings dot at top/right -2px on the button's upper-right border and retaining the count in each accessible button label;
- Language: generate one button per `LOCALES` entry; every button shows its flat country-flag SVG and native language name, exposes `aria-pressed`, and the active locale is visibly selected;
- selecting a locale updates `<html lang>`, translates static `data-i18n*` content, rebuilds adapter views before rerendering dynamic translated content immediately, and emits `locale:changed`;
- if the add-item wizard is open during a locale change, rebuild its translated labels/placeholders while preserving its current step and user-entered values, including an embedded illustration preview when present;
- Theme: Core/Selene dropdown above System/Light/Dark color mode buttons;
- Layout: generate Classic/Workspace controls from installed layout plugins; all combinations with Core and Selene are valid;
- Statistics toggle;
- Import and Save;
- click outside or Escape closes panel;
- each setting change updates the five presentation parameters in the current URL with `history.replaceState`, preserving unrelated parameters and the fragment.

URL parameters:
- `lang`: installed locale code (`en` or `fr`);
- `theme`: installed theme ID (`core` or `selene`);
- `color`: `system`, `light` or `dark`;
- `layout`: installed layout ID (`classic` or `workspace`; legacy `two-column` and `one-page` URLs map to `classic`);
- `stats`: `true` or `false`.

A valid URL choice takes priority for that page load without overwriting its saved preference. Missing or invalid choices fall back to saved preferences. An explicit `layout` bypasses the legacy Selene geometry migration for the current page, while the saved layout is still migrated once. Example: `?lang=fr&theme=selene&color=dark&layout=workspace&stats=true`.

Preferences:
- `kite.locale`
- `kite.theme`
- `kite.themeMode`
- `kite.layout` (selected layout)
- `kite.layoutVersion` (one-time migration of former Selene + two-column geometry to Workspace; reads legacy `kite.layoutSchemaVersion` when present)
- `kite.statistics`

Statistics:
- optional panel before the active content sections;
- bookmarks: top 10 tag usage among displayed items;
- structured CV: top 10 skill usage among displayed experiences;
- show count, percentage and accessible labels; each tag pill fits its own text while all horizontal bars start in the same column.

Wizard:
- floating + opens it;
- + becomes × at step 0 and ↩ after step 0;
- Enter advances/submits unless Shift+Enter;
- Escape closes;
- focus the first input of the current step;
- animate unless prefers-reduced-motion.

Bookmarks wizard (3 steps):
1. label;
2. required valid HTTP/HTTPS/file URL;
3. optional comma-separated tags, then add.

CV wizard:
- choose language/course/experience;
- dynamically show relevant steps;
- language: label + optional percent rate;
- course: label + optional percent/date/provider-location;
- experience: title, organization, subtitle, type, format, location, start/end, skills, achievements, optional image upload;
- image dropzone supports click, drag/drop, preview and remove;
- read local image, validate JPEG/PNG/WebP, resize/compress reasonably in-browser if needed, store data URL.

Unsaved changes:
- successful additions increment badges on settings and Save;
- Save clears both badge counts;
- preserve the existing behaviour that removal refreshes the model/view; it need not increment badges unless explicitly implemented consistently.

Import:
- accept yml/yaml;
- select codec by filename extension;
- parse and load the imported document;
- close settings and show localized toast.

Save:
- serialise through active adapter then YAML codec;
- download `<source-base>-export.yml`;
- show localized toast.

# 17. Static HTML

`index.html`:
- `<html lang="en" data-theme="core" data-theme-mode="system" data-layout="classic">` or equivalent defaults;
- English canonical text in markup, converted at runtime using data-i18n attributes;
- mobile viewport, manifest/icon links, theme-color metadata;
- settings button/panel, language/theme/layout/statistics/data controls;
- context menu with a Settings button beside the section menu on wide screens and narrow Core screens; on narrow Selene screens Settings moves into the search/Add row above active content;
- content shell with context menu and active content;
- empty active content state;
- document title, quote, release `v0.5.185` and GitHub link in `app-info`, placed in its own Settings section after the data controls;
- toast region;
- an early inline bootstrap that sets theme, color, layout and language before the first paint, loads only the selected theme/layout stylesheets, and positions the narrow Selene Settings button;
- one module script `./js/main.js`.

Use these exact DOM ids because main.js references them:
settingsButton, settingsNotificationBadge, settingsPanel, languageOptions, themeSelect, layoutOptions,
statisticsToggle, importButton, saveButton, saveNotificationBadge, fileInput,
appName, appDescription, searchInput, addButton, wizard, wizardForm,
wizardTrack, contextMenu, activeContentMenu, tagsTitle, tagsList, activeContent, itemsList, emptyState, toast.

Language/color-mode/layout option buttons use data-locale-value / data-theme-mode-value / data-layout-value respectively. The `languageOptions`, `themeSelect` and `layoutOptions` controls start empty in canonical HTML and are populated at runtime. Rebuild the layout buttons after a locale change.

# 18. CSS and visual design

Keep `css/app.css`, `css/settings.css` and `css/wizard.css` limited to screen structure, spacing, sizing and mobile rules. Put colors, typography, borders, radii, shadows, focus and transition styles directly in both Core and Selene stylesheets. Core and Selene load their own theme stylesheets when selected. The `classic` and `workspace` layout plugins each load a separate stylesheet when selected for document geometry. Do not place layout rules in `css/app.css` or tie them to a theme selector.

Design character:
- theme-specific surfaces for the document and controls;
- Core uses Min Light blue `#1976d2` and Min Dark blue `#79b8ff` for its accent;
- light surface/background defaults and complete dark-theme token overrides;
- layout-specific shell widths and geometry;
- rounded white/dark cards with shadows;
- Selene landscape backgrounds use a subtle lightening gradient toward the upper-left corner, including hover surfaces, while print remains flat;
- Selene uses the Add button landscape-primary background for tag pills, item tags, search, the wizard type selector, wizard text fields and illustration controls, statistics bars, theme selection and Settings action buttons, including active options;
- responsive classic and framed workspace layouts, each usable with either theme;
- compact pill tags, proportional rate fill, accessible focus rings;
- search and Add share an aligned row above active content; Settings sits beside the section menu except on narrow Selene screens, where it joins that row. Core uses 36px controls and Selene scales control size and gaps to 75% while retaining text size;
- the Add button rotates its plus glyph 45 degrees clockwise when the first wizard step opens, then shows an upright back arrow on later steps; the shared reduced-motion rule shortens this transition;
- animated wizard track and settings groups;
- result tabs;
- profile/experience cards with portrait/illustration support;
- statistics horizontal bars with aligned starts and a usable fallback when subgrid is unsupported;
- image upload/dropzone;
- preserve multiline textarea height in Selene and visible keyboard focus for search, wizard fields, upload controls and document panels;
- toast/error states;
- reduced-motion media query;
- print rules that hide `.no-print`, flatten shadows/backgrounds and avoid card fragmentation.

Use CSS custom properties for theme tokens. Use kebab-case classes. Add short section comments for maintainers.

# 19. Bundled document

Create `data/template.yml` using canonical English values and declare both business plugins version 1.0.0.

It must include:

Bookmarks:
1. id 1, label `World Wide Web — first website`, link `https://info.cern.ch/`, tags 1 and 2.
2. id 2, label `MDN Web Docs — Progressive Web Apps`, link `https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps`, tags 2 and 3.

CV identity (all values are deliberately fictional demo data):
- firstName `Camille`
- lastName `EXAMPLE`
- title `Cloud Platform Architect`
- quote `I design resilient platforms that make delivery simpler, safer and observable`
- location `Nantes, FR`
- phone `+33 6 00 00 00 00`
- email `camille@example.com`
- one portfolio social link `https://example.com/camille` using tag id 5
- a generated embedded SVG/PNG/JPEG/WebP data URL as illustration; it MUST NOT depict or derive from a real person

Include exactly two fictional professional experiences:
- `Platform Engineer` at `Acme Cloud Studio`, permanent contract, hybrid, Nantes, 2020/03 to 2023/08;
- `Cloud Platform Architect` at `Example Platform Cooperative`, self-employed, hybrid, Nantes, 2023/09 to `now`.

Include French and English language references, the two fictional courses shown below, and a tag catalogue sufficient to resolve all referenced ids. IDs 1-3 remain the bookmark demonstration tags. Every person, organisation, training provider, contact value and experience narrative introduced for the CV MUST be fictional/example data; use reserved `example.com` URLs for contacts.

Every bundled term that should appear differently in French must have an exact `TERM_TRANSLATIONS` entry in `js/i18n.js`.

Exact logical YAML content to reproduce (replace each symbolic illustration value with a valid locally embedded generated image data URL; generated image bytes may differ):

```yaml
setup:
  plugins:
    - name: bookmarks
      version: "1.0.0"
    - name: cv
      version: "1.0.0"

data:
  bookmarks:
    - id: 1
      label: World Wide Web — first website
      link: https://info.cern.ch/
      tags: [1, 2]
    - id: 2
      label: MDN Web Docs — Progressive Web Apps
      link: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
      tags: [2, 3]

  cv:
    firstName: Camille
    lastName: EXAMPLE
    title: Cloud Platform Architect
    quote: I design resilient platforms that make delivery simpler, safer and observable
    location: Nantes, FR
    phone: +33 6 00 00 00 00
    email: camille@example.com
    social:
      - id: 5
        link: https://example.com/camille
    illustration: <VALID GENERATED EMBEDDED IMAGE DATA URL>
    languages:
      - id: 0
        rate: 1
      - id: 4
        rate: 0.8
    courses:
      - id: 6
        rate: 1
        date: 2022
        location: Example Academy
      - id: 7
        rate: 1
        date: 2024
        location: Demo Institute
    experiences:
      - title: Platform Engineer
        subtitle: Build and operate a shared delivery platform for product teams
        kind: permanent contract
        format: hybrid
        organization: Acme Cloud Studio
        illustration: <VALID GENERATED EMBEDDED IMAGE DATA URL>
        location: Nantes
        startDate: 2020/03
        finishDate: 2023/08
        achievements:
          - Standardise infrastructure provisioning with reusable modules and automated policy checks
          - Introduce service-level objectives and dashboards for critical platform services
          - Reduce deployment friction by creating documented self-service delivery workflows
        employedSkills:
          - id: 8
          - id: 9
          - id: 11
      - title: Cloud Platform Architect
        subtitle: Architecture and enablement for secure cloud-native delivery
        kind: self-employed
        format: hybrid
        organization: Example Platform Cooperative
        illustration: <VALID GENERATED EMBEDDED IMAGE DATA URL>
        location: Nantes
        startDate: 2023/09
        finishDate: now
        achievements:
          - Design reference architectures for containerised applications and shared platform services
          - Facilitate threat-modelling and architecture reviews with product and security teams
          - Create migration playbooks and coaching material for teams adopting the platform
          - Define observability and reliability standards for services moving into production
        employedSkills:
          - id: 10
          - id: 11
          - id: 12
  tags:
    - id: 0
      label: French
    - id: 1
      label: CERN
    - id: 2
      label: WWW
    - id: 3
      label: PWA
    - id: 4
      label: English
    - id: 5
      label: Portfolio
    - id: 6
      label: Cloud Architecture Certificate
    - id: 7
      label: Secure Delivery Practitioner
    - id: 8
      label: Platform engineering
    - id: 9
      label: Infrastructure as code
    - id: 10
      label: Cloud architecture
    - id: 11
      label: Observability
    - id: 12
      label: DevSecOps
```

# 20. Web app manifest and icons

`site.webmanifest`:
- id `./`
- name/short_name `Kite`
- lang `en`
- theme_color `#f6f6f6`
- background_color `#f6f6f6`
- display `standalone`
- start_url/scope `./`
- 192x192 and 512x512 PNG icons, plus maskable 512.

Create a simple Kite favicon/logo in SVG and corresponding raster/icon files. Assets must be local.

# 21. Initial loading and optional styles

Keep the three `css/` files limited to screen structure and responsive layout. Place their visual rules in the shared theme stylesheet, while `css/settings.css` and `css/wizard.css` continue to load on first use. The add-item editor logic lives in `js/app/wizard.js` and is imported on first use. Theme and layout plugins register stylesheet URLs without loading all styles at activation. An early script in `index.html` applies the URL or saved theme/layout before first paint and loads only the selected pair. Keep the initial menu and controls stable while the document loads; an empty mobile tags list must take no space. Test the Selene URL with classic layout and statistics at desktop and narrow widths for layout shifts.

GitHub Pages controls the HTTP `Cache-Control` header for JS/CSS (currently `max-age=600` on the reference deployment). The Service Worker cache cannot alter that first-visit response header. Long browser TTLs require a host or CDN with configurable headers and fingerprinted asset URLs; keep HTML and `sw.js` short lived.

# 22. Service worker

`sw.js`:
- `CACHE_VERSION = "v0.5.185"`;
- precache the complete shell including optional feature styles, theme/layout styles, the wizard module and shared modules;
- installation: cache shell and skipWaiting;
- activation: delete older caches and claim clients;
- intercept same-origin GET only;
- cached response first with background network refresh (stale-while-revalidate style);
- network response cached when OK;
- navigation fallback to cached `./index.html` on network failure;
- comments in English.

# 23. Local helper scripts

Provide `kite.sh`, `kite.ps1`, and `kite.cmd` that:
- change to their own directory;
- serve on `127.0.0.1:8000` using Python 3 / Python if available;
- print English messages;
- require Python only for these helper scripts, not for the application.

# 24. README

Write a polished GitHub-facing README in English that:
- explains the no-build/no-backend architecture;
- gives local start commands;
- explains how to publish with GitHub Pages from a branch using `/(root)` and why the repository includes `.nojekyll`;
- prominently links the live reference demo at `https://sylvain37.github.io/kite/`;
- invites users to install the PWA;
- invites feedback/fixes through PRs and gives contribution expectations;
- explicitly invites users to install the GitHub Pages PWA and contributors to submit focused PRs with screenshots for UI changes;
- explains that the bundled CV is deliberately fictional, uses reserved/example contact data, and asks contributors to use fictional/minimised fixtures rather than personal data in PRs;
- documents architecture, naming conventions, runtime language selection/i18n policy, how to add a locale, plugin contract, business plugins, YAML codec, import/save, themes/layouts/statistics, offline behaviour, security, accessibility/print and validation;
- links to `docs/GENERATE.md`;
- reminds maintainers to add an explicit repository license before accepting third-party contributions if none exists.

# 25. Acceptance checks

Before finishing, perform or emulate all checks possible in your environment and fix failures:

A. Static/syntax
- every JS file parses (`node --check` if Node is available);
- sw.js parses;
- all imports point to existing files;
- service-worker APP_SHELL paths all exist;
- no old identifier variants such as fetchJSON/extOf/escapeHTML remain;
- no French literal UI/code copy remains outside `js/i18n.js` (proper names and README/docs language examples excluded);
- source identifiers follow the naming conventions.

B. YAML
- the local codec parses `data/template.yml`;
- the bundled CV contains only the specified fictional/example identity, contacts, organisations and generated placeholder illustrations;
- no legacy real CV identity, employer/client, phone, email, social URL or portrait data remains anywhere in application source, bundled data or this generation specification;
- stringify(parse(template.yml)) parses again;
- both bookmarks and cv adapters positively probe the parsed default document;
- declared plugin versions match manifests.

C. i18n
- `<html lang="en">` renders English chrome at startup on a first visit with no stored locale preference;
- Settings renders `United Kingdom flag English` and `French flag Français` buttons from `LOCALES`, not hard-coded duplicate locale metadata;
- switching to English updates `<html lang="en">` and retranslates static controls, document-derived exact terms, counters, dates, search context and dynamic result cards immediately without reload;
- the CV section heading `Langues` becomes `Languages` and `Formations` becomes `Courses` when switching to English;
- switching back to French restores `Langues` and `Formations` as well as the rest of the French rendering, and `kite.locale` survives reload;
- every `TRANSLATIONS` entry contains a variant for every locale declared in `LOCALES`; relevant exact terms do likewise in `TERM_TRANSLATIONS`;
- changing locale while the add-item wizard is open preserves the active wizard step and entered values while retranslating its prompts/placeholders;
- canonical English source remains in HTML/default YAML;
- known default metadata displays in English at startup and retranslates to French through exact-term translation when French is selected;
- unknown imported content is unchanged;
- searching a known term finds it using either its English or French form.

D. Browser smoke test

- a URL with all five presentation parameters renders the selected locale, theme, color mode, layout and statistics on a fresh profile and with conflicting saved preferences;
- changing any Settings choice updates all five URL parameters without reloading, preserving unrelated parameters and fragments;
- unsupported URL values fall back to saved preferences; `stats=false` disables saved statistics; visiting an override URL does not overwrite saved preferences;
- default document loads without console errors;
- Bookmarks and CV section rows render above Tags in the sidebar with counts aligned right;
- keyboard navigation works in the vertical section menu;
- search and tag filter work;
- locale/theme/color-mode/layout/statistics settings persist after reload;
- bookmark wizard validates HTTP(S)/file URL and adds an item;
- CV wizard can add a language/course/experience;
- image upload accepts JPEG/PNG/WebP and rejects other formats;
- save downloads valid YAML and clears notification badges;
- import reloads a YAML document;
- malicious markup in a YAML label is rendered as text;
- javascript: URLs do not become active links;
- Service Worker installs and an offline reload works after an online visit.

E. Responsive/accessibility/print
- usable at desktop and mobile widths;
- focus states remain visible;
- controls have meaningful ARIA labels/states;
- prefers-reduced-motion disables nonessential animation;
- print hides interactive controls and keeps content legible.

# 26. Delivery format

Return the complete generated repository, not snippets. Do not ask the user to manually fill missing code. If a tooling limitation prevents byte-identical binary icons/portrait, generate deterministic valid equivalents while preserving every functional file contract and document the difference. The application must run immediately from a static HTTP server.
```

## Maintenance note

When the repository evolves, update this prompt together with architectural changes, new i18n terms, new shell resources and the Service Worker cache version. The purpose of this file is to remain a reproducible implementation specification, not a marketing summary.
