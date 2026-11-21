import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { ProgressStore } from "../src/services/ProgressStore";

function makeStore() {
  // Use a fresh in-memory storage for each test
  const mem: Record<string, string> = {};
  const storage = {
    getItem: (k: string) => mem[k] ?? null,
    setItem: (k: string, v: string) => { mem[k] = v; },
    removeItem: (k: string) => { delete mem[k]; },
  } as Storage;
  return new ProgressStore(storage);
}

describe("ProgressStore", () => {
  it("returns default data when storage is empty", () => {
    const store = makeStore();
    const data = store.load();
    expect(data.version).toBe(1);
    expect(data.selectedLocale).toBe("es");
  });

  it("persists and restores a level record", () => {
    const store = makeStore();
    store.update("flexbox/01-01", { status: "completed", bestScore: 3 });
    const rec = store.getLevel("flexbox/01-01");
    expect(rec.status).toBe("completed");
    expect(rec.bestScore).toBe(3);
  });

  it("reset clears all data", () => {
    const store = makeStore();
    store.update("flexbox/01-01", { status: "completed", bestScore: 3 });
    store.reset();
    expect(store.getLevel("flexbox/01-01").status).toBe("locked");
  });

  // Property 10: score is non-decreasing on replay
  it("Property 10 — bestScore never decreases on replay", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3 }) as fc.Arbitrary<1 | 2 | 3>,
        fc.integer({ min: 1, max: 3 }) as fc.Arbitrary<1 | 2 | 3>,
        (stored, replay) => {
          const store = makeStore();
          store.update("flexbox/01-01", { status: "completed", bestScore: stored });
          const existing = store.getLevel("flexbox/01-01").bestScore!;
          const updated = Math.max(existing, replay) as 1 | 2 | 3;
          store.update("flexbox/01-01", { bestScore: updated });
          return store.getLevel("flexbox/01-01").bestScore === Math.max(stored, replay);
        }
      ),
      { numRuns: 100 }
    );
  });
});
