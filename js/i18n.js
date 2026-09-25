/**
 * Lightweight internationalisation layer.
 *
 * English is both the canonical source language and the default display locale.
 * A valid `lang` URL parameter takes priority over the stored `kite.locale` preference;
 * this constant is the fallback used for first visits and unsupported locale codes.
 */
export const DEFAULT_LOCALE = "en";

function freezeVariants(variants) {
  return Object.freeze(variants);
}

/**
 * Supported interface locales.
 *
 * Keep language metadata here so Settings can be generated without duplicating
 * locale knowledge in the HTML or controller. `name` is intentionally written
 * in the language itself so each choice remains recognisable after a locale
 * switch. Add a matching variant to every translation entry when adding a locale.
 */
export const LOCALES = Object.freeze({
  en: Object.freeze({ code: "en", flag: "gb", name: "English" }),
  fr: Object.freeze({ code: "fr", flag: "fr", name: "Français" })
});

export const TRANSLATIONS = Object.freeze({
  // Static application chrome.
  appDescription: freezeVariants({
    en: "Kite — lightweight, extensible PWA for exploring YAML documents.",
    fr: "Kite — PWA légère et extensible pour explorer des documents YAML."
  }),
  settingsOpen: freezeVariants({ en: "Open settings", fr: "Ouvrir les paramètres" }),
  settingsClose: freezeVariants({ en: "Close settings", fr: "Fermer les paramètres" }),
  settingsPanel: freezeVariants({ en: "Kite settings", fr: "Paramètres de Kite" }),
  settingsGeneral: freezeVariants({ en: "General", fr: "Général" }),
  settingsInterface: freezeVariants({ en: "Interface", fr: "Interface" }),
  settingsInformations: freezeVariants({ en: "Informations", fr: "Informations" }),
  importData: freezeVariants({ en: "Import data", fr: "Importer des données" }),
  importDataDescription: freezeVariants({ en: "Imports structured data in YAML format, overwriting the current session", fr: "Importe des données structurées au format YAML et remplace la session en cours" }),
  saveData: freezeVariants({ en: "Save data", fr: "Sauvegarder les données" }),
  saveDataDescription: freezeVariants({ en: "Save the current session into a YAML file", fr: "Sauvegarde la session en cours dans un fichier YAML" }),
  showStatistics: freezeVariants({ en: "Show statistics", fr: "Afficher les statistiques" }),
  showStatisticsDescription: freezeVariants({ en: "Shows usage statistics for the displayed items", fr: "Affiche les statistiques d’utilisation des éléments affichés" }),
  currentLanguage: freezeVariants({ en: "Current language", fr: "Langue actuelle" }),
  currentLanguageDescription: freezeVariants({ en: "Select the display language for the session; keep in mind that data added during the session is not automatically translated in the js/i18n.js dictionary", fr: "Sélectionnez la langue d’affichage de la session ; les données ajoutées pendant la session ne sont pas automatiquement traduites dans le dictionnaire js/i18n.js" }),
  currentTheme: freezeVariants({ en: "Current theme", fr: "Thème actuel" }),
  currentThemeDescription: freezeVariants({ en: "Choose the interface theme", fr: "Choisissez le thème de l’interface" }),
  currentLayout: freezeVariants({ en: "Current layout", fr: "Disposition actuelle" }),
  currentLayoutDescription: freezeVariants({ en: "Choose the interface layout", fr: "Choisissez la disposition de l’interface" }),
  applicationSpecifications: freezeVariants({ en: "Application specifications", fr: "Spécifications de l’application" }),
  interfaceLanguage: freezeVariants({ en: "Language", fr: "Langue" }),
  theme: freezeVariants({ en: "Theme", fr: "Thème" }),
  themeSystem: freezeVariants({ en: "System", fr: "Système" }),
  themeLight: freezeVariants({ en: "Light", fr: "Clair" }),
  themeDark: freezeVariants({ en: "Dark", fr: "Sombre" }),
  layout: freezeVariants({ en: "Layout", fr: "Disposition" }),
  layoutClassic: freezeVariants({ en: "Classic", fr: "Classique" }),
  layoutWorkspace: freezeVariants({ en: "Workspace", fr: "Espace de travail" }),
  statistics: freezeVariants({ en: "Statistics", fr: "Statistiques" }),
  itemCount: freezeVariants({ en: "Item count", fr: "Nombre d’éléments" }),
  show: freezeVariants({ en: "Show", fr: "Afficher" }),
  hide: freezeVariants({ en: "Hide", fr: "Masquer" }),
  data: freezeVariants({ en: "Data", fr: "Données" }),
  applicationInformations: freezeVariants({ en: "Application Informations", fr: "Informations de l’application" }),
  applicationName: freezeVariants({ en: "Name:", fr: "Nom :" }),
  applicationDescription: freezeVariants({ en: "Description:", fr: "Description :" }),
  applicationVersion: freezeVariants({ en: "Version:", fr: "Version :" }),
  moreInfo: freezeVariants({ en: "More info:", fr: "Plus d’informations :" }),
  import: freezeVariants({ en: "Import", fr: "Importer" }),
  importYaml: freezeVariants({ en: "Import a YAML file", fr: "Importer un fichier YAML" }),
  save: freezeVariants({ en: "Save", fr: "Sauvegarder" }),
  saveYaml: freezeVariants({ en: "Save the YAML document", fr: "Sauvegarder le document YAML" }),
  search: freezeVariants({ en: "Search…", fr: "Rechercher…" }),
  searchDocument: freezeVariants({ en: "Search the document", fr: "Rechercher dans le document" }),
  searchSection: freezeVariants({ en: "Search in {section}", fr: "Rechercher dans {section}" }),
  searchSectionPlaceholder: freezeVariants({ en: "Search in {section}…", fr: "Rechercher dans {section}…" }),
  addItem: freezeVariants({ en: "Add an item", fr: "Ajouter un élément" }),
  writerEditor: freezeVariants({ en: "Writer Markdown", fr: "Markdown Writer" }),
  writerExportMarkdown: freezeVariants({ en: "Export current Writer document as Markdown", fr: "Exporter le document Writer actif au format Markdown" }),
  writerExportPdf: freezeVariants({ en: "Print as PDF", fr: "Imprimer en PDF" }),
  exportDocuments: freezeVariants({ en: "Export documents", fr: "Exporter des documents" }),
  exportDocumentsDescription: freezeVariants({ en: "Export the current document to various media", fr: "Exporte le document actuel vers différents médias" }),
  writerCopyCode: freezeVariants({ en: "Copy code", fr: "Copier le code" }),
  writerShowPreview: freezeVariants({ en: "Show preview", fr: "Afficher le rendu" }),
  writerShowEditor: freezeVariants({ en: "Show editor", fr: "Afficher l’éditeur" }),
  addItemSection: freezeVariants({ en: "Add an item to {section}", fr: "Ajouter un élément dans {section}" }),
  cancelAdd: freezeVariants({ en: "Cancel adding", fr: "Annuler l'ajout" }),
  previousStep: freezeVariants({ en: "Go back to the previous step", fr: "Revenir à l'étape précédente" }),
  contextMenu: freezeVariants({ en: "Context menu", fr: "Menu contextuel" }),
  tags: freezeVariants({ en: "Tags", fr: "Tags" }),
  activeContent: freezeVariants({ en: "Active content", fr: "Contenu actif" }),
  activeContentSections: freezeVariants({ en: "Active content sections", fr: "Sections du contenu actif" }),
  noActiveContent: freezeVariants({ en: "No content to display", fr: "Aucun contenu à afficher" }),
  noActiveContentHint: freezeVariants({ en: "Change the search or active filter.", fr: "Modifiez la recherche ou le filtre actif." }),

  // Statistics and counters.
  skillUsage: freezeVariants({ en: "Skill usage", fr: "Utilisation des compétences" }),
  tagUsage: freezeVariants({ en: "Tag usage", fr: "Utilisation des tags" }),
  noSkillUsage: freezeVariants({
    en: "No skills are used by the displayed experiences.",
    fr: "Aucune compétence utilisée par les expériences affichées."
  }),
  noTagUsage: freezeVariants({
    en: "No tags are used by the displayed items.",
    fr: "Aucun tag utilisé par les éléments affichés."
  }),
  itemSingular: freezeVariants({ en: "item", fr: "élément" }),
  itemPlural: freezeVariants({ en: "items", fr: "éléments" }),
  experienceSingular: freezeVariants({ en: "experience", fr: "expérience" }),
  experiencePlural: freezeVariants({ en: "experiences", fr: "expériences" }),
  countOutOfTotal: freezeVariants({ en: "{count} out of {total}, {percent}%", fr: "{count} sur {total}, {percent} %" }),

  // CV rendering labels.
  duration: freezeVariants({ en: "Duration", fr: "Durée" }),
  location: freezeVariants({ en: "Location", fr: "Lieu" }),
  type: freezeVariants({ en: "Type", fr: "Type" }),
  format: freezeVariants({ en: "Format", fr: "Format" }),
  date: freezeVariants({ en: "Date", fr: "Date" }),
  contactDetails: freezeVariants({ en: "Contact details", fr: "Coordonnées" }),
  removeItem: freezeVariants({ en: "Remove {label}", fr: "Supprimer {label}" }),
  ratingOutOfFive: freezeVariants({ en: "{score} out of 5", fr: "{score} sur 5" }),
  sinceDate: freezeVariants({ en: "Since {date}", fr: "Depuis {date}" }),
  lessThanMonth: freezeVariants({ en: "Less than one month", fr: "Moins d’un mois" }),
  monthSingular: freezeVariants({ en: "month", fr: "mois" }),
  monthPlural: freezeVariants({ en: "months", fr: "mois" }),
  yearSingular: freezeVariants({ en: "year", fr: "an" }),
  yearPlural: freezeVariants({ en: "years", fr: "ans" }),
  languages: freezeVariants({ en: "Languages", fr: "Langues" }),
  courses: freezeVariants({ en: "Courses", fr: "Formations" }),
  profile: freezeVariants({ en: "Profile", fr: "Profil" }),
  socialLink: freezeVariants({ en: "Link {index}", fr: "Lien {index}" }),
  courseFallback: freezeVariants({ en: "Course {index}", fr: "Formation {index}" }),
  experienceFallback: freezeVariants({ en: "Experience {index}", fr: "Expérience {index}" }),

  // Wizard copy.
  continueWithEnter: freezeVariants({ en: "Press Enter to continue", fr: "Taper la touche Entrée pour continuer" }),
  addWithEnter: freezeVariants({ en: "Press Enter to add the item", fr: "Taper la touche Entrée pour ajouter l'élément" }),
  bookmarkLabelPrompt: freezeVariants({ en: "Label of the item to add", fr: "Label de l'objet à ajouter" }),
  bookmarkUrlPrompt: freezeVariants({ en: "Item URL", fr: "URL de l'objet" }),
  bookmarkTagsPrompt: freezeVariants({ en: "Tags associated with the item", fr: "Tags associés à l'objet" }),
  directoryEntryType: freezeVariants({ en: "Directory entry type", fr: "Type d’entrée de l’annuaire" }),
  directoryContact: freezeVariants({ en: "Contact", fr: "Contact" }),
  directoryTeamMember: freezeVariants({ en: "Team", fr: "Équipe" }),
  directoryOrgBranch: freezeVariants({ en: "Organisation branch", fr: "Branche d’organigramme" }),
  directoryMainInformation: freezeVariants({ en: "Main information", fr: "Informations principales" }),
  directoryDetails: freezeVariants({ en: "Contact details", fr: "Coordonnées" }),
  directoryRole: freezeVariants({ en: "Role", fr: "Rôle" }),
  directoryOrganization: freezeVariants({ en: "Organisation", fr: "Organisation" }),
  directoryParent: freezeVariants({ en: "Parent contact or team", fr: "Contact ou équipe parent" }),
  directoryMemberTeams: freezeVariants({ en: "Member of teams, comma-separated", fr: "Membre des équipes, séparées par des virgules" }),
  directoryContacts: freezeVariants({ en: "Contact IDs, comma-separated", fr: "Identifiants de contacts, séparés par des virgules" }),
  directorySourceType: freezeVariants({ en: "Source type: contact or team", fr: "Type de source : contact ou équipe" }),
  directorySourceId: freezeVariants({ en: "Source contact or team ID", fr: "Identifiant du contact ou de l’équipe source" }),
  cvItemType: freezeVariants({ en: "CV item type", fr: "Type d'élément CV" }),
  language: freezeVariants({ en: "Language", fr: "Langue" }),
  course: freezeVariants({ en: "Course", fr: "Formation" }),
  experience: freezeVariants({ en: "Experience", fr: "Expérience" }),
  mainInformation: freezeVariants({ en: "Main information", fr: "Informations principales" }),
  additionalInformation: freezeVariants({ en: "Additional information", fr: "Informations complémentaires" }),
  languagePlaceholder: freezeVariants({ en: "Language — e.g. Spanish", fr: "Langue — ex. Espagnol" }),
  coursePlaceholder: freezeVariants({ en: "Course — e.g. Kubernetes CKA", fr: "Formation — ex. Kubernetes CKA" }),
  datePlaceholder: freezeVariants({ en: "Date — e.g. 2026", fr: "Date — ex. 2026" }),
  providerLocationPlaceholder: freezeVariants({ en: "Provider / location", fr: "Organisme / lieu" }),
  experienceTitlePlaceholder: freezeVariants({ en: "Experience title", fr: "Titre de l’expérience" }),
  organizationPlaceholder: freezeVariants({ en: "Organization", fr: "Organisation" }),
  shortDescriptionPlaceholder: freezeVariants({ en: "Short description", fr: "Description courte" }),
  levelPercentPlaceholder: freezeVariants({ en: "Level in % — e.g. 80", fr: "Niveau en % — ex. 80" }),
  scorePercentPlaceholder: freezeVariants({ en: "Level / score in %", fr: "Niveau / score en %" }),
  experienceKindPlaceholder: freezeVariants({ en: "Type — e.g. permanent, contract, personal project", fr: "Type — ex. CDI, mission, expérience perso" }),
  experienceFormatPlaceholder: freezeVariants({ en: "Format — e.g. hybrid", fr: "Format — ex. hybride" }),
  locationPlaceholder: freezeVariants({ en: "Location", fr: "Lieu" }),
  startPlaceholder: freezeVariants({ en: "Start", fr: "Début" }),
  finishPlaceholder: freezeVariants({ en: "End", fr: "Fin" }),
  skillsPlaceholder: freezeVariants({ en: "Skills, comma-separated — e.g. PWA, Kubernetes", fr: "Compétences, séparées par des virgules — ex. PWA, Kubernetes" }),
  achievementsPlaceholder: freezeVariants({ en: "Achievements, one per line", fr: "Réalisations, séparées un retour à la ligne" }),
  experienceIllustration: freezeVariants({ en: "Experience illustration", fr: "Illustration de l’expérience" }),
  illustrationDropHint: freezeVariants({ en: "Drop an image here or click to browse", fr: "Glisser-déposer une image ici ou cliquer pour parcourir" }),
  imageFormats: freezeVariants({ en: "JPEG, PNG or WebP", fr: "JPEG, PNG ou WebP" }),
  experienceIllustrationPreview: freezeVariants({ en: "Experience illustration preview", fr: "Aperçu de l’illustration de l’expérience" }),
  removeIllustration: freezeVariants({ en: "Remove illustration", fr: "Retirer l’illustration" }),

  // User-facing errors and notifications.
  invalidLinkUrl: freezeVariants({ en: "Enter a valid http://, https:// or file:// URL.", fr: "Saisissez une URL http://, https:// ou file:// valide." }),
  unsupportedYaml: freezeVariants({ en: "This file type is not supported. Use .yml or .yaml.", fr: "Ce type de fichier n'est pas pris en charge. Utilisez .yml ou .yaml." }),
  importedFile: freezeVariants({ en: "{name} imported.", fr: "{name} importé." }),
  yamlSaveReady: freezeVariants({ en: "YAML save prepared.", fr: "Sauvegarde YAML préparée." }),
  importFailed: freezeVariants({ en: "Import failed.", fr: "Import impossible." }),
  imageReadFailed: freezeVariants({ en: "Unable to read the image.", fr: "Impossible de lire l’image." }),
  imageLoadFailed: freezeVariants({ en: "Unable to load the image.", fr: "Impossible de charger l’image." }),
  unsupportedImage: freezeVariants({ en: "Use a JPEG, PNG or WebP image.", fr: "Utilisez une image JPEG, PNG ou WebP." }),
  unsupportedImageFormat: freezeVariants({ en: "Unsupported image format.", fr: "Format d’image non pris en charge." }),
  startupFailedTitle: freezeVariants({ en: "Kite could not start.", fr: "Kite n'a pas pu démarrer." }),
  startupFailed: freezeVariants({ en: "Startup error.", fr: "Erreur de démarrage." }),
  languageNameRequired: freezeVariants({ en: "The language name is required.", fr: "Le nom de la langue est requis." }),
  courseNameRequired: freezeVariants({ en: "The course name is required.", fr: "Le nom de la formation est requis." }),
  experienceTitleRequired: freezeVariants({ en: "The experience title is required.", fr: "Le titre de l’expérience est requis." }),
  unsupportedCvItemType: freezeVariants({ en: "Unsupported CV item type.", fr: "Type d'élément CV non pris en charge." }),
  settingsChanges: freezeVariants({ en: " — {count} new {item}", fr: " — {count} nouvel{suffix} élément{plural}" }),
  saveChanges: freezeVariants({ en: " — {count} new {item} to save", fr: " — {count} nouvel{suffix} élément{plural} à sauvegarder" })
});

