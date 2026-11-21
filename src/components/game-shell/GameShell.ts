import type { Level } from "../../types/level";
import { EditorPane } from "./EditorPane";
import { PreviewPane } from "./PreviewPane";
import { HintSystem } from "./HintSystem";
import { ResizableDivider } from "./ResizableDivider";
import { levelLoader } from "../../services/LevelLoader";
import { progressStore } from "../../services/ProgressStore";
import { i18n } from "../../services/I18nEngine";
import { sanitizeCSS } from "../../services/SandboxRenderer";

// Héroe del nivel (ciclo por capítulo)
const LEVEL_HEROES: Record<string, string[]> = {
  flexbox:     ["hero-spiderman","hero-ironman","hero-cap","hero-batman","hero-wonderwoman","hero-superman","hero-thor","hero-hulk","hero-spiderman2","hero-ironman"],
  grid:        ["hero-thor","hero-cap","hero-ironman","hero-batman"],
  positioning: ["hero-batman","hero-wonderwoman","hero-superman","hero-hulk"],
  selectors:   ["hero-superman","hero-cap","hero-ironman"],
  boxmodel:    ["hero-hulk","hero-thor","hero-batman"],
};
function heroForLevel(chapterId: string, levelId: string): string {
  const list = LEVEL_HEROES[chapterId] ?? ["hero-spiderman"];
  const num = parseInt(levelId.split("-").pop() ?? "1", 10) - 1;
  return list[num % list.length] ?? "hero-spiderman";
}

function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number): T {
  let timer: number;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), ms);
  }) as T;
}

export class GameShell extends HTMLElement {
  private level!: Level;
  private editor!: EditorPane;
  private preview!: PreviewPane;
  private hintSystem!: HintSystem;
  private attempts = 0;
  private solved = false;
  private heroClass = "hero-spiderman";

  async loadLevel(chapterId: string, levelId: string): Promise<void> {
    try {
      this.level = await levelLoader.getLevel(chapterId, levelId);
    } catch {
      this.renderError(chapterId, levelId);
      return;
    }
    this.heroClass = heroForLevel(chapterId, levelId);
    this.attempts = 0;
    this.solved = false;
    this.render();
  }

  private render(): void {
    this.innerHTML = "";
    this.className = "game-shell";

    // ── Barra superior ───────────────────────────────────────────────────
    const toolbar = document.createElement("header");
    toolbar.className = "game-toolbar";

    const backBtn = document.createElement("button");
    backBtn.className = "btn btn-icon";
    backBtn.setAttribute("aria-label", i18n.t("btn.back"));
    backBtn.innerHTML = "←";
    backBtn.addEventListener("click", () => { location.hash = "#/levels"; });

    const levelBadge = document.createElement("span");
    levelBadge.className = "level-badge";
    levelBadge.textContent = `${this.level.chapterId.toUpperCase()} · ${this.level.id}`;

    const title = document.createElement("h1");
    title.className = "level-title";
    title.textContent = i18n.t(this.level.titleKey);

    const starsRow = document.createElement("div");
    starsRow.className = "toolbar-stars";
    starsRow.id = "toolbar-stars";
    starsRow.innerHTML = ["⭐","⭐","⭐"].map((s, i) =>
      `<span class="toolbar-star" data-star="${i}" aria-hidden="true">${s}</span>`
    ).join("");

    const resetBtn = document.createElement("button");
    resetBtn.className = "btn btn-ghost";
    resetBtn.setAttribute("aria-label", i18n.t("btn.reset"));
    resetBtn.textContent = "↺";
    resetBtn.title = i18n.t("btn.reset");
    resetBtn.addEventListener("click", () => this.resetLevel());

    const left = document.createElement("div");
    left.className = "toolbar-left";
    left.append(backBtn, levelBadge);

    const center = document.createElement("div");
    center.className = "toolbar-center";
    center.append(title);

    const right = document.createElement("div");
    right.className = "toolbar-right";
    right.append(starsRow, resetBtn);

    toolbar.append(left, center, right);
    this.appendChild(toolbar);

    // ── Instrucción ──────────────────────────────────────────────────────
    const instrBar = document.createElement("div");
    instrBar.className = "level-instruction-bar";
    instrBar.innerHTML = `
      <div class="hero-face ${this.heroClass} instruction-hero" aria-hidden="true"></div>
      <div>
        <div class="instruction-text">${i18n.t(this.level.instructionKey)}</div>
        <div class="instruction-tip">${i18n.t("game.instruction_tip")}</div>
      </div>
    `;
    this.appendChild(instrBar);

    // ── Split area ───────────────────────────────────────────────────────
    const splitArea = document.createElement("div");
    splitArea.className = "split-area";

    // Panel izquierdo — editor
    const editorWrapper = document.createElement("div");
    editorWrapper.className = "split-pane editor-wrapper";

    const editorHeader = document.createElement("div");
    editorHeader.className = "editor-header";
    editorHeader.innerHTML = `
      <span class="editor-label">CSS Editor</span>
      <span class="editor-dot" aria-hidden="true"></span>
    `;
    editorWrapper.appendChild(editorHeader);

    this.editor = new EditorPane();
    editorWrapper.appendChild(this.editor);

    // Divisor
    const divider = new ResizableDivider();

    // Panel derecho — preview
    const previewWrapper = document.createElement("div");
    previewWrapper.className = "split-pane preview-wrapper";
    this.preview = new PreviewPane();
    previewWrapper.appendChild(this.preview);

    splitArea.append(editorWrapper, divider, previewWrapper);
    this.appendChild(splitArea);

    requestAnimationFrame(() => divider.setContainer(splitArea));

    // ── Barra de pistas ──────────────────────────────────────────────────
    const hintBar = this.buildHintBar();
    this.appendChild(hintBar);

    // ── Región aria-live ─────────────────────────────────────────────────
    const statusRegion = document.createElement("div");
    statusRegion.id = "game-status";
    statusRegion.setAttribute("role", "status");
    statusRegion.setAttribute("aria-live", "polite");
    statusRegion.className = "sr-only";
    this.appendChild(statusRegion);

    // ── Conectar eventos ─────────────────────────────────────────────────
    this.hintSystem = new HintSystem(this.level, this.editor);
    this.addEventListener("css-change", this.onCSSChange as EventListener);
    this.addEventListener("level-solved", this.onSolved as EventListener);

    this.editor.reset(this.level.initialCSS);
    this.preview.setLevel(this.level);
  }

