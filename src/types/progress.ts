export interface LevelRecord {
  status: "locked" | "unlocked" | "completed";
  bestScore: 1 | 2 | 3 | null;
}

export interface ProgressData {
  version: 1;
  levels: Record<string, LevelRecord>;
  selectedLocale: string;
  selectedTheme: string;
}
