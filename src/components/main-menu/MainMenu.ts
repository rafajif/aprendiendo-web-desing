import { i18n } from "../../services/I18nEngine";
import { progressStore } from "../../services/ProgressStore";

// Héroes mostrados en el menú (ciclo decorativo)
const MENU_HEROES = ["hero-spiderman", "hero-ironman", "hero-cap"];

export class MainMenu extends HTMLElement {
  private _onLocale = () => this.render();

  connectedCallback() {
    this.render();
    window.addEventListener("locale-changed", this._onLocale);
  }
  disconnectedCallback() {
    window.removeEventListener("locale-changed", this._onLocale);
  }

  private render(): void {
    const data = progressStore.getData();
    const totalStars = Object.values(data.levels).reduce(
      (sum, r) => sum + (r.bestScore ?? 0), 0
    );
    const totalCompleted = Object.values(data.levels).filter(
      (r) => r.status === "completed"
    ).length;

    this.className = "main-menu";
    this.innerHTML = `
      <div class="menu-card">
        <div class="menu-logo-row">
          <div class="hero-face hero-spiderman menu-logo-hero" aria-hidden="true"></div>
          <div class="menu-logo-web" aria-hidden="true"></div>
          <div class="hero-face hero-ironman menu-logo-hero" aria-hidden="true"></div>
        </div>

        <h1 class="menu-title">HéroesCSS</h1>
        <p class="menu-subtitle">${i18n.t("menu.subtitle")}</p>

        ${totalCompleted > 0 ? `
          <div class="menu-stats-row">
            <span class="menu-stars">⭐ ${totalStars} ${i18n.t("menu.total_stars")}</span>
            <span class="menu-completed">✅ ${totalCompleted} ${i18n.t("menu.levels_done")}</span>
          </div>
        ` : ""}

        <div class="menu-heroes-row" aria-hidden="true">
          ${MENU_HEROES.map(h => `<div class="hero-face ${h}"></div>`).join("")}
        </div>

        <div class="menu-actions">
          <button class="btn btn-primary btn-xl" id="play-btn">
            🕸️ ${i18n.t("menu.play")}
          </button>
          <div class="menu-secondary-actions">
            <button class="btn btn-ghost" id="settings-btn">
              ⚙️ ${i18n.t("menu.settings")}
            </button>
          </div>
        </div>
      </div>
    `;

    this.querySelector("#play-btn")?.addEventListener("click", () => {
      location.hash = "#/levels";
    });
    this.querySelector("#settings-btn")?.addEventListener("click", () => {
      location.hash = "#/settings";
    });
  }
}

customElements.define("main-menu", MainMenu);
