/**
 * Resolves a public asset path relative to the Vite base URL.
 * Works both in dev (base = "/") and in GitHub Pages (base = "/repo-name/").
 */
export function assetUrl(path: string): string {
  // import.meta.env.BASE_URL is injected by Vite at build time
  const base = import.meta.env.BASE_URL ?? "/";
  // Ensure no double slash
  const clean = path.startsWith("/") ? path.slice(1) : path;
  return base.endsWith("/") ? `${base}${clean}` : `${base}/${clean}`;
}

/**
 * Fetches a public asset and returns it as a base64 data URI.
 * Used to embed images inside srcdoc iframes (which have no origin).
 */
const cache = new Map<string, string>();

export async function assetAsDataUrl(path: string): Promise<string> {
  const url = assetUrl(path);
  if (cache.has(url)) return cache.get(url)!;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch asset: ${url}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      cache.set(url, result);
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Preload both game images at startup.
 */
let _webDataUrl = "";
let _heroesDataUrl = "";

export async function preloadGameAssets(): Promise<void> {
  [_webDataUrl, _heroesDataUrl] = await Promise.all([
    assetAsDataUrl("base.png"),
    assetAsDataUrl("rostros.jpg"),
  ]);
}

export function getWebDataUrl(): string { return _webDataUrl; }
export function getHeroesDataUrl(): string { return _heroesDataUrl; }
