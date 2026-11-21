import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, historyKeymap, history, indentWithTab } from "@codemirror/commands";
import { css } from "@codemirror/lang-css";
import { autocompletion } from "@codemirror/autocomplete";
import { lintGutter, setDiagnostics } from "@codemirror/lint";
import type { Diagnostic } from "@codemirror/lint";

export class EditorPane extends HTMLElement {
  private view!: EditorView;
  connectedCallback() {
    this.style.display = "flex";
    this.style.flexDirection = "column";
    this.style.overflow = "hidden";
    this.style.height = "100%";

    const container = document.createElement("div");
    container.className = "cm-host";
    container.style.height = "100%";
    container.style.overflow = "auto";
    this.appendChild(container);

    const state = EditorState.create({
      doc: "",
      extensions: [
        history(),
        lineNumbers(),
        highlightActiveLine(),
        lintGutter(),
        css(),
        autocompletion(),
        keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
        EditorView.theme({
          "&": { height: "100%", fontSize: "14px" },
          ".cm-scroller": { overflow: "auto", fontFamily: "'Fira Mono', 'Consolas', monospace" },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            this.dispatchEvent(
              new CustomEvent("css-change", {
                detail: update.state.doc.toString(),
                bubbles: true,
                composed: true,
              })
            );
          }
        }),
      ],
    });

    this.view = new EditorView({ state, parent: container });
  }

  getCSS(): string {
    return this.view?.state.doc.toString() ?? "";
  }

  setContent(css: string): void {
    if (!this.view) return;
    this.view.dispatch({
      changes: { from: 0, to: this.view.state.doc.length, insert: css },
    });
  }

  reset(initialCSS: string): void {
    this.setContent(initialCSS);
  }

  markError(line: number, message: string): void {
    if (!this.view) return;
    const lineInfo = this.view.state.doc.line(line);
    const diagnostics: Diagnostic[] = [
      {
        from: lineInfo.from,
        to: lineInfo.to,
        severity: "error",
        message,
      },
    ];
    this.view.dispatch(setDiagnostics(this.view.state, diagnostics));
  }

  clearErrors(): void {
    if (!this.view) return;
    this.view.dispatch(setDiagnostics(this.view.state, []));
  }
}

customElements.define("editor-pane", EditorPane);
