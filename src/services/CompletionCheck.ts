import type { ElementTarget } from "../types/level";

export type CheckResult = "solved" | "not-solved";

/**
 * Pure function — DOM reading is injected via the `measure` callback.
 * This keeps it fully testable without a real iframe.
 */
export function checkCompletion(
  targets: ElementTarget[],
  measure: (selector: string) => DOMRect | null
): CheckResult {
  for (const target of targets) {
    const rect = measure(target.selector);
    if (!rect) return "not-solved";

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    if (Math.abs(centerX - target.expectedCenterX) > target.tolerance) return "not-solved";
    if (Math.abs(centerY - target.expectedCenterY) > target.tolerance) return "not-solved";
    if (Math.abs(rect.width - target.expectedWidth) > target.tolerance) return "not-solved";
    if (Math.abs(rect.height - target.expectedHeight) > target.tolerance) return "not-solved";
  }
  return "solved";
}

/**
 * Live version — reads from the actual iframe contentDocument.
 */
export function checkCompletionLive(
  targets: ElementTarget[],
  sandboxDocument: Document
): CheckResult {
  const measure = (selector: string): DOMRect | null => {
    try {
      const el = sandboxDocument.querySelector(selector);
      if (!el) return null;
      return el.getBoundingClientRect();
    } catch {
      return null;
    }
  };
  return checkCompletion(targets, measure);
}
