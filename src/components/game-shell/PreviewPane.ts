import type { Level } from "../../types/level";
import { buildSrcdoc } from "../../services/SandboxRenderer";
import { checkCompletionLive } from "../../services/CompletionCheck";

export class PreviewPane extends HTMLElement {
  private iframe!: HTMLIFrameElement;
  private statusEl!: HTMLElement;
  private currentLevel: Level | null = null;
  private checkTimeout: number | null = null;
  private lastSrcdoc = "";

  connectedCallback() {
    this.style.cssText = "display:flex;flex-direction:column;height:100%;overflow:hidden;";

    // Header
    const header = document.createElement("div");
    header.className = "preview-header";
    header.innerHTML = `
      <span class="preview-label">🕸️ Vista previa</span>
      <span class="preview-status" id="preview-status">En progreso…</span>
    `;
    this.statusEl = header.querySelector("#preview-status") as HTMLElement;
    this.appendChild(header);

    // Frame wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "preview-frame-wrapper";

    this.iframe = document.createElement("iframe");
    this.iframe.className = "preview-iframe";
    this.iframe.setAttribute("sandbox", "allow-same-origin");
    this.iframe.setAttribute(
      "aria-description",
      "Vista previa en vivo — los héroes se mueven según tu CSS"
    );
    wrapper.appendChild(this.iframe);
    this.appendChild(wrapper);
  }

  setLevel(level: Level): void {
    this.currentLevel = level;
    this.update(level.initialCSS);
  }

  update(playerCSS: string): void {
    if (!this.currentLevel || !this.iframe) return;
    const srcdoc = buildSrcdoc(
      this.currentLevel.scaffoldHTML,
      playerCSS,
      this.getLevelBaseStyles()
    );
    if (srcdoc === this.lastSrcdoc) return;
    this.lastSrcdoc = srcdoc;
    this.iframe.srcdoc = srcdoc;
    this.setStatus("checking");
    this.scheduleCheck();
  }

  private getLevelBaseStyles(): string {
    // Telaraña de fondo + estilos de héroes
    return `
      body {
        margin: 0;
        width: 320px;
        min-height: 160px;
        background: #12122a;
        background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>');
        font-family: sans-serif;
        overflow: hidden;
        position: relative;
      }
      body::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: url('/base.png');
        background-size: 220px 220px;
        background-position: center;
        background-repeat: no-repeat;
        opacity: 0.07;
        pointer-events: none;
      }
      .container {
        position: relative;
        z-index: 1;
        min-height: 160px;
        width: 320px;
      }
      /* Héroe genérico */
      .hero, .frog, .item, .box {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background-image: url('/rostros.jpg');
        background-size: 288px 300px;
        background-repeat: no-repeat;
        border-radius: 50%;
        box-shadow: 0 3px 10px rgba(0,0,0,.5);
        position: relative;
        z-index: 2;
        font-size: 0;
        flex-shrink: 0;
      }
      /* Variantes por clase */
      .batman        { background-position:   0px    0px; }
      .superman      { background-position: -96px    0px; }
      .wonderwoman   { background-position: -192px   0px; }
      .cap           { background-position:   0px  -100px; }
      .ironman       { background-position: -96px  -100px; }
      .spiderman     { background-position: -192px -100px; }
      .spiderman2    { background-position:   0px  -200px; }
      .hulk          { background-position: -96px  -200px; }
      .thor          { background-position: -192px -200px; }
      /* Alias frog → spiderman */
      .frog          { background-position: -192px -100px; }
    `;
  }

  private scheduleCheck(): void {
    if (this.checkTimeout !== null) clearTimeout(this.checkTimeout);
    this.checkTimeout = window.setTimeout(() => this.runCheck(), 400);
  }

  private runCheck(): void {
    if (!this.currentLevel || !this.iframe) return;
    try {
      const doc = this.iframe.contentDocument;
      if (!doc) return;
      const result = checkCompletionLive(this.currentLevel.targets, doc);
      if (result === "solved") {
        this.setStatus("solved");
        this.dispatchEvent(new CustomEvent("level-solved", { bubbles: true, composed: true }));
      } else {
        this.setStatus("checking");
      }
    } catch {
      // sandbox restriction — ignorar
    }
  }

  private setStatus(state: "checking" | "solved"): void {
    if (!this.statusEl) return;
    this.statusEl.className = `preview-status ${state}`;
    this.statusEl.textContent = state === "solved" ? "✅ ¡Resuelto!" : "⏳ En progreso…";
  }

  showSuccessAnimation(heroClass = "hero-spiderman", score: 1 | 2 | 3 = 3): void {
    const overlay = document.createElement("div");
    overlay.className = "success-overlay";
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "polite");
    overlay.innerHTML = `
      <div class="success-web" aria-hidden="true"></div>
      <div class="hero-face ${heroClass} success-hero" aria-hidden="true"></div>
      <div class="success-text">¡Misión Cumplida!</div>
      <div class="success-stars" aria-label="${score} estrellas">${"⭐".repeat(score)}</div>
    `;
    // Append inside frame wrapper
    const wrapper = this.querySelector(".preview-frame-wrapper");
    wrapper?.appendChild(overlay);
    setTimeout(() => overlay.remove(), 2200);
  }
}

customElements.define("preview-pane", PreviewPane);