/**
 * Exact translations for canonical data values bundled in template.yml and for
 * well-known metadata values that may also appear in imported documents.
 */
export const TERM_TRANSLATIONS = Object.freeze({
  appQuote: freezeVariants({
    en: "Kite means \"see\" in Māori => a lightweight, extensible PWA for displaying, searching and analysing information",
    fr: "Kite signifie \"voir\" en Maori => une PWA légère et extensible pour afficher, rechercher et analyser des informations"
  }),
  experienceFormatOnSite: freezeVariants({ en: "on site", fr: "sur site" }),
  experienceFormatHybrid: freezeVariants({ en: "hybrid", fr: "hybride" }),
  experienceKindSelfEmployed: freezeVariants({ en: "self-employed", fr: "freelance" }),
  experienceKindPermanent: freezeVariants({ en: "permanent contract", fr: "CDI" }),
  now: freezeVariants({ en: "now", fr: "maintenant" }),
  writerDocumentOne: freezeVariants({ en: "Writer document 1", fr: "Document Writer 1" }),
  writerDocumentContent: freezeVariants({"en": "# Markdown use case examples compatible with CommonMark/GFM/GLFM syntax\n\n## Horizontal rule\n\nCode:\n\n```plaintext\n---\n```\n\nResult:\n\n---\n\n## Table of contents\n\n> Automatically generates a list of links to document headings.\n\nCode:\n\n```plaintext\n[[TOC]]\n```\n\nResult:\n\n[[TOC]]\n\n## Headings\n\nCode:\n\n```plaintext\n# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6\n```\n\nResult:\n\n# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6\n\n## Links\n\nCode:\n\n```plaintext\n- [Inline link](https://example.com)\n- [Reference link][ref]\n- Autolink : https://example.com\n- Email : contact@example.com\n\n[ref]: https://example.com\n```\n\nResult:\n\n- [Inline link](https://example.com)\n- [Reference link][ref]\n- Autolink : https://example.com\n- Email : contact@example.com\n\n[ref]: https://example.com\n\n## Lists\n\n### Bulleted\n\nCode:\n\n```plaintext\n- Item A\n- Item B\n  - Nested item\n- Item C\n```\n\nResult:\n\n- Item A\n- Item B\n  - Nested item\n- Item C\n\n### Numbered\n\nCode:\n\n```plaintext\n1. First\n2. Second\n   1. Nested item\n3. Third\n```\n\nResult:\n\n1. First\n2. Second\n   1. Nested item\n3. Third\n\n### Task lists\n\nCode:\n\n```plaintext\n- [x] Completed task\n- [ ] Task in progress\n  - [x] Completed subtask\n  - [ ] Subtask to do\n```\n\nResult:\n\n- [x] Completed task\n- [ ] Task in progress\n  - [x] Completed subtask\n  - [ ] Subtask to do\n\n## Description lists\n\nCode:\n\n```plaintext\nFruits\n: apple\n: orange\n\nVegetables\n: broccoli\n: kale\n```\n\nResult:\n\nFruits\n: apple\n: orange\n\nVegetables\n: broccoli\n: kale\n\n## Tags\n\nCode:\n\n```plaintext\n##Markdown## ##Multi word tag##\n```\n\nResults:\n\n##Markdown## ##Multi word tag##\n\n## Formatting\n\nCode:\n\n```plaintext\n**Bold** | *Italic* | ***Bold italic*** | ~~Strikethrough~~ | `code inline`\n\nCombination: **bold with `code` and *italic***\n```\n\nResult:\n\n**Bold** | *Italic* | ***Bold italic*** | ~~Strikethrough~~ | `code inline`\n\nCombination: **bold with `code` and *italic***\n\n## Blockquotes\n\n### Simple blockquote\n\nCode:\n\n```plaintext\n> Simple quote.\n> With a **first paragraph**.\n>\n> With a **second paragraph**.\n```\n\nResult:\n\n> Simple quote.\n> With a **first paragraph**.\n>\n> With a **second paragraph**.\n\n### Multiline blockquote\n\nCode:\n\n```plaintext\n>>>\nMultiline quote.\nEach line does not need to start with `>>>`.\nUseful for quoting a long message.\n>>>\n```\n\nResult:\n\n>>>\nMultiline quote.\nEach line does not need to start with `>>>`.\nUseful for quoting a long message.\n>>>\n\n## Forced line break\n\nCode:\n\n```plaintext\nLine 1\\\\\nLine 2 (same paragraph)\n```\n\nResult:\n\nLine 1\\\\\nLine 2 (same paragraph)\n\n## Color chips\n\n> Colors are rendered as inline color chips.\n\nCode:\n\n```plaintext\n- HEX : `#FF5733`\n- HEX alpha : `#FF5733AA`\n- RGB : `RGB(255, 87, 51)`\n- RGBA : `RGBA(255, 87, 51, 0.5)`\n- HSL : `HSL(12, 100%, 60%)`\n- HSLA : `HSLA(12, 100%, 60%, 0.5)`\n```\n\nResult:\n\n- HEX : `#FF5733`\n- HEX alpha : `#FF5733AA`\n- RGB : `RGB(255, 87, 51)`\n- RGBA : `RGBA(255, 87, 51, 0.5)`\n- HSL : `HSL(12, 100%, 60%)`\n- HSLA : `HSLA(12, 100%, 60%, 0.5)`\n\n## Inline diff\n\nCode:\n\n```plaintext\n- {+ added text +}\n- [- removed text -]\n- [+ another added form +]\n- [- another removed form -]\n```\n\nResult:\n\n- {+ added text +}\n- [- removed text -]\n- [+ another added form +]\n- [- another removed form -]\n\n## Code blocks\n\nCode:\n\n````plaintext\n```python\ndef hello(name: str) -> str:\n    return f\"Hello, {name}!\"\n```\n````\n\nResult:\n\n```python\ndef hello(name: str) -> str:\n    return f\"Hello, {name}!\"\n```\n\nCode:\n\n````plaintext\n```javascript\nconst greet = (name) => `Hello, ${name}!`;\n```\n````\n\nResult:\n\n```javascript\nconst greet = (name) => `Hello, ${name}!`;\n```\n\nCode:\n\n````plaintext\n```diff\n+ Added line\n- Removed line\n  Unchanged line\n```\n````\n\nResult:\n\n```diff\n+ Added line\n- Removed line\n  Unchanged line\n```\n\n## Inline HTML\n\nCode:\n\n```plaintext\n<mark>highlighted</mark> | <sub>subscript</sub> | <sup>superscript</sup>\n```\n\nResult:\n\n<mark>highlighted</mark> | <sub>subscript</sub> | <sup>superscript</sup>\n\n## Callouts / Alerts\n\nCode:\n\n```plaintext\n> [!NOTE]\n> Information block.\n\n> [!TIP]\n> Helpful advice.\n\n> [!IMPORTANT]\n> Essential information.\n\n> [!WARNING]\n> Warning, risky.\n\n> [!CAUTION]\n> Dangerous action.\n```\n\nResult:\n\n> [!NOTE]\n> Information block.\n\n> [!TIP]\n> Helpful advice.\n\n> [!IMPORTANT]\n> Essential information.\n\n> [!WARNING]\n> Warning, risky.\n\n> [!CAUTION]\n> Dangerous action.\n\n## Front matter\n\n> Displays a structured list of Key:Value metadata.\n> Formats: YAML (`---`), TOML (`+++`), JSON (`;;;`).\n\nCode:\n\n```plaintext\n---\ntitle: My document\nauthor: Alice\ntags:\n  - Markdown\n  - Multi word tag\n---\n\nDocument content after the front matter.\n```\n\nResult:\n\n---\ntitle: My document\nauthor: Alice\ntags:\n  - Markdown\n  - Multi word tag\n---\n\nDocument content after the front matter.\n\n## Collapsible section (HTML)\n\nCode:\n\n```plaintext\n<details>\n<summary>📦 Click to expand</summary>\n\nContent hidden by default.\n\n</details>\n```\n\nResult:\n\n<details>\n<summary>📦 Click to expand</summary>\n\nContent hidden by default.\n\n</details>\n\n## Image, Audio and Video\n\nCode:\n\n```plaintext\n![Logo GitHub](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png)\n\n![Logo GitHub](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png){width=100 height=100px}\n\n![Logo GitHub](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png){width=75%}\n\n![Sample Audio](https://gitlab.com/gitlab-org/gitlab/-/raw/8dca1837e4b52eaf8711e96e1b5b8830f16b20a5/doc/user/img/markdown_audio.mp3?inline=false)\n\n![Sample Video](https://gitlab.com/gitlab-org/gitlab/-/raw/8dca1837e4b52eaf8711e96e1b5b8830f16b20a5/doc/user/img/markdown_video.mp4?inline=false)\n```\n\nResult:\n\n![Logo GitHub](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png)\n\n![Logo GitHub](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png){width=100 height=100px}\n\n![Logo GitHub](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png){width=75%}\n\n![Sample Audio](https://gitlab.com/gitlab-org/gitlab/-/raw/8dca1837e4b52eaf8711e96e1b5b8830f16b20a5/doc/user/img/markdown_audio.mp3?inline=false)\n\n![Sample Video](https://gitlab.com/gitlab-org/gitlab/-/raw/8dca1837e4b52eaf8711e96e1b5b8830f16b20a5/doc/user/img/markdown_video.mp4?inline=false)\n\n## Table\n\nCode:\n\n```plaintext\n|  Left  | Center | Right |\n|:-------|:------:|-------:|\n|  Text  | Text | 42 |\n| **Bold** |  *It*  | `code` |\n```\n\nResult:\n\n|  Left  | Center | Right |\n|:-------|:------:|-------:|\n|  Text  | Text | 42 |\n| **Bold** |  *It*  | `code` |\n\n## Footnote\n\nCode:\n\n```plaintext\nSentence with one footnote[^1] and a second[^2].\n\n[^1]: First footnote.\n[^2]: Footnote with **formatting** and `code`.\n```\n\nResult:\n\nSentence with one footnote[^1] and a second[^2].\n\n[^1]: First footnote.\n[^2]: Footnote with **formatting** and `code`.\n\n## Emoji\n\nCode:\n\n```plaintext\n:rocket: :tada: :fire: :bug: :warning: :white_check_mark: :x:\n```\n\nResult:\n\n:rocket: :tada: :fire: :bug: :warning: :white_check_mark: :x:\n\n## Diagrams\n\n### Mermaid\n\nCode:\n\n````plaintext\n```mermaid\n---\nconfig:\n  theme: dark\n---\ngraph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action 1]\n    B -->|No| D[Action 2]\n    C --> E[End]\n    D --> E\n```\n````\n\nResult:\n\n```mermaid\n---\nconfig:\n  theme: dark\n---\ngraph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action 1]\n    B -->|No| D[Action 2]\n    C --> E[End]\n    D --> E\n```\n\n### PlantUML\n\nCode:\n\n````plaintext\n```plantuml\nskinparam backgroundColor transparent\n!theme dark\nBob -> Alice : hello\nAlice -> Bob : hi\n```\n````\n\nResult:\n\n```plantuml\nskinparam backgroundColor transparent\n!theme dark\nBob -> Alice : hello\nAlice -> Bob : hi\n```\n\n### Graphviz\n\nCode:\n\n````plaintext\n```graphviz\nsvg-color-dark-scheme=#FFFFFF\nsvg-color-light-scheme=#000000\ndigraph {\n  A -> B;\n  B -> C;\n}\n```\n````\n\nResult:\n\n```graphviz\nsvg-color-dark-scheme=#FFFFFF\nsvg-color-light-scheme=#000000\ndigraph {\n  A -> B;\n  B -> C;\n}\n```\n\n## Mathematical formulas\n\n### LaTeX\n\nCode:\n\n```plaintext\n**Inline**: $E = mc^2$\n\n**Block**:\n\n$$\n\\int_{-\\infty}^{+\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}\n$$\n```\n\nResult:\n\n**Inline**: $E = mc^2$\n\n**Block**:\n\n$$\n\\int_{-\\infty}^{+\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}\n$$\n\n### Inline with backticks (GitLab form)\n\nCode:\n\n```plaintext\n$`a^2 + b^2 = c^2`$\n```\n\nResult:\n\n$`a^2 + b^2 = c^2`$", "fr": "# Exemples de cas d'usage Markdown compatible syntaxe CommonMark/GFM/GLFM\n\n## Règle horizontale\n\nCode :\n\n```plaintext\n---\n```\n\nRésultat :\n\n---\n\n## Table des matières\n\n> Génère automatiquement une liste de liens vers les titres du document.\n\nCode :\n\n```plaintext\n[[TOC]]\n```\n\nRésultat :\n\n[[TOC]]\n\n## Titres\n\nCode :\n\n```plaintext\n# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6\n```\n\nRésultat :\n\n# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6\n\n## Liens\n\nCode :\n\n```plaintext\n- [Lien inline](https://example.com)\n- [Lien de référence][ref]\n- Autolink : https://example.com\n- Email : contact@example.com\n\n[ref]: https://example.com\n```\n\nRésultat :\n\n- [Lien inline](https://example.com)\n- [Lien de référence][ref]\n- Autolink : https://example.com\n- Email : contact@example.com\n\n[ref]: https://example.com\n\n## Listes\n\n### Puces\n\nCode :\n\n```plaintext\n- Élément A\n- Élément B\n  - Sous-élément\n- Élément C\n```\n\nRésultat :\n\n- Élément A\n- Élément B\n  - Sous-élément\n- Élément C\n\n### Numérotées\n\nCode :\n\n```plaintext\n1. Premier\n2. Deuxième\n   1. Sous-point\n3. Troisième\n```\n\nRésultat :\n\n1. Premier\n2. Deuxième\n   1. Sous-point\n3. Troisième\n\n### Activables\n\nCode :\n\n```plaintext\n- [x] Tâche terminée\n- [ ] Tâche en cours\n  - [x] Sous-tâche faite\n  - [ ] Sous-tâche à faire\n```\n\nRésultat :\n\n- [x] Tâche terminée\n- [ ] Tâche en cours\n  - [x] Sous-tâche faite\n  - [ ] Sous-tâche à faire\n\n## Description lists\n\nCode :\n\n```plaintext\nFruits\n: apple\n: orange\n\nVegetables\n: broccoli\n: kale\n```\n\nRésultat :\n\nFruits\n: apple\n: orange\n\nVegetables\n: broccoli\n: kale\n\n## Tags\n\nCode :\n\n```plaintext\n##Markdown## ##Multi word tag##\n```\n\nRésultats :\n\n##Markdown## ##Multi word tag##\n\n## Mise en forme\n\nCode :\n\n```plaintext\n**Gras** | *Italique* | ***Gras italique*** | ~~Barré~~ | `code inline`\n\nCombinaison : **gras avec `code` et *italique***\n```\n\nRésultat :\n\n**Gras** | *Italique* | ***Gras italique*** | ~~Barré~~ | `code inline`\n\nCombinaison : **gras avec `code` et *italique***\n\n## Blocs de citation\n\n### Bloc simple\n\nCode :\n\n```plaintext\n> Citation simple.\n> Avec un **premier paragraphe**.\n>\n> Avec un **second paragraphe**.\n```\n\nRésultat :\n\n> Citation simple.\n> Avec un **premier paragraphe**.\n>\n> Avec un **second paragraphe**.\n\n### Bloc multilignes\n\nCode :\n\n```plaintext\n>>>\nCitation multi-lignes.\nChaque ligne n'a pas besoin de commencer par `>>>`.\nUtile pour citer un message long.\n>>>\n```\n\nRésultat :\n\n>>>\nCitation multi-lignes.\nChaque ligne n'a pas besoin de commencer par `>>>`.\nUtile pour citer un message long.\n>>>\n\n## Saut de ligne forcé\n\nCode :\n\n```plaintext\nLigne 1\\\\\nLigne 2 (même paragraphe)\n```\n\nRésultat :\n\nLigne 1\\\\\nLigne 2 (même paragraphe)\n\n## Color chips\n\n> Les couleurs sont rendues comme des pastilles colorées inline.\n\nCode :\n\n```plaintext\n- HEX : `#FF5733`\n- HEX alpha : `#FF5733AA`\n- RGB : `RGB(255, 87, 51)`\n- RGBA : `RGBA(255, 87, 51, 0.5)`\n- HSL : `HSL(12, 100%, 60%)`\n- HSLA : `HSLA(12, 100%, 60%, 0.5)`\n```\n\nRésultat :\n\n- HEX : `#FF5733`\n- HEX alpha : `#FF5733AA`\n- RGB : `RGB(255, 87, 51)`\n- RGBA : `RGBA(255, 87, 51, 0.5)`\n- HSL : `HSL(12, 100%, 60%)`\n- HSLA : `HSLA(12, 100%, 60%, 0.5)`\n\n## Inline diff\n\nCode :\n\n```plaintext\n- {+ texte ajouté +}\n- [- texte supprimé -]\n- [+ autre forme d'ajout +]\n- [- autre forme de suppression -]\n```\n\nRésultat :\n\n- {+ texte ajouté +}\n- [- texte supprimé -]\n- [+ autre forme d'ajout +]\n- [- autre forme de suppression -]\n\n## Blocs de code\n\nCode :\n\n````plaintext\n```python\ndef hello(nom: str) -> str:\n    return f\"Bonjour, {nom} !\"\n```\n````\n\nRésultat :\n\n```python\ndef hello(nom: str) -> str:\n    return f\"Bonjour, {nom} !\"\n```\n\nCode :\n\n````plaintext\n```javascript\nconst greet = (name) => `Hello, ${name}!`;\n```\n````\n\nRésultat :\n\n```javascript\nconst greet = (name) => `Hello, ${name}!`;\n```\n\nCode :\n\n````plaintext\n```diff\n+ Ligne ajoutée\n- Ligne supprimée\n  Ligne inchangée\n```\n````\n\nRésultat :\n\n```diff\n+ Ligne ajoutée\n- Ligne supprimée\n  Ligne inchangée\n```\n\n## HTML inline\n\nCode :\n\n```plaintext\n<mark>surligné</mark> | <sub>indice</sub> | <sup>exposant</sup>\n```\n\nRésultat :\n\n<mark>surligné</mark> | <sub>indice</sub> | <sup>exposant</sup>\n\n## Callouts / Alerts\n\nCode :\n\n```plaintext\n> [!NOTE]\n> Bloc d'information.\n\n> [!TIP]\n> Conseil utile.\n\n> [!IMPORTANT]\n> Info essentielle.\n\n> [!WARNING]\n> Attention, risqué.\n\n> [!CAUTION]\n> Action dangereuse.\n```\n\nRésultat :\n\n> [!NOTE]\n> Bloc d'information.\n\n> [!TIP]\n> Conseil utile.\n\n> [!IMPORTANT]\n> Info essentielle.\n\n> [!WARNING]\n> Attention, risqué.\n\n> [!CAUTION]\n> Action dangereuse.\n\n## Front matter\n\n> Affiche une liste structurée de métadonnées de type Clé:Valeur.\n> Formats : YAML (`---`), TOML (`+++`), JSON (`;;;`).\n\nCode :\n\n```plaintext\n---\ntitle: Mon document\nauthor: Alice\ntags:\n  - Markdown\n  - Multi word tag\n---\n\nContenu du document après le front matter.\n```\n\nRésultat :\n\n---\ntitle: Mon document\nauthor: Alice\ntags:\n  - Markdown\n  - Multi word tag\n---\n\nContenu du document après le front matter.\n\n## Section repliable (HTML)\n\nCode :\n\n```plaintext\n<details>\n<summary>📦 Cliquer pour dérouler</summary>\n\nContenu masqué par défaut.\n\n</details>\n```\n\nRésultat :\n\n<details>\n<summary>📦 Cliquer pour dérouler</summary>\n\nContenu masqué par défaut.\n\n</details>\n\n## Image, Audio et Video\n\nCode :\n\n```plaintext\n![Logo GitHub](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png)\n\n![Logo GitHub](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png){width=100 height=100px}\n\n![Logo GitHub](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png){width=75%}\n\n![Sample Audio](https://gitlab.com/gitlab-org/gitlab/-/raw/8dca1837e4b52eaf8711e96e1b5b8830f16b20a5/doc/user/img/markdown_audio.mp3?inline=false)\n\n![Sample Video](https://gitlab.com/gitlab-org/gitlab/-/raw/8dca1837e4b52eaf8711e96e1b5b8830f16b20a5/doc/user/img/markdown_video.mp4?inline=false)\n```\n\nRésultat :\n\n![Logo GitHub](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png)\n\n![Logo GitHub](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png){width=100 height=100px}\n\n![Logo GitHub](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png){width=75%}\n\n![Sample Audio](https://gitlab.com/gitlab-org/gitlab/-/raw/8dca1837e4b52eaf8711e96e1b5b8830f16b20a5/doc/user/img/markdown_audio.mp3?inline=false)\n\n![Sample Video](https://gitlab.com/gitlab-org/gitlab/-/raw/8dca1837e4b52eaf8711e96e1b5b8830f16b20a5/doc/user/img/markdown_video.mp4?inline=false)\n\n## Tableau\n\nCode :\n\n```plaintext\n|  Gauche  | Centre | Droite |\n|:---------|:------:|-------:|\n|  Texte   | Texte  |   42   |\n| **Bold** |  *It*  | `code` |\n```\n\nRésultat :\n\n|  Gauche  | Centre | Droite |\n|:---------|:------:|-------:|\n|  Texte   | Texte  |   42   |\n| **Bold** |  *It*  | `code` |\n\n## Note en bas de page\n\nCode :\n\n```plaintext\nPhrase avec une note[^1] et une seconde[^2].\n\n[^1]: Première note.\n[^2]: Note avec du **formatage** et du `code`.\n```\n\nRésultat :\n\nPhrase avec une note[^1] et une seconde[^2].\n\n[^1]: Première note.\n[^2]: Note avec du **formatage** et du `code`.\n\n## Emoji\n\nCode :\n\n```plaintext\n:rocket: :tada: :fire: :bug: :warning: :white_check_mark: :x:\n```\n\nRésultat :\n\n:rocket: :tada: :fire: :bug: :warning: :white_check_mark: :x:\n\n## Diagrammes\n\n### Mermaid\n\nCode :\n\n````plaintext\n```mermaid\n---\nconfig:\n  theme: dark\n---\ngraph TD\n    A[Commencer] --> B{Décision}\n    B -->|Oui| C[Action 1]\n    B -->|Non| D[Action 2]\n    C --> E[Fin]\n    D --> E\n```\n````\n\nRésultat :\n\n```mermaid\n---\nconfig:\n  theme: dark\n---\ngraph TD\n    A[Commencer] --> B{Décision}\n    B -->|Oui| C[Action 1]\n    B -->|Non| D[Action 2]\n    C --> E[Fin]\n    D --> E\n```\n\n### PlantUML\n\nCode :\n\n````plaintext\n```plantuml\nskinparam backgroundColor transparent\n!theme dark\nBob -> Alice : hello\nAlice -> Bob : hi\n```\n````\n\nRésultat :\n\n```plantuml\nskinparam backgroundColor transparent\n!theme dark\nBob -> Alice : hello\nAlice -> Bob : hi\n```\n\n### Graphviz\n\nCode :\n\n````plaintext\n```graphviz\nsvg-color-dark-scheme=#FFFFFF\nsvg-color-light-scheme=#000000\ndigraph {\n  A -> B;\n  B -> C;\n}\n```\n````\n\nRésultat :\n\n```graphviz\nsvg-color-dark-scheme=#FFFFFF\nsvg-color-light-scheme=#000000\ndigraph {\n  A -> B;\n  B -> C;\n}\n```\n\n## Formules mathématiques\n\n### LaTeX\n\nCode :\n\n```plaintext\n**Inline** : $E = mc^2$\n\n**Bloc** :\n\n$$\n\\int_{-\\infty}^{+\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}\n$$\n```\n\nRésultat :\n\n**Inline** : $E = mc^2$\n\n**Bloc** :\n\n$$\n\\int_{-\\infty}^{+\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}\n$$\n\n### Inline avec backticks (forme GitLab)\n\nCode :\n\n```plaintext\n$`a^2 + b^2 = c^2`$\n```\n\nRésultat :\n\n$`a^2 + b^2 = c^2`$"}),
  firstWebsite: freezeVariants({ en: "World Wide Web — first website", fr: "World Wide Web — premier site" }),
  // Bundled CV values are deliberately fictional. Keeping their canonical
  // English strings here lets translateTerm() localise the demonstration data
  // without treating arbitrary imported user content as translatable UI copy.
  cvTitle: freezeVariants({ en: "Cloud Platform Architect", fr: "Architecte de plateforme cloud" }),
  cvQuote: freezeVariants({
    en: "I design resilient platforms that make delivery simpler, safer and observable",
    fr: "Je conçois des plateformes résilientes qui rendent la livraison plus simple, plus sûre et observable"
  }),
  platformEngineer: freezeVariants({ en: "Platform Engineer", fr: "Ingénieur plateforme" }),
  platformEngineerSubtitle: freezeVariants({
    en: "Build and operate a shared delivery platform for product teams",
    fr: "Construire et exploiter une plateforme de livraison partagée pour les équipes produit"
  }),
  cloudPlatformArchitect: freezeVariants({ en: "Cloud Platform Architect", fr: "Architecte de plateforme cloud" }),
  cloudArchitectSubtitle: freezeVariants({
    en: "Architecture and enablement for secure cloud-native delivery",
    fr: "Architecture et accompagnement pour une livraison cloud-native sécurisée"
  }),
  achievementReusableProvisioning: freezeVariants({
    en: "Standardise infrastructure provisioning with reusable modules and automated policy checks",
    fr: "Standardiser le provisionnement d'infrastructure avec des modules réutilisables et des contrôles de politiques automatisés"
  }),
  achievementSlos: freezeVariants({
    en: "Introduce service-level objectives and dashboards for critical platform services",
    fr: "Introduire des objectifs de niveau de service et des tableaux de bord pour les services critiques de la plateforme"
  }),
  achievementSelfService: freezeVariants({
    en: "Reduce deployment friction by creating documented self-service delivery workflows",
    fr: "Réduire les frictions de déploiement en créant des workflows de livraison en libre-service documentés"
  }),
  achievementReferenceArchitectures: freezeVariants({
    en: "Design reference architectures for containerised applications and shared platform services",
    fr: "Concevoir des architectures de référence pour les applications conteneurisées et les services de plateforme partagés"
  }),
  achievementThreatModelling: freezeVariants({
    en: "Facilitate threat-modelling and architecture reviews with product and security teams",
    fr: "Animer des ateliers de modélisation des menaces et des revues d'architecture avec les équipes produit et sécurité"
  }),
  achievementMigrationPlaybooks: freezeVariants({
    en: "Create migration playbooks and coaching material for teams adopting the platform",
    fr: "Créer des guides de migration et des supports d'accompagnement pour les équipes adoptant la plateforme"
  }),
  achievementReliabilityStandards: freezeVariants({
    en: "Define observability and reliability standards for services moving into production",
    fr: "Définir des standards d'observabilité et de fiabilité pour les services passant en production"
  }),
  french: freezeVariants({ en: "French", fr: "Français" }),
  english: freezeVariants({ en: "English", fr: "Anglais" }),
  portfolio: freezeVariants({ en: "Portfolio", fr: "Portfolio" }),
  cloudArchitectureCertificate: freezeVariants({
    en: "Cloud Architecture Certificate",
    fr: "Certification d'architecture cloud"
  }),
  secureDeliveryPractitioner: freezeVariants({
    en: "Secure Delivery Practitioner",
    fr: "Praticien de la livraison sécurisée"
  }),
  platformEngineering: freezeVariants({ en: "Platform engineering", fr: "Ingénierie de plateforme" }),
  infrastructureAsCode: freezeVariants({ en: "Infrastructure as code", fr: "Infrastructure as code" }),
  cloudArchitecture: freezeVariants({ en: "Cloud architecture", fr: "Architecture cloud" }),
  observability: freezeVariants({ en: "Observability", fr: "Observabilité" }),
  devSecOps: freezeVariants({ en: "DevSecOps", fr: "DevSecOps" }),
  // CV section titles are duplicated here intentionally: adapters may persist
  // these values inside a normalised view, so translateTerm() must be able to
  // translate them in either direction independently of when the view was built.
  languagesSection: freezeVariants({ en: "Languages", fr: "Langues" }),
  coursesSection: freezeVariants({ en: "Courses", fr: "Formations" }),
  bookmarks: freezeVariants({ en: "Bookmarks", fr: "Favoris" }),
  cv: freezeVariants({ en: "CV", fr: "CV" }),
  directory: freezeVariants({ en: "Directory", fr: "Annuaire" }),
  writer: freezeVariants({ en: "Writer", fr: "Rédacteur" }),
  organizationChart: freezeVariants({ en: "Organisation chart", fr: "Organigramme" }),
  directoryContactType: freezeVariants({ en: "contact", fr: "contact" }),
  directoryTeamType: freezeVariants({ en: "team", fr: "équipe" }),
  directoryMembers: freezeVariants({ en: "members", fr: "membres" }),
  directoryRoleValue: freezeVariants({ en: "role", fr: "rôle" }),
  directoryUntitled: freezeVariants({ en: "Untitled", fr: "Sans nom" }),
  directoryUntitledTeam: freezeVariants({ en: "Untitled team", fr: "Équipe sans nom" }),
  directoryArchitect: freezeVariants({ en: "Architect", fr: "Architecte" }),
  directoryEngineeringLead: freezeVariants({ en: "Engineering lead", fr: "Responsable ingénierie" }),
  directoryEngineering: freezeVariants({ en: "Engineering", fr: "Ingénierie" }),
  directoryMath: freezeVariants({ en: "math", fr: "mathématiques" }),
  directoryLeadership: freezeVariants({ en: "leadership", fr: "leadership" }),
  directoryEngineeringTag: freezeVariants({ en: "engineering", fr: "ingénierie" }),
  phone: freezeVariants({ en: "phone", fr: "téléphone" }),
  email: freezeVariants({ en: "email", fr: "email" }),
  locationField: freezeVariants({ en: "location", fr: "lieu" }),
  illustration: freezeVariants({ en: "illustration", fr: "illustration" }),
  organization: freezeVariants({ en: "organization", fr: "organisation" }),
  subtitle: freezeVariants({ en: "subtitle", fr: "description" }),
  kind: freezeVariants({ en: "kind", fr: "type" }),
  startDate: freezeVariants({ en: "startDate", fr: "début" }),
  finishDate: freezeVariants({ en: "finishDate", fr: "fin" }),
  achievements: freezeVariants({ en: "achievements", fr: "réalisations" })
});

