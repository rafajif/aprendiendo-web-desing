import type { TranslationMap } from "../types/i18n";
import { progressStore } from "./ProgressStore";

const SUPPORTED_LOCALES = ["en", "es"];

class I18nEngine {
  private locale: string = "en";
  private translations: TranslationMap = {};

  async init(): Promise<void> {
    const saved = progressStore.getData().selectedLocale;
    // Default to Spanish since the game is primarily in Spanish
    const detected = this.detectBrowserLocale();
    const locale = saved || detected || "es";
    await this.setLocale(locale);
  }

  async setLocale(locale: string): Promise<void> {
    const target = SUPPORTED_LOCALES.includes(locale) ? locale : "en";
    try {
      const res = await fetch(`/locales/${target}.json`);
      if (!res.ok) throw new Error(`Failed to load locale ${target}`);
      this.translations = (await res.json()) as TranslationMap;
      this.locale = target;
    } catch {
      // Fallback: try to load English
      if (target !== "en") {
        await this.setLocale("en");
        return;
      }
      console.warn("[I18n] Could not load any locale file.");
    }
    progressStore.updateMeta({ selectedLocale: this.locale });
    window.dispatchEvent(new CustomEvent("locale-changed", { detail: this.locale }));
  }

  t(key: string, vars?: Record<string, string>): string {
    let raw = this.translations[key];
    if (!raw) {
      console.warn(`[I18n] Missing key: "${key}" in locale "${this.locale}"`);
      raw = key;
    }
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        raw = raw.split(`{{${name}}}`).join(value);
      }
    }
    return raw;
  }

  detectBrowserLocale(): string {
    const lang = navigator.language?.split("-")[0] ?? "es";
    return SUPPORTED_LOCALES.includes(lang) ? lang : "es";
  }

  getSupportedLocales(): string[] {
    return [...SUPPORTED_LOCALES];
  }

  getCurrentLocale(): string {
    return this.locale;
  }
}

export const i18n = new I18nEngine();
