import type { Level, Chapter } from "../types/level";
import { assetUrl } from "./AssetLoader";

class LevelLoader {
  private levelCache = new Map<string, Level>();
  private chapters: Chapter[] | null = null;

  async getChapters(): Promise<Chapter[]> {
    if (this.chapters) return this.chapters;
    const res = await fetch(assetUrl("data/chapters.json"));
    if (!res.ok) throw new Error("Failed to load chapters manifest");
    this.chapters = (await res.json()) as Chapter[];
    return this.chapters;
  }

  async getLevel(chapterId: string, levelId: string): Promise<Level> {
    const key = `${chapterId}/${levelId}`;
    if (this.levelCache.has(key)) return this.levelCache.get(key)!;
    const res = await fetch(assetUrl(`data/levels/${chapterId}/${levelId}.json`));
    if (!res.ok) throw new Error(`Failed to load level ${key}`);
    const data = (await res.json()) as Level;
    this.levelCache.set(key, data);
    return data;
  }

  async getAllLevels(): Promise<Level[]> {
    const chapters = await this.getChapters();
    const promises = chapters.flatMap((ch) =>
      ch.levelIds.map((id) => this.getLevel(ch.id, id))
    );
    return Promise.all(promises);
  }
}

export const levelLoader = new LevelLoader();
