# Kite

Kite is a lightweight, installable and extensible Progressive Web App for exploring, searching, editing, importing and exporting structured YAML documents directly in the browser.

> **No backend and no build step.** Kite uses browser-native ES modules, Web APIs and a small plugin-oriented microkernel. It requires no Node.js runtime, npm dependency, framework, bundler, CDN or remote JavaScript dependency in production.

The bundled source language and the default UI locale are English. `js/i18n.js` is the source of truth for supported locales and translations. Users can switch the complete interface between every locale declared there; the selection is persisted locally and immediately retranslates both static controls and dynamic document rendering. The bundled CV is intentionally fictional and uses reserved/example contact data so the repository can be published safely as a public demonstration.

## Live demo

A public demonstration is available on GitHub Pages:

**https://sylvain37.github.io/kite/**

Open the demo in a compatible browser to try Kite immediately. You can also install it as a PWA from the browser's install/add-to-home-screen command, then test the offline experience after the first successful online load.

## Try it locally

Kite must be served over HTTP so ES modules, `fetch()` and the Service Worker can operate correctly.

```text
Linux/macOS       ./kite.sh
Windows CMD       kite.cmd
Windows PowerShell ./kite.ps1
```

Then open `http://127.0.0.1:8000/`.

The helper scripts use Python only as a static HTTP server when it is available. Any static server such as Apache, nginx, Caddy, a NAS web server or GitHub Pages works as well.

## Publish Kite with GitHub Pages

Kite is a static no-build application, so the repository includes an empty `.nojekyll` file to tell GitHub Pages to publish the files as-is instead of applying Jekyll processing.

1. Create a GitHub repository and push the complete contents of this directory, including `.nojekyll`, to the default branch.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Select the publishing branch, choose `/(root)` as the source folder, and save.
5. Wait for the Pages deployment to complete, then open the published HTTPS URL once while online so the Service Worker can cache the application shell.
6. Share that URL and invite users to install Kite from their browser. The reference deployment for this repository is `https://sylvain37.github.io/kite/`.

All application paths are relative, so Kite can be hosted at the root of a domain or below a GitHub Pages project path.

The bundled `data/default.yml` contains a deliberately fictional CV (`Camille EXAMPLE`) with `example.com` contact links and generated placeholder illustrations. Keep demonstration content fictional when changing it, and still review every bundled file before publishing because GitHub Pages makes the published site content public.

## Install the PWA

Open the published HTTPS URL in a browser that supports PWA installation. Use the browser's **Install app**, **Add to Home Screen** or equivalent command. After the first successful online visit, the application shell and bundled fictional demonstration document can be reopened offline. If you publish a fork, add the installation URL prominently to your repository description or README so testers can install the exact version they are reviewing.

If you are testing a new release and still see an older cached version, reload once while online. Release changes should also bump `CACHE_VERSION` in `sw.js`.

## Give feedback and contribute

Kite is designed to be easy to fork and modify. Start with the public demo at `https://sylvain37.github.io/kite/`, install the PWA, try it with your own local documents, and send feedback, bug fixes, accessibility improvements or new document adapters through pull requests. Do not put personal CV data, secrets or other private information into a PR: reproduce issues with fictional/minimised fixtures instead.

A useful contribution workflow is:

