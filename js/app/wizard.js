import { t } from "../i18n.js";
import { escapeHtml, isLinkUrl } from "../shared/dom.js";

/** Interactive editor loaded only when Add is first used. */
export function createWizardController({
  elements, state, runtime, activeContentAdapter, syncContextualTools,
  incrementChangeNotifications, refreshView, showToast
}) {
  /**
   * Capture in-progress wizard values before rebuilding translated wizard markup.
   * Only enabled named controls participate, matching FormData and therefore the
   * adapter payload that would be submitted by the user.
   */
  function snapshotWizardForLocaleChange() {
    if (elements.wizard.hidden) return null;
    return {
      step: state.wizardStep,
      values: [...new FormData(elements.wizardForm).entries()].filter(([, value]) => (
        typeof File === "undefined" || !(value instanceof File)
      )),
      illustrationName: elements.wizardForm.querySelector("#wizardIllustrationName")?.textContent ?? ""
    };
  }

  /** Restore wizard values after its labels/placeholders have been retranslated. */
  function restoreWizardAfterLocaleChange(snapshot) {
    if (!snapshot) return;
    configureWizard();

    const typeValue = snapshot.values.find(([name]) => name === "type")?.[1];
    const typeControl = elements.wizardForm.elements.namedItem("type");
    if (typeControl && typeof typeValue === "string") typeControl.value = typeValue;
    if (String(state.activeSection) === "cv") syncCvWizardType();

    for (const [name, value] of snapshot.values) {
      if (typeof value !== "string") continue;
      const controls = [...elements.wizardForm.querySelectorAll(`[name="${name}"]`)];
      const control = controls.find((candidate) => !candidate.disabled) ?? controls[0];
      if (control) control.value = value;
    }

    const illustration = elements.wizardForm.querySelector("#wizardIllustrationData")?.value ?? "";
    if (illustration) {
      const preview = elements.wizardForm.querySelector("#wizardIllustrationPreview");
      const image = preview?.querySelector("img");
      const name = elements.wizardForm.querySelector("#wizardIllustrationName");
      if (image) image.src = illustration;
      if (name) name.textContent = snapshot.illustrationName;
      if (preview) preview.hidden = false;
    }

    setWizardStep(snapshot.step);
  }

  function prefersReducedMotion() {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // ---- Guided add-item wizard ---------------------------------------------------------

  function wizardStepMarkup(label, body, hint = t("continueWithEnter")) {
    return `<div class="wizard-step"><label>${label}</label>${body}<small>${hint}</small></div>`;
  }

  function bookmarksWizardMarkup() {
    return [
      wizardStepMarkup(t("bookmarkLabelPrompt"), '<input id="wizardLabel" name="label" type="text" autocomplete="off" required placeholder="Ex. MDN Web Docs">'),
      wizardStepMarkup(t("bookmarkUrlPrompt"), '<input id="wizardUrl" name="url" type="url" inputmode="url" autocomplete="url" required placeholder="https://…">'),
      wizardStepMarkup(t("bookmarkTagsPrompt"), '<input id="wizardTags" name="tags" type="text" autocomplete="off" placeholder="web, docs, pwa">', t("addWithEnter"))
    ].join("");
  }

  function cvWizardMarkup() {
    return [
      wizardStepMarkup(t("cvItemType"), `<select id="wizardType" name="type" required>
        <option value="language">${escapeHtml(t("language"))}</option>
        <option value="course">${escapeHtml(t("course"))}</option>
        <option value="experience">${escapeHtml(t("experience"))}</option>
      </select>`),
      wizardStepMarkup(t("mainInformation"), `
        <div class="wizard-field-group" data-cv-type="language">
          <input name="label" type="text" autocomplete="off" required placeholder="${escapeHtml(t("languagePlaceholder"))}">
        </div>
        <div class="wizard-field-group" data-cv-type="course" hidden>
          <input name="label" type="text" autocomplete="off" required placeholder="${escapeHtml(t("coursePlaceholder"))}">
          <input name="date" type="text" autocomplete="off" placeholder="${escapeHtml(t("datePlaceholder"))}">
          <input name="location" type="text" autocomplete="off" placeholder="${escapeHtml(t("providerLocationPlaceholder"))}">
        </div>
        <div class="wizard-field-group" data-cv-type="experience" hidden>
          <input name="title" type="text" autocomplete="off" required placeholder="${escapeHtml(t("experienceTitlePlaceholder"))}">
          <input name="organization" type="text" autocomplete="off" placeholder="${escapeHtml(t("organizationPlaceholder"))}">
          <input name="subtitle" type="text" autocomplete="off" placeholder="${escapeHtml(t("shortDescriptionPlaceholder"))}">
        </div>`),
      wizardStepMarkup(t("additionalInformation"), `
        <div class="wizard-field-group" data-cv-type="language">
          <input name="rate" type="number" min="0" max="100" step="1" inputmode="numeric" placeholder="${escapeHtml(t("levelPercentPlaceholder"))}">
        </div>
        <div class="wizard-field-group" data-cv-type="course" hidden>
          <input name="rate" type="number" min="0" max="100" step="1" inputmode="numeric" placeholder="${escapeHtml(t("scorePercentPlaceholder"))}">
        </div>
        <div class="wizard-field-group" data-cv-type="experience" hidden>
          <input name="kind" type="text" autocomplete="off" placeholder="${escapeHtml(t("experienceKindPlaceholder"))}">
          <input name="format" type="text" autocomplete="off" placeholder="${escapeHtml(t("experienceFormatPlaceholder"))}">
          <input name="location" type="text" autocomplete="off" placeholder="${escapeHtml(t("locationPlaceholder"))}">
          <div class="wizard-inline-fields">
            <input name="startDate" type="text" autocomplete="off" placeholder="${escapeHtml(t("startPlaceholder"))}">
            <input name="finishDate" type="text" autocomplete="off" placeholder="${escapeHtml(t("finishPlaceholder"))}">
          </div>
          <input name="skills" type="text" autocomplete="off" placeholder="${escapeHtml(t("skillsPlaceholder"))}">
          <textarea name="achievements" rows="2" placeholder="${escapeHtml(t("achievementsPlaceholder"))}"></textarea>
          <div class="wizard-upload-field">
            <input id="wizardIllustrationInput" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" hidden>
            <input id="wizardIllustrationData" name="illustration" type="hidden">
            <button id="wizardIllustrationDropzone" class="wizard-upload-zone" type="button">
              <span class="wizard-upload-title">${escapeHtml(t("experienceIllustration"))}</span>
              <span class="wizard-upload-copy">${escapeHtml(t("illustrationDropHint"))}</span>
              <span class="wizard-upload-formats">${escapeHtml(t("imageFormats"))}</span>
            </button>
            <div id="wizardIllustrationPreview" class="wizard-upload-preview" hidden>
              <img alt="${escapeHtml(t("experienceIllustrationPreview"))}">
              <span id="wizardIllustrationName"></span>
              <button id="wizardIllustrationRemove" class="wizard-upload-remove" type="button" aria-label="${escapeHtml(t("removeIllustration"))}">×</button>
            </div>
          </div>
        </div>`, t("addWithEnter"))
    ].join("");
  }

  const CV_EXPERIENCE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
  const CV_EXPERIENCE_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

  function isAllowedCvExperienceImage(file) {
    if (!(file instanceof File)) return false;
    const extension = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
    return CV_EXPERIENCE_IMAGE_TYPES.has(file.type) || CV_EXPERIENCE_IMAGE_EXTENSIONS.has(extension);
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(String(reader.result ?? "")), { once: true });
      reader.addEventListener("error", () => reject(reader.error || new Error(t("imageReadFailed"))), { once: true });
      reader.readAsDataURL(file);
    });
  }

  function resetCvExperienceIllustration() {
    const input = elements.wizardForm.querySelector("#wizardIllustrationInput");
    const data = elements.wizardForm.querySelector("#wizardIllustrationData");
    const preview = elements.wizardForm.querySelector("#wizardIllustrationPreview");
    const dropzone = elements.wizardForm.querySelector("#wizardIllustrationDropzone");
    if (input) input.value = "";
    if (data) data.value = "";
    if (preview) {
      preview.hidden = true;
      const image = preview.querySelector("img");
      if (image) image.removeAttribute("src");
    }
    const name = elements.wizardForm.querySelector("#wizardIllustrationName");
    if (name) name.textContent = "";
    dropzone?.classList.remove("is-dragover");
  }

  async function setCvExperienceIllustration(file) {
    if (!isAllowedCvExperienceImage(file)) {
      resetCvExperienceIllustration();
      showToast(t("unsupportedImage"), true);
      return;
    }

    try {
      const dataURL = await readFileAsDataURL(file);
      if (!/^data:image\/(?:png|jpe?g|webp);base64,/i.test(dataURL)) {
        throw new Error(t("unsupportedImageFormat"));
      }
      const data = elements.wizardForm.querySelector("#wizardIllustrationData");
      const preview = elements.wizardForm.querySelector("#wizardIllustrationPreview");
      const dropzone = elements.wizardForm.querySelector("#wizardIllustrationDropzone");
      const name = elements.wizardForm.querySelector("#wizardIllustrationName");
      if (!data || !preview) return;
      data.value = dataURL;
      const image = preview.querySelector("img");
      if (image) image.src = dataURL;
      if (name) name.textContent = file.name;
      preview.hidden = false;
      dropzone?.classList.remove("is-dragover");
    } catch (error) {
      resetCvExperienceIllustration();
      showToast(error?.message || t("imageLoadFailed"), true);
    }
  }

  function syncCvWizardType() {
    const type = elements.wizardForm.elements.namedItem("type")?.value || "language";
    elements.wizardForm.querySelectorAll("[data-cv-type]").forEach((group) => {
      const active = group.dataset.cvType === type;
      group.hidden = !active;
      group.querySelectorAll("input, select, textarea").forEach((control) => { control.disabled = !active; });
    });
  }

  function configureWizard() {
    const sectionId = String(state.activeSection ?? "");
    elements.wizardTrack.innerHTML = sectionId === "cv" ? cvWizardMarkup() : bookmarksWizardMarkup();
    if (sectionId === "cv") syncCvWizardType();
  }

  function visibleWizardStep(step = state.wizardStep) {
    return elements.wizardTrack.children[step] ?? null;
  }

  function focusWizardStep(step) {
    const control = visibleWizardStep(step)?.querySelector("input:not([disabled]), select:not([disabled]), textarea:not([disabled])");
    const delay = prefersReducedMotion() ? 0 : 340;
    setTimeout(() => control?.focus(), delay);
  }

  function setWizardStep(step) {
    const count = Math.max(1, elements.wizardTrack.children.length);
    state.wizardStep = Math.max(0, Math.min(count - 1, step));
    elements.wizardTrack.style.width = `${count * 100}%`;
    [...elements.wizardTrack.children].forEach((child) => { child.style.width = `${100 / count}%`; });
    elements.wizardTrack.style.transform = `translateX(-${state.wizardStep * (100 / count)}%)`;
    if (!elements.wizard.hidden) {
      elements.addButton.classList.toggle("is-previous", state.wizardStep > 0);
      elements.addButtonSymbol.textContent = state.wizardStep > 0 ? "↩" : "+";
      elements.addButton.setAttribute("aria-label", state.wizardStep > 0 ? t("previousStep") : t("cancelAdd"));
    }
    focusWizardStep(state.wizardStep);
  }

  function openWizard() {
    const adapter = activeContentAdapter();
    if (typeof adapter?.add !== "function") return;
    configureWizard();
    elements.addButton.classList.add("is-cancel");
    elements.addButton.setAttribute("aria-label", t("cancelAdd"));
    elements.addButton.setAttribute("aria-expanded", "true");
    elements.wizardForm.reset();
    if (String(state.activeSection) === "cv") syncCvWizardType();
    elements.wizard.hidden = false;
    void elements.wizard.offsetHeight;
    elements.wizard.classList.add("is-open");
    setWizardStep(0);
  }

  function closeWizard() {
    elements.wizard.classList.remove("is-open");
    elements.wizard.hidden = true;
    elements.addButton.classList.remove("is-cancel", "is-previous");
    elements.addButtonSymbol.textContent = "+";
    elements.addButton.setAttribute("aria-label", t("addItem"));
    elements.addButton.setAttribute("aria-expanded", "false");
    state.wizardStep = 0;
    elements.wizardTrack.style.transform = "translateX(0)";
    syncContextualTools();
  }

  function validateWizardStep() {
    const step = visibleWizardStep();
    if (!step) return true;
    for (const control of step.querySelectorAll("input:not([disabled]), select:not([disabled]), textarea:not([disabled])")) {
      if (control.type === "url" && control.required && control.value.trim() && !isLinkUrl(control.value)) {
        control.setCustomValidity(t("invalidLinkUrl"));
      } else {
        control.setCustomValidity("");
      }
      if (!control.checkValidity()) {
        control.reportValidity();
        control.focus();
        return false;
      }
    }
    return true;
  }

  function getWizardValues() {
    return Object.fromEntries(new FormData(elements.wizardForm).entries());
  }

  function submitWizardStep() {
    if (!validateWizardStep()) return;
    const count = Math.max(1, elements.wizardTrack.children.length);
    if (state.wizardStep < count - 1) {
      if (String(state.activeSection) === "cv" && state.wizardStep === 0) syncCvWizardType();
      setWizardStep(state.wizardStep + 1);
      return;
    }

    const adapter = activeContentAdapter();
    if (typeof adapter?.add !== "function") {
      closeWizard();
      return;
    }

    try {
      adapter.add(state.model, getWizardValues());
      incrementChangeNotifications();
      closeWizard();
      refreshView();
      runtime.emit("document:changed", { operation: "add", plugin: adapter.id });
    } catch (error) {
      showToast(error?.message || String(error), true);
    }
  }

  function bindWizardEvents() {
    elements.wizardForm.addEventListener("submit", (event) => event.preventDefault());
    elements.wizardForm.addEventListener("input", (event) => {
      if (event.target?.setCustomValidity) event.target.setCustomValidity("");
    });
    elements.wizardForm.addEventListener("change", (event) => {
      if (event.target?.name === "type" && String(state.activeSection) === "cv") syncCvWizardType();
      if (event.target?.id === "wizardIllustrationInput") {
        const file = event.target.files?.[0];
        if (file) void setCvExperienceIllustration(file);
      }
    });
    elements.wizardForm.addEventListener("click", (event) => {
      if (event.target.closest("#wizardIllustrationDropzone")) {
        elements.wizardForm.querySelector("#wizardIllustrationInput")?.click();
        return;
      }
      if (event.target.closest("#wizardIllustrationRemove")) resetCvExperienceIllustration();
    });
    elements.wizardForm.addEventListener("dragover", (event) => {
      const dropzone = event.target.closest("#wizardIllustrationDropzone");
      if (!dropzone) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
      dropzone.classList.add("is-dragover");
    });
    elements.wizardForm.addEventListener("dragleave", (event) => {
      const dropzone = event.target.closest("#wizardIllustrationDropzone");
      if (!dropzone || dropzone.contains(event.relatedTarget)) return;
      dropzone.classList.remove("is-dragover");
    });
    elements.wizardForm.addEventListener("drop", (event) => {
      const dropzone = event.target.closest("#wizardIllustrationDropzone");
      if (!dropzone) return;
      event.preventDefault();
      dropzone.classList.remove("is-dragover");
      const file = event.dataTransfer?.files?.[0];
      if (file) void setCvExperienceIllustration(file);
    });
    elements.wizardForm.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey) return;
      if (!event.target.matches("input, select, textarea")) return;
      event.preventDefault();
      submitWizardStep();
    });
  }

  bindWizardEvents();
  return {
    open: openWizard,
    close: closeWizard,
    setStep: setWizardStep,
    snapshot: snapshotWizardForLocaleChange,
    restore: restoreWizardAfterLocaleChange
  };
}
