import type { ProgressData, LevelRecord } from "../types/progress";

const STORAGE_KEY = "css-game-progress-v1";

function defaultProgress(): ProgressData {
  return {
    version: 1,
    levels: {},
    selectedLocale: "es",
    selectedTheme: "hero",
  };
}

export class ProgressStore {
  private data: ProgressData;
  private storage: Storage;

  constructor(storage: Storage = localStorage) {
    this.storage = storage;
    this.data = this.load();
  }

  isAvailable(): boolean {
    try {
      const test = "__css_game_test__";
      this.storage.setItem(test, "1");
      this.storage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  load(): ProgressData {
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (!raw) return defaultProgress();
      const parsed = JSON.parse(raw) as ProgressData;
      if (parsed.version !== 1) return defaultProgress();
      return parsed;
    } catch {
      return defaultProgress();
    }
  }

  save(data: ProgressData): void {
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.data = data;
    } catch (e) {
      if (e instanceof DOMException) {
        window.dispatchEvent(new CustomEvent("storage-full"));
      }
    }
  }

  getData(): ProgressData {
    return this.data;
  }

  update(levelKey: string, record: Partial<LevelRecord>): void {
    const existing = this.data.levels[levelKey] ?? { status: "locked", bestScore: null };
    this.data.levels[levelKey] = { ...existing, ...record };
    this.save(this.data);
  }

  updateMeta(patch: Partial<Pick<ProgressData, "selectedLocale" | "selectedTheme">>): void {
    this.data = { ...this.data, ...patch };
    this.save(this.data);
  }

  getLevel(levelKey: string): LevelRecord {
    return this.data.levels[levelKey] ?? { status: "locked", bestScore: null };
  }

  reset(): void {
    this.storage.removeItem(STORAGE_KEY);
    this.data = defaultProgress();
  }
}

// Singleton instance used throughout the app
export const progressStore = new ProgressStore();
