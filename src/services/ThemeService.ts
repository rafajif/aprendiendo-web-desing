import { progressStore } from "./ProgressStore";

export type ThemeName = "hero" | "dark" | "light";

const VALID_THEMES: ThemeName[] = ["hero", "dark", "light"];

class ThemeService {
  apply(theme: ThemeName): void {
    document.documentElement.setAttribute("data-theme", theme);
    progressStore.updateMeta({ selectedTheme: theme });
    window.dispatchEvent(new CustomEvent("theme-changed", { detail: theme }));
  }

  load(): void {
    const saved = progressStore.getData().selectedTheme as ThemeName;
    const theme = VALID_THEMES.includes(saved) ? saved : "hero";
    this.apply(theme);
  }

  getValidThemes(): ThemeName[] {
    return [...VALID_THEMES];
  }
}

export const themeService = new ThemeService();
