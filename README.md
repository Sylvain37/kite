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

GitHub Pages currently sends `Cache-Control: max-age=600` for this site's JavaScript and CSS. Repository files and the Service Worker cannot change that HTTP response header for first visits. To use longer browser cache lifetimes, host the static files behind a server or CDN that lets you set response headers. Give fingerprinted JS/CSS asset URLs a long lifetime such as `public, max-age=31536000, immutable`, and keep `index.html` and `sw.js` short lived so visitors discover releases. A longer lifetime on Kite's current unversioned JS/CSS URLs would risk stale modules after deployment. Continue increasing the visible app version and `CACHE_VERSION` together for each release.

The bundled `data/template.yml` contains a deliberately fictional CV (`Camille EXAMPLE`) with `example.com` contact links and generated placeholder illustrations. Kite first tries the optional `data/data.yml` user document, then falls back to this template. `data/data.yml` is ignored by Git and is never included in a release; deploy it separately when persistent user data is wanted. Keep demonstration content fictional when changing it, and still review every bundled file before publishing because GitHub Pages makes the published site content public.

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
- `layouts`: installed document layouts;
- `services`: shared services;
- `events`, `emit()` and `on()`: an `EventTarget`-based event bus.

Foundation modules declared in `config/kite.json` are loaded at startup. Business plugins are then discovered from the YAML document and loaded dynamically with `import()`.

The main layers are:

