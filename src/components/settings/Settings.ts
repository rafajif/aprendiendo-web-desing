import { i18n } from "../../services/I18nEngine";
import { themeService } from "../../services/ThemeService";
import { progressStore } from "../../services/ProgressStore";
import type { ThemeName } from "../../services/ThemeService";

const THEMES: { id: ThemeName; icon: string; labelKey: string }[] = [
  { id: "hero",  icon: "🕷️", labelKey: "theme.hero"  },
  { id: "dark",  icon: "🦇", labelKey: "theme.dark"  },
  { id: "light", icon: "☀️", labelKey: "theme.light" },
];

export class Settings extends HTMLElement {
  private _onLocale = () => this.render();

  connectedCallback() {
    this.render();
    window.addEventListener("locale-changed", this._onLocale);
    window.addEventListener("storage-full", () => this.showStorageWarning());
  }
  disconnectedCallback() {
    window.removeEventListener("locale-changed", this._onLocale);
  }

  private render(): void {
    const data = progressStore.getData();
    this.className = "settings-page";
    this.innerHTML = `
      <div class="settings-header">
        <button class="btn btn-icon" id="back-btn" aria-label="${i18n.t("btn.back")}">←</button>
        <h1 class="page-title">⚙️ ${i18n.t("settings.title")}</h1>
      </div>
      <div class="settings-body">

        <section class="settings-section">
          <div class="settings-section-title">${i18n.t("settings.language")}</div>
          <div class="settings-row">
            <div>
              <div class="settings-row-label">🌐 Idioma</div>
              <div class="settings-row-desc">Español o English</div>
            </div>
            <select id="locale-select" class="settings-select"
              aria-label="${i18n.t("settings.language")}">
              <option value="es" ${data.selectedLocale === "es" ? "selected" : ""}>🇪🇸 Español</option>
              <option value="en" ${data.selectedLocale === "en" ? "selected" : ""}>🇺🇸 English</option>
            </select>
          </div>
        </section>

        <section class="settings-section">
          <div class="settings-section-title">${i18n.t("settings.theme")}</div>
          <div class="theme-grid">
            ${THEMES.map(t => `
              <button class="theme-card ${data.selectedTheme === t.id ? "active" : ""}"
                data-theme="${t.id}" aria-pressed="${data.selectedTheme === t.id}">
                <span class="theme-icon">${t.icon}</span>
                ${i18n.t(t.labelKey)}
              </button>
            `).join("")}
          </div>
        </section>

        <section class="settings-section">
          <div class="settings-section-title">${i18n.t("settings.reset")}</div>
          <div class="settings-row">
            <div>
              <div class="settings-row-label">🗑️ ${i18n.t("settings.reset")}</div>
              <div class="settings-row-desc">${i18n.t("settings.reset_desc")}</div>
            </div>
            <button class="btn btn-danger" id="reset-btn">${i18n.t("settings.reset")}</button>
          </div>
        </section>

        <div id="storage-warning" class="storage-warning hidden" role="alert">
          ⚠️ ${i18n.t("error.storage_full")}
        </div>
      </div>
    `;

    this.querySelector("#back-btn")?.addEventListener("click", () => { location.hash = "#/"; });

    const localeSelect = this.querySelector<HTMLSelectElement>("#locale-select");
    localeSelect?.addEventListener("change", () => i18n.setLocale(localeSelect.value));

    this.querySelectorAll<HTMLButtonElement>(".theme-card").forEach(btn => {
      btn.addEventListener("click", () => {
        themeService.apply(btn.dataset.theme as ThemeName);
        this.render();
      });
    });

    this.querySelector("#reset-btn")?.addEventListener("click", () => {
      if (confirm(i18n.t("confirm.reset_progress"))) {
        progressStore.reset();
        location.hash = "#/";
      }
    });
  }

  private showStorageWarning(): void {
    this.querySelector<HTMLElement>("#storage-warning")?.classList.remove("hidden");
  }
}

customElements.define("settings-page", Settings);
