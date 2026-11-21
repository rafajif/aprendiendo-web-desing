import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { checkCompletion } from "../src/services/CompletionCheck";
import type { ElementTarget } from "../src/types/level";

function makeTarget(overrides: Partial<ElementTarget> = {}): ElementTarget {
  return {
    selector: ".frog",
    expectedCenterX: 100,
    expectedCenterY: 80,
    expectedWidth: 40,
    expectedHeight: 40,
    tolerance: 4,
    ...overrides,
  };
}

function perfectMeasure(targets: ElementTarget[]) {
  return (selector: string): DOMRect | null => {
    const t = targets.find((x) => x.selector === selector);
    if (!t) return null;
    return {
      left: t.expectedCenterX - t.expectedWidth / 2,
      top: t.expectedCenterY - t.expectedHeight / 2,
      width: t.expectedWidth,
      height: t.expectedHeight,
      right: t.expectedCenterX + t.expectedWidth / 2,
      bottom: t.expectedCenterY + t.expectedHeight / 2,
      x: t.expectedCenterX - t.expectedWidth / 2,
      y: t.expectedCenterY - t.expectedHeight / 2,
      toJSON: () => ({}),
    } as DOMRect;
  };
}

// ── Property 1: Determinism ───────────────────────────────────────────────
describe("CompletionCheck", () => {
  it("Property 1 — is deterministic for the same inputs", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            selector: fc.constant(".frog"),
            expectedCenterX: fc.integer({ min: 0, max: 400 }),
            expectedCenterY: fc.integer({ min: 0, max: 300 }),
            expectedWidth: fc.integer({ min: 10, max: 200 }),
            expectedHeight: fc.integer({ min: 10, max: 200 }),
            tolerance: fc.integer({ min: 1, max: 20 }),
          }),
          { minLength: 1, maxLength: 4 }
        ),
        (targets) => {
          const measure = perfectMeasure(targets);
          const r1 = checkCompletion(targets, measure);
          const r2 = checkCompletion(targets, measure);
          return r1 === r2;
        }
      ),
      { numRuns: 100 }
    );
  });

  // ── Property 2: Accepts in-tolerance layouts ─────────────────────────
  // Selectors must be unique within a target list (a real level never has
  // two targets sharing the same selector — the measure would be ambiguous).
  it("Property 2 — returns 'solved' when all elements are within tolerance", () => {
    // Build targets with guaranteed-unique selectors by index
    const arbTargets = fc.integer({ min: 1, max: 4 }).chain((count) => {
      const records = Array.from({ length: count }, (_, i) =>
        fc.record({
          selector: fc.constant(`.item-${i}`),
          expectedCenterX: fc.integer({ min: 10, max: 300 }),
          expectedCenterY: fc.integer({ min: 10, max: 200 }),
          expectedWidth: fc.integer({ min: 10, max: 100 }),
          expectedHeight: fc.integer({ min: 10, max: 100 }),
          tolerance: fc.integer({ min: 4, max: 10 }),
        })
      );
      return fc.tuple(...(records as [fc.Arbitrary<ElementTarget>]));
    });

    fc.assert(
      fc.property(arbTargets, (targets) => {
        const arr = targets as ElementTarget[];
        return checkCompletion(arr, perfectMeasure(arr)) === "solved";
      }),
      { numRuns: 100 }
    );
  });

  // ── Property 3: Rejects out-of-tolerance layouts ──────────────────────
  it("Property 3 — returns 'not-solved' when an element deviates beyond tolerance", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 300 }),
        (deviation) => {
          const target = makeTarget({ tolerance: 4 });
          const measure = (_: string): DOMRect => ({
            left: target.expectedCenterX - target.expectedWidth / 2 + deviation,
            top: target.expectedCenterY - target.expectedHeight / 2,
            width: target.expectedWidth,
            height: target.expectedHeight,
            right: 0,
            bottom: 0,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          } as DOMRect);
          return checkCompletion([target], measure) === "not-solved";
        }
      ),
      { numRuns: 100 }
    );
  });

  // ── Property 4: Empty scaffold is never solved ────────────────────────
  it("Property 4 — returns 'not-solved' when measure returns null", () => {
    const target = makeTarget();
    expect(checkCompletion([target], () => null)).toBe("not-solved");
  });

  // ── Basic correct behavior ─────────────────────────────────────────────
  it("returns 'solved' for exact match", () => {
    const target = makeTarget();
    expect(checkCompletion([target], perfectMeasure([target]))).toBe("solved");
  });

  it("returns 'not-solved' when selector not found", () => {
    const target = makeTarget({ selector: ".missing" });
    expect(checkCompletion([target], () => null)).toBe("not-solved");
  });
});