  private buildHintBar(): HTMLElement {
    const bar = document.createElement("div");
    bar.className = "hint-bar";

    // Puntos indicadores de pistas
    const counter = document.createElement("div");
    counter.className = "hint-counter";
    counter.id = "hint-counter";
    counter.innerHTML = [0,1,2].map(i =>
      `<div class="hint-dot" data-hint="${i}" aria-hidden="true"></div>`
    ).join("");

    const hintBtn = document.createElement("button");
    hintBtn.className = "btn btn-hint";
    hintBtn.id = "hint-btn";
    hintBtn.innerHTML = `💡 ${i18n.t("btn.hint")}`;

    const hintMsg = document.createElement("span");
    hintMsg.className = "hint-message";
    hintMsg.setAttribute("aria-live", "polite");
    hintMsg.id = "hint-message";

    hintBtn.addEventListener("click", () => {
      const result = this.hintSystem.requestHint();
      const used = this.hintSystem.used;

      // Actualizar puntos
      counter.querySelectorAll(".hint-dot").forEach((dot, i) => {
        if (i < used) dot.classList.add("used");
      });

      if (result.type === "exhausted") {
        hintBtn.disabled = true;
        hintMsg.textContent = i18n.t("hint.exhausted");
        return;
      }
      if (result.type === "property-name")   hintMsg.textContent = `🔍 ${result.text}`;
      if (result.type === "full-declaration") hintMsg.textContent = `💡 ${result.text}`;
      if (result.type === "full-solution") {
        hintMsg.textContent = i18n.t("hint.solution_inserted");
        hintBtn.disabled = true;
        this.preview.update(this.editor.getCSS());
      }

      if (this.hintSystem.remaining === 0) hintBtn.disabled = true;
    });

    bar.append(counter, hintBtn, hintMsg);
    return bar;
  }

  private onCSSChange = debounce((e: CustomEvent<string>) => {
    if (this.solved) return;
    this.attempts++;
    const { warnings } = sanitizeCSS(e.detail);
    if (warnings.length > 0) {
      this.editor.markError(1, i18n.t("error.external_blocked"));
    } else {
      this.editor.clearErrors();
    }
    this.preview.update(e.detail);
  }, 300);

  private onSolved = (): void => {
    if (this.solved) return;
    this.solved = true;

    const score = this.computeScore();
    const levelKey = `${this.level.chapterId}/${this.level.id}`;
    const existing = progressStore.getLevel(levelKey);
    const newScore = existing.bestScore !== null
      ? (Math.max(existing.bestScore, score) as 1 | 2 | 3)
      : score;
    progressStore.update(levelKey, { status: "completed", bestScore: newScore });

    // Iluminar estrellas en toolbar
    this.updateToolbarStars(newScore);

    // Anuncio accesible
    const sr = this.querySelector("#game-status");
    if (sr) sr.textContent = i18n.t("game.level_solved");

    // Animación de éxito
    this.preview.showSuccessAnimation(this.heroClass, newScore);
    setTimeout(() => this.showCompletionDialog(newScore), 2200);
  };