function normalizeText(value) {
  return String(value ?? "").trim().toLocaleLowerCase();
}

function interpolate(template, parameters = {}) {
  return String(template).replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => (
    Object.prototype.hasOwnProperty.call(parameters, key) ? String(parameters[key]) : match
  ));
}

export function normalizeLocale(locale = DEFAULT_LOCALE) {
  const normalized = String(locale ?? "").trim().toLocaleLowerCase().split(/[-_]/)[0];
  return Object.prototype.hasOwnProperty.call(LOCALES, normalized) ? normalized : DEFAULT_LOCALE;
}

/** Return the immutable locale descriptors used to build language selectors. */
export function supportedLocales() {
  return Object.values(LOCALES);
}

/** Read the active interface locale from the root HTML language attribute. */
export function currentLocale() {
  // Browser globals are guarded so the dictionary can also be imported by
  // dependency-free Node validation scripts without requiring a DOM shim.
  const documentLocale = typeof document !== "undefined" ? document.documentElement?.lang : "";
  const browserLocale = typeof navigator !== "undefined" ? navigator.language : "";
  return normalizeLocale(documentLocale || browserLocale || DEFAULT_LOCALE);
}

/** Translate a keyed application message and interpolate named parameters. */
export function t(key, parameters = {}, locale = currentLocale()) {
  const variants = TRANSLATIONS[key];
  if (!variants) return key;
  const targetLocale = normalizeLocale(locale);
  return interpolate(variants[targetLocale] ?? variants.en ?? key, parameters);
}

/** Translate an exact canonical data value while leaving unknown user content untouched. */
export function translateTerm(value, locale = currentLocale()) {
  const source = String(value ?? "").trim();
  if (!source) return "";

  const targetLocale = normalizeLocale(locale);
  const needle = normalizeText(source);
  for (const variants of Object.values(TERM_TRANSLATIONS)) {
    const matchesKnownTranslation = Object.values(variants).some(
      (translation) => normalizeText(translation) === needle
    );
    if (!matchesKnownTranslation) continue;
    return variants[targetLocale] ?? variants.en ?? source;
  }
  return source;
}

/** Apply translations declared directly in the static HTML shell. */
export function localizeStaticDom(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
  });
  root.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
  root.querySelectorAll("[data-i18n-content]").forEach((element) => {
    element.setAttribute("content", t(element.dataset.i18nContent));
  });
}