1. Fork the repository and create a focused branch.
2. Reproduce the issue or describe the use case in the PR.
3. Keep source identifiers and canonical copy in English.
4. Add or update every supported locale variant in `js/i18n.js` for each new user-facing term.
5. Keep the application dependency-free unless a change explicitly justifies altering that constraint.
6. Run the validation commands in [Validation](#validation), then open a PR with screenshots when the UI changes.
7. For i18n changes, verify both directions explicitly: English → French and French → English, including plugin-generated section titles.

Small, reviewable PRs are preferred over broad unrelated changes.

## Architecture

Kite is organised around a microkernel. `js/kernel/runtime.js` exposes registries for:

- `codecs`: serialisation codecs;
- `documents`: business/document adapters;
- `themes`: available visual themes;
- `layouts`: available page layouts;
- `services`: shared services;
- `events`, `emit()` and `on()`: an `EventTarget`-based event bus.

Foundation modules declared in `config/kite.json` are loaded at startup. Business plugins are then discovered from the YAML document and loaded dynamically with `import()`.

The main layers are:

```text
index.html                    Static, English canonical UI shell
css/app.css                   Theme and component presentation
config/kite.json              Foundation modules and defaults
data/default.yml              Bundled fictional demonstration document, canonical English data
js/main.js                    Application controller and DOM rendering
js/i18n.js                    Locale catalogue plus UI and exact-term translations
js/shared/                    Reusable data and DOM/safety helpers
js/kernel/                    Registries and runtime/event bus
js/contracts/                 Plugin contract validation
js/app/                       Foundation loading and business-plugin resolution
js/platform/                  File and PWA browser gateways
js/extensions/                YAML codec, themes and layouts
js/plugins/                   Business document adapters
sw.js                         Offline application shell
site.webmanifest              PWA metadata
```

## Naming conventions

The repository uses one naming policy so identifiers communicate their role consistently:

| Role | Convention | Example |
| --- | --- | --- |
| JavaScript variables/functions | `camelCase` | `renderExperienceCard` |
| JavaScript classes | `PascalCase` | `DocumentPluginResolver` |
| Module-level constants | `UPPER_SNAKE_CASE` | `CACHE_VERSION` |
| DOM `id` values/references | `camelCase` | `settingsButton` |
| CSS classes | `kebab-case` | `profile-contact-line` |
| Plugin identifiers | lower-case / dotted namespace / kebab-case | `org.kite.codec.yaml`, `bookmarks` |
| Event names | namespaced lower-case | `document:changed` |
| Canonical source copy | English | `"Open settings"` |

Avoid abbreviations that obscure intent. Reusable behaviour belongs in `js/shared/` rather than being copied between business plugins.

## Internationalisation

`js/i18n.js` is the single source of truth for supported interface languages and translations. It contains:

- `LOCALES`, which declares each selectable language with its code, flag emoji and native language name;
- `TRANSLATIONS`, which stores application messages by semantic key, currently with `en` and `fr` variants;
- `TERM_TRANSLATIONS`, which stores exact canonical data/metadata values and their locale equivalents, including CV section titles such as `Languages ↔ Langues` and `Courses ↔ Formations`.

English is the source-of-truth language in HTML, JavaScript and `data/default.yml`, and it is also the first-visit default (`DEFAULT_LOCALE = "en"` with `<html lang="en">`). **Settings → Language** is generated from `LOCALES`; selecting a language updates `<html lang>`, retranslates the current UI without a reload and stores the choice as `kite.locale` in `localStorage`. A stored locale preference takes precedence on subsequent visits.

Unknown imported user data is never automatically rewritten: `translateTerm()` translates only exact known terms and otherwise returns the original value. On a locale change, Kite rebuilds the active adapter views before repainting them, so plugin-generated labels are recalculated in the target language rather than being frozen in the locale that was active when the document first loaded.

To add a locale, add its metadata to `LOCALES`, then add the same locale code to every entry in `TRANSLATIONS` and every relevant entry in `TERM_TRANSLATIONS`. The Settings selector appears automatically; no HTML button needs to be added manually.

## Plugin contract

An ES module plugin exports a manifest and an activation function:

```js
export const manifest = {
  id: "my-plugin",
  version: "1.0.0",
  kind: "business"
};

export function activate(context) {
  // Register capabilities and return an optional cleanup callback.
  return () => {};
}
```

For a business plugin, the name declared in YAML maps to its directory:

```yaml
setup:
  plugins:
    - name: bookmarks
      version: "1.0.0"
```

This declaration resolves to `js/plugins/bookmarks/plugin.js`. Kite validates the plugin name, manifest, kind and version before activation.

A document adapter registered in `context.documents` can expose:

```js
{
  id,
  probe(data),
  load(data),
  serialize(model),
  toView(model),
  add(model, values),    // optional
  remove(model, id)      // optional
}
```

`probe()` returns a score. Kite selects the positive-scoring adapter with the highest score. `toView()` produces a normalised view consumed by the generic UI renderer.

## Bundled business plugins

### `bookmarks`

Manages links and tags with live search, tag filtering, guided creation, deletion, tag creation/reuse and safely opened URLs.

### `cv`

When a document contains `data.cv`, the adapter renders a structured profile with contact details, social links, languages, courses and experiences. References from `social`, `languages`, `courses` and `employedSkills` are resolved against `data.tags`. A `rate` between `0` and `1` is rendered as proportional tag fill. Embedded JPEG, PNG and WebP data URLs are supported for CV illustrations.

Without `data.cv`, the plugin retains a generic recursive YAML fallback.

## YAML codec

The local `org.kite.codec.yaml` extension supports mappings, sequences, quoted and unquoted strings, numbers, booleans, `null`, comments, indentation and serialisation without an external library.

Example:

```yaml
setup:
  plugins:
    - name: bookmarks
      version: "1.0.0"

data:
  bookmarks:
    - id: 1
      label: MDN
      link: https://developer.mozilla.org/
      tags:
        - 1
  tags:
    - id: 1
      label: web
```

## Import, edit and save

The settings menu can import `.yml`/`.yaml` files using native browser file APIs and export the current model using `Blob`, `URL.createObjectURL()` and an `<a download>` action.

The exported file is named `<original-name>-export.yml`. Additions raise notification badges on both settings and save controls until the document is saved.

## Language, themes, layouts and statistics

Kite currently ships with English (`🇬🇧 English`) and French (`🇫🇷 Français`) interface choices, System/Light/Dark themes, and `two-column`/`one-page` layouts. The locale, theme, layout and statistics preferences are stored in `localStorage` under `kite.locale`, `kite.theme`, `kite.layout` and `kite.statistics`.

Changing language retranslates the current result cards, counters, search context and an open add-item wizard while preserving its in-progress values. Theme and layout preferences are applied through `data-theme` and `data-layout` attributes on `<html>`.

Optional statistics show the ten most-used tags for bookmarks or skills for CV experiences in the current result set. The preference is also stored locally.

## Offline behaviour

`sw.js` precaches the application shell at install time, removes obsolete caches on activation and handles only same-origin `GET` requests. Cached resources are returned immediately and refreshed from the network in the background. Offline navigations fall back to `index.html`.

## Security model

Imported YAML is treated as untrusted content:

- dynamic HTML text is escaped;
- URLs are filtered through central helpers;
- general links allow only `http:`, `https:`, `mailto:` and `tel:`;
- CV images allow safe HTTP(S) sources or explicitly validated image data URLs;
- `javascript:` is rejected;
- external HTTP(S) links opened in a new tab use `rel="noopener"`.

Keep URL validation and HTML escaping in `js/shared/dom.js` so new renderers use the same policy.

## Accessibility and print

The UI includes ARIA labels/states, keyboard-operable result tabs, Escape handling, wizard focus management, `prefers-reduced-motion` support and a print stylesheet that removes application controls and avoids splitting cards where possible.

## Add a business plugin

1. Create `js/plugins/my-plugin/plugin.js`.
2. Export a `manifest` with `id: "my-plugin"`, a version and `kind: "business"`.
3. Implement an adapter with at least `probe`, `load`, `serialize` and `toView`.
4. Register it from `activate()` with `context.documents.register(adapter.id, adapter)`.
5. Declare the plugin with the same version in `setup.plugins` of the YAML document.

No kernel modification is required.

## Validation

The project deliberately has no package manager, so the baseline checks use tools commonly available on a development machine:

```sh
# Syntax-check every JavaScript module.
find js -name '*.js' -type f -exec node --check {} \;
node --check sw.js

# Start the static application.
./kite.sh
```

Then verify in a browser that a first visit loads the default document in English, the Settings language buttons switch the whole interface to French and back without a reload, `Languages` becomes `Langues`, `Courses` becomes `Formations` and both return to English correctly, the selected locale persists after reload, search/filtering works in both languages, both result tabs work, add/save/import actions work, theme/layout/statistics preferences persist, and an installed/offline reload succeeds.

## Reproduce the repository from scratch

A self-contained generation brief for an AI coding agent is available in [`docs/GENERATE.md`](docs/GENERATE.md). It captures the architecture, constraints, expected behaviour, data/i18n policy and acceptance criteria for this release.

## License

Add the repository's chosen license before accepting third-party contributions, and make that license explicit in the GitHub repository metadata.