```text
index.html                    Static, English canonical UI shell
css/                          Screen structure and responsive layout only
js/extensions/themes/core/, selene/  Complete visual styles for each theme
config/kite.json              Foundation modules and defaults
data/template.yml              Bundled fictional demonstration document, canonical English data
js/main.js                    Startup, application controller and document rendering
js/app/wizard.js              Add-item editor, imported on first use
js/i18n.js                    Locale catalogue plus UI and exact-term translations
js/shared/                    Reusable data and DOM/safety helpers
js/kernel/                    Registries and runtime/event bus
js/contracts/                 Plugin contract validation
js/app/                       Foundation loading and business-plugin resolution
js/platform/                  File, stylesheet and PWA browser gateways
js/extensions/                YAML codec, theme plugins, and autonomous layout plugins with their stylesheets
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

- `LOCALES`, which declares each selectable language with its code, flat flag SVG and native language name;
- `TRANSLATIONS`, which stores application messages by semantic key, currently with `en` and `fr` variants;
- `TERM_TRANSLATIONS`, which stores exact canonical data/metadata values and their locale equivalents, including CV section titles such as `Languages ↔ Langues` and `Courses ↔ Formations`.

English is the source-of-truth language in HTML, JavaScript and `data/template.yml`, and it is also the first-visit default (`DEFAULT_LOCALE = "en"` with `<html lang="en">`). **Settings → Language** is generated from `LOCALES`; selecting a language updates `<html lang>`, retranslates the current UI without a reload and stores the choice as `kite.locale` in `localStorage`. A stored locale preference takes precedence on subsequent visits.

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

The exported file is named `<original-name>-export.yml`. Additions show the same small dot on Settings and Save until the document is saved. Both buttons keep the count in their accessible labels.

## Language, themes, layouts and statistics

Kite ships with English (`United Kingdom flag/English`) and French (`French flag/Français`) interface choices. The theme list contains **Core** and **Selene**; each supports System, Light and Dark color modes. The independent Layout control offers `classic` and `workspace`, and every layout can be combined with either theme. The locale, theme, color mode, layout and statistics preferences are stored in `localStorage` under `kite.locale`, `kite.theme`, `kite.themeMode`, `kite.layout` and `kite.statistics`. Existing System/Light/Dark values in `kite.theme` are migrated to Core on startup. Existing Selene users with legacy `two-column` are moved once to `workspace` to preserve their previous arrangement. Other saved `two-column` and `one-page` choices map to `classic`; old URL values also resolve to `classic`. Classic shows two columns above 760px and the former one-page flow at 760px or less.

Use URL parameters to open a specific presentation, for example:
`?lang=fr&theme=selene&color=dark&layout=workspace&stats=true`.
`lang` accepts `en` or `fr`; `theme` and `layout` accept IDs registered by installed plugins; `color` accepts `system`, `light` or `dark`; `stats` accepts `true` or `false`. Valid URL values override saved preferences for that visit without changing them. Missing or invalid values fall back to saved preferences. Changing a setting updates all five parameters in the address bar without reloading and preserves unrelated parameters and the fragment.

Changing language retranslates the current active content cards, counters, search context, layout labels and an open add-item wizard while preserving its in-progress values. Theme, color mode and layout preferences are applied through `data-theme`, `data-theme-mode` and `data-layout` attributes on `<html>`.

Core and Selene are theme plugins in `js/extensions/themes/core/` and `js/extensions/themes/selene/`. Core adapts [Min Light and Min Dark by Miguel Solorio](https://github.com/miguelsolorio/min-theme) to Kite’s color roles; Selene retains its own palette. Each plugin registers a `style.css` URL that loads when selected. The two layout plugins live in `js/extensions/layouts/classic/` and `js/extensions/layouts/workspace/`; each registers one choice and loads its `style.css` when selected. `css/` contains only screen structure and responsive rules; each theme keeps its complete visual component rules in its own stylesheet. Add a `theme` or `layout` foundation entry to `config/kite.json` to install another plugin; Settings builds the theme and layout choices from their registries. All bundled plugin stylesheets are precached for offline use.

Both themes use the same CSS color roles, defined separately for light and dark modes in `js/extensions/themes/core/style.css` and `js/extensions/themes/selene/style.css`. System mode follows the matching system color scheme. `background` is the page canvas; `landscape-primary`, `landscape-secondary`, `landscape-inverted`, `landscape-delimited` and `landscape-filled` describe structural surfaces and their borders. `inactive-primary`, `inactive-secondary`, `inactive-inverted`, `inactive-delimited` and `inactive-filled` describe ordinary text and controls. Their `active-*` counterparts describe selected text, borders and fills. `hover`, `focus` and `accent` cover interaction and brand colors. `success-state`, `error-state`, `warning-state` and `pending-state` are status colors; `shadow` is the elevation shadow. Components consume these roles instead of declaring colors directly. Selene adds a subtle top-left lightening gradient to landscape-backed surfaces; print uses flat monochrome colors.

Optional statistics show the ten most-used tags for bookmarks or skills for CV experiences in the current active content. The preference is also stored locally.

## Offline behaviour

`sw.js` precaches the application shell at install time, removes obsolete caches on activation and handles only same-origin `GET` requests. Cached resources are returned immediately and refreshed from the network in the background. Offline navigations fall back to `index.html`.

## Security model

Imported YAML is treated as untrusted content:

- dynamic HTML text is escaped;
- URLs are filtered through central helpers;
- general links allow only `http:`, `https:`, `file:`, `mailto:` and `tel:`;
- CV images allow safe HTTP(S) sources or explicitly validated image data URLs;
- `javascript:` is rejected;
- external HTTP(S) links opened in a new tab use `rel="noopener"`.

Keep URL validation and HTML escaping in `js/shared/dom.js` so new renderers use the same policy.

## Accessibility and print

The UI includes ARIA labels/states, a keyboard-operable section menu above Tags, a settings button beside the section menu on wide screens and narrow Core screens, or beside search and Add on narrow Selene screens, Escape handling, wizard focus management, `prefers-reduced-motion` support and a print stylesheet that removes application controls and avoids splitting cards where possible.

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

Then verify in a browser that a first visit loads the default document in English, the Settings language buttons switch the whole interface to French and back without a reload, `Languages` becomes `Langues`, `Courses` becomes `Formations` and both return to English correctly, the selected locale persists after reload, search/filtering works in both languages, both section menu entries work, add/save/import actions work, theme/color-mode/layout/statistics preferences persist, and an installed/offline reload succeeds.

## Reproduce the repository from scratch

A self-contained generation brief for an AI coding agent is available in [`docs/GENERATE.md`](docs/GENERATE.md). It captures the architecture, constraints, expected behaviour, data/i18n policy and acceptance criteria for this release.

## License

Add the repository's chosen license before accepting third-party contributions, and make that license explicit in the GitHub repository metadata.
