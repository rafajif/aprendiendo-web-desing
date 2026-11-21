import { i18n } from "../../services/I18nEngine";
import { levelLoader } from "../../services/LevelLoader";
import { progressStore } from "../../services/ProgressStore";
import type { Chapter } from "../../types/level";

// Héroe asignado por capítulo (en orden)
const CHAPTER_HEROES = [
  { icon: "🕷️", hero: "hero-spiderman" },
  { icon: "⚡", hero: "hero-thor" },
  { icon: "🛡️", hero: "hero-cap" },
  { icon: "🤖", hero: "hero-ironman" },
  { icon: "💚", hero: "hero-hulk" },
];

// Héroe asignado por nivel (ciclo)
const LEVEL_HEROES = [
  "hero-spiderman","hero-ironman","hero-cap","hero-batman",
  "hero-wonderwoman","hero-superman","hero-thor","hero-hulk",
  "hero-spiderman2","hero-ironman",
];

export class LevelSelect extends HTMLElement {
  private _onLocale = () => this.connectedCallback();

  async connectedCallback() {
    this.className = "level-select";
    this.renderLoading();
    window.addEventListener("locale-changed", this._onLocale);
    try {
      const chapters = await levelLoader.getChapters();
      this.ensureFirstLevelUnlocked(chapters);
      this.render(chapters);
    } catch {
      this.renderError();
    }
  }
  disconnectedCallback() {
    window.removeEventListener("locale-changed", this._onLocale);
  }

  private renderLoading(): void {
    this.innerHTML = `
      <div class="level-select-header">
        <button class="btn btn-icon" id="back-btn" aria-label="${i18n.t("btn.back")}">←</button>
        <h1 class="page-title">Misiones</h1>
      </div>
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>${i18n.t("ui.loading")}</p>
      </div>`;
    this.querySelector("#back-btn")?.addEventListener("click", () => { location.hash = "#/"; });
  }

  private renderError(): void {
    this.innerHTML = `
      <div class="level-select-header">
        <button class="btn btn-icon" id="back-btn" aria-label="${i18n.t("btn.back")}">←</button>
        <h1 class="page-title">Misiones</h1>
      </div>
      <div class="error-state">
        <p>🕸️ ${i18n.t("error.chapters_load_failed")}</p>
        <button class="btn btn-primary" id="retry-btn">${i18n.t("btn.retry")}</button>
      </div>`;
    this.querySelector("#back-btn")?.addEventListener("click", () => { location.hash = "#/"; });
    this.querySelector("#retry-btn")?.addEventListener("click", () => this.connectedCallback());
  }

  private ensureFirstLevelUnlocked(chapters: Chapter[]): void {
    const first = chapters[0];
    if (!first?.levelIds[0]) return;
    const key = `${first.id}/${first.levelIds[0]}`;
    if (progressStore.getLevel(key).status === "locked") {
      progressStore.update(key, { status: "unlocked" });
    }
  }

  private render(chapters: Chapter[]): void {
    // Calcular progreso global
    const data = progressStore.getData();
    const totalLevels = chapters.reduce((s, c) => s + c.levelIds.length, 0);
    const completedLevels = Object.values(data.levels).filter(r => r.status === "completed").length;
    const totalStars = Object.values(data.levels).reduce((s, r) => s + (r.bestScore ?? 0), 0);
    const pct = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;

    this.innerHTML = `
      <div class="level-select-header">
        <button class="btn btn-icon" id="back-btn" aria-label="${i18n.t("btn.back")}">←</button>
        <h1 class="page-title">${i18n.t("levels.title")}</h1>
        <div class="header-stars" title="${totalStars} estrellas">
          ⭐ <span>${totalStars}</span>
        </div>
      </div>

      ${totalLevels > 0 ? `
        <div class="progress-banner">
          <div class="progress-info">
            <span class="progress-label">${i18n.t("levels.progress")}</span>
            <span class="progress-fraction">${completedLevels}/${totalLevels} — ${pct}%</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>
      ` : ""}

      <div class="chapters-list">
        ${chapters.map((ch, idx) => this.renderChapter(ch, idx)).join("")}
      </div>
    `;

    this.querySelector("#back-btn")?.addEventListener("click", () => { location.hash = "#/"; });
    this.querySelectorAll<HTMLButtonElement>(".level-btn:not([disabled])").forEach(btn => {
      btn.addEventListener("click", () => {
        const { chapter, level } = btn.dataset;
        if (chapter && level) location.hash = `#/play/${chapter}/${level}`;
      });
    });
  }

  private renderChapter(chapter: Chapter, idx: number): string {
    const meta = CHAPTER_HEROES[idx % CHAPTER_HEROES.length]!;
    const completedCount = chapter.levelIds.filter(id => {
      return progressStore.getLevel(`${chapter.id}/${id}`).status === "completed";
    }).length;

    return `
      <section class="chapter-section">
        <div class="chapter-header">
          <div class="chapter-badge" aria-hidden="true">${meta.icon}</div>
          <h2 class="chapter-title">${i18n.t(chapter.nameKey)}</h2>
          <span class="chapter-count">${completedCount}/${chapter.levelIds.length}</span>
        </div>
        <div class="levels-grid">
          ${chapter.levelIds.map((id, lIdx) => this.renderLevelCell(chapter.id, id, lIdx)).join("")}
        </div>
      </section>
    `;
  }

  private renderLevelCell(chapterId: string, levelId: string, idx: number): string {
    const key = `${chapterId}/${levelId}`;
    const rec = progressStore.getLevel(key);
    const heroClass = LEVEL_HEROES[idx % LEVEL_HEROES.length];
    const num = levelId.split("-").pop() ?? levelId;

    if (rec.status === "locked") {
      return `
        <button class="level-btn level-btn--locked" disabled aria-disabled="true"
          aria-label="Nivel ${num} — bloqueado">
          <span class="lock-icon">🔒</span>
        </button>`;
    }

    const stars = rec.bestScore ? "★".repeat(rec.bestScore) + "☆".repeat(3 - rec.bestScore) : "";

    return `
      <button class="level-btn level-btn--${rec.status}"
        data-chapter="${chapterId}" data-level="${levelId}"
        aria-label="${i18n.t("level.aria_label", { id: num, status: rec.status })}">
        <div class="hero-face ${heroClass}" aria-hidden="true"></div>
        <span class="level-num">${num}</span>
        ${stars ? `<span class="level-stars" style="color:var(--color-star)">${stars}</span>` : ""}
      </button>`;
  }
}

customElements.define("level-select", LevelSelect);
