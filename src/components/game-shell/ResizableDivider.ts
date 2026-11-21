const SESSION_KEY = "css-game-divider-ratio";
const MIN_RATIO = 0.25;
const MAX_RATIO = 0.75;

export class ResizableDivider extends HTMLElement {
  private ratio = 0.5;
  private dragging = false;
  private container: HTMLElement | null = null;

  connectedCallback() {
    this.className = "divider";
    this.setAttribute("role", "separator");
    this.setAttribute("aria-label", "Drag to resize editor and preview");
    this.setAttribute("tabindex", "0");
    this.style.cssText =
      "width:6px;cursor:col-resize;background:var(--color-divider,#cbd5e1);flex-shrink:0;user-select:none;";

    // Restore saved ratio
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) this.ratio = this.clampRatio(parseFloat(saved));

    this.addEventListener("pointerdown", this.onPointerDown);
    this.addEventListener("keydown", this.onKeyDown);
  }

  setContainer(el: HTMLElement): void {
    this.container = el;
    this.applyRatio();
  }

  private onPointerDown = (e: PointerEvent): void => {
    this.dragging = true;
    this.setPointerCapture(e.pointerId);
    this.addEventListener("pointermove", this.onPointerMove);
    this.addEventListener("pointerup", this.onPointerUp);
    this.addEventListener("pointercancel", this.onPointerUp);
    e.preventDefault();
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.dragging || !this.container) return;
    const rect = this.container.getBoundingClientRect();
    const newRatio = (e.clientX - rect.left) / rect.width;
    this.ratio = this.clampRatio(newRatio);
    this.applyRatio();
  };

  private onPointerUp = (): void => {
    this.dragging = false;
    this.removeEventListener("pointermove", this.onPointerMove);
    this.removeEventListener("pointerup", this.onPointerUp);
    this.removeEventListener("pointercancel", this.onPointerUp);
    sessionStorage.setItem(SESSION_KEY, String(this.ratio));
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === "ArrowLeft") this.ratio = this.clampRatio(this.ratio - 0.05);
    if (e.key === "ArrowRight") this.ratio = this.clampRatio(this.ratio + 0.05);
    this.applyRatio();
    sessionStorage.setItem(SESSION_KEY, String(this.ratio));
  };

  private clampRatio(r: number): number {
    return Math.max(MIN_RATIO, Math.min(MAX_RATIO, r));
  }

  private applyRatio(): void {
    if (!this.container) return;
    const panes = this.container.querySelectorAll<HTMLElement>(".split-pane");
    if (panes.length < 2) return;
    panes[0].style.flex = `0 0 ${this.ratio * 100}%`;
    panes[1].style.flex = `0 0 ${(1 - this.ratio) * 100}%`;
  }
}

customElements.define("resizable-divider", ResizableDivider);