  private updateToolbarStars(score: 1 | 2 | 3): void {
    const stars = this.querySelectorAll(".toolbar-star");
    stars.forEach((star, i) => {
      if (i < score) {
        setTimeout(() => star.classList.add("active"), i * 200);
      }
    });
  }

  private computeScore(): 1 | 2 | 3 {
    const h = this.hintSystem.used;
    if (h === 0 && this.attempts <= 1) return 3;
    if (h <= 1 || this.attempts <= 2) return 2;
    return 1;
  }

  private showCompletionDialog(score: 1 | 2 | 3): void {
    const scoreLabels: Record<1|2|3, string> = {
      3: "¡Perfecto! Sin pistas",
      2: "¡Bien hecho!",
      1: "¡Completado!",
    };
    const dialog = document.createElement("div");
    dialog.className = "completion-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", i18n.t("game.level_complete"));
    dialog.innerHTML = `
      <div class="dialog-content">
        <div class="dialog-web-bg" aria-hidden="true"></div>
        <div class="hero-face ${this.heroClass} dialog-hero" style="width:64px;height:64px;background-size:384px 400px;margin:0 auto 12px;" aria-hidden="true"></div>
        <h2 class="dialog-title">${i18n.t("game.level_complete")}</h2>
        <div class="dialog-stars" aria-label="${score} ${i18n.t("game.stars")}">${"⭐".repeat(score)}</div>
        <p class="dialog-score-label">${scoreLabels[score]}</p>
        <div class="dialog-actions">
          <button class="btn btn-primary btn-large" id="next-level-btn">
            ${i18n.t("btn.next_level")} →
          </button>
          <button class="btn btn-secondary" id="level-select-btn">
            ${i18n.t("btn.level_select")}
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);

    dialog.querySelector("#level-select-btn")?.addEventListener("click", () => {
      dialog.remove(); location.hash = "#/levels";
    });
    dialog.querySelector("#next-level-btn")?.addEventListener("click", () => {
      dialog.remove(); this.navigateToNext();
    });
    (dialog.querySelector("#next-level-btn") as HTMLElement)?.focus();
  }

  private async navigateToNext(): Promise<void> {
    try {
      const chapters = await levelLoader.getChapters();
      const chapter = chapters.find((c) => c.id === this.level.chapterId);
      if (!chapter) { location.hash = "#/levels"; return; }

      const idx = chapter.levelIds.indexOf(this.level.id);
      if (idx < chapter.levelIds.length - 1) {
        const nextId = chapter.levelIds[idx + 1]!;
        progressStore.update(`${chapter.id}/${nextId}`, { status: "unlocked" });
        location.hash = `#/play/${chapter.id}/${nextId}`;
      } else {
        const chapterIdx = chapters.findIndex((c) => c.id === this.level.chapterId);
        if (chapterIdx < chapters.length - 1) {
          const nextChapter = chapters[chapterIdx + 1]!;
          const firstId = nextChapter.levelIds[0];
          if (firstId) {
            progressStore.update(`${nextChapter.id}/${firstId}`, { status: "unlocked" });
            location.hash = `#/play/${nextChapter.id}/${firstId}`;
          } else { location.hash = "#/levels"; }
        } else { location.hash = "#/levels"; }
      }
    } catch { location.hash = "#/levels"; }
  }

  private resetLevel(): void {
    const key = `${this.level.chapterId}/${this.level.id}`;
    if (progressStore.getLevel(key).status === "completed") {
      if (!confirm(i18n.t("confirm.reset_completed"))) return;
    }
    this.solved = false;
    this.attempts = 0;
    this.hintSystem.reset();
    this.editor.reset(this.level.initialCSS);
    this.preview.update(this.level.initialCSS);

    this.querySelectorAll(".toolbar-star").forEach(s => s.classList.remove("active"));
    this.querySelectorAll(".hint-dot").forEach(d => d.classList.remove("used"));

    const hintBtn = this.querySelector<HTMLButtonElement>("#hint-btn");
    if (hintBtn) { hintBtn.disabled = false; }
    const hintMsg = this.querySelector<HTMLElement>("#hint-message");
    if (hintMsg) hintMsg.textContent = "";
  }

  private renderError(chapterId: string, levelId: string): void {
    this.innerHTML = `
      <div class="error-state">
        <p>🕸️ ${i18n.t("error.level_load_failed")}</p>
        <button class="btn btn-primary" id="retry-btn">${i18n.t("btn.retry")}</button>
      </div>`;
    this.querySelector("#retry-btn")?.addEventListener("click", () =>
      this.loadLevel(chapterId, levelId)
    );
  }
}

customElements.define("game-shell", GameShell);
