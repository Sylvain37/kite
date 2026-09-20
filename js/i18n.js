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
 * Exact translations for canonical data values bundled in default.yml and for
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
