export interface SanitizeWarning {
  type: "blocked-import" | "blocked-url";
  source: string;
}

export interface SanitizeResult {
  css: string;
  warnings: SanitizeWarning[];
}

export function sanitizeCSS(raw: string): SanitizeResult {
  const warnings: SanitizeWarning[] = [];

  // Block @import with external URLs
  let css = raw.replace(/@import\s+['"]?https?:\/\/[^;'"]+['"]?[^;]*;?/gi, (match) => {
    warnings.push({ type: "blocked-import", source: match.trim() });
    return "/* blocked: external @import */";
  });

  // Block @import url() with external URLs
  css = css.replace(/@import\s+url\(\s*['"]?https?:\/\/[^)]+['"]?\s*\)[^;]*;?/gi, (match) => {
    warnings.push({ type: "blocked-import", source: match.trim() });
    return "/* blocked: external @import */";
  });

  // Block url() references to external resources
  css = css.replace(/url\(\s*['"]?https?:\/\/[^)]+['"]?\s*\)/gi, (match) => {
    warnings.push({ type: "blocked-url", source: match.trim() });
    return "url(about:blank)";
  });

  return { css, warnings };
}

export function buildSrcdoc(scaffoldHTML: string, playerCSS: string, baseStyles: string): string {
  const { css } = sanitizeCSS(playerCSS);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
/* Base reset + scene styles */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 320px; height: 160px; overflow: hidden; display: flex; align-items: stretch; }
${baseStyles}
</style>
<style id="player-css">
${css}
</style>
</head>
<body>
${scaffoldHTML}
</body>
</html>`;
}
