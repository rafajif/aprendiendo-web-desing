import type { Level } from "../../types/level";
import type { EditorPane } from "./EditorPane";
import { i18n } from "../../services/I18nEngine";

export type HintResult =
  | { type: "property-name"; text: string }
  | { type: "full-declaration"; text: string }
  | { type: "full-solution"; css: string }
  | { type: "exhausted" };

export class HintSystem {
  private hintsUsed = 0;
  private readonly maxHints = 3;

  constructor(
    private level: Level,
    private editor: EditorPane
  ) {}

  requestHint(): HintResult {
    if (this.hintsUsed >= this.maxHints) {
      return { type: "exhausted" };
    }

    this.hintsUsed++;

    if (this.hintsUsed === 1) {
      const text = i18n.t(this.level.hints[0]);
      return { type: "property-name", text };
    }

    if (this.hintsUsed === 2) {
      const text = i18n.t(this.level.hints[1]);
      return { type: "full-declaration", text };
    }

    // Third hint: insert full solution
    const solutionCSS = this.level.hints[2];
    this.editor.setContent(solutionCSS);
    return { type: "full-solution", css: solutionCSS };
  }

  get used(): number {
    return this.hintsUsed;
  }

  get remaining(): number {
    return this.maxHints - this.hintsUsed;
  }

  reset(): void {
    this.hintsUsed = 0;
  }
}
