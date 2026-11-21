import { describe, it, expect } from "vitest";
import { sanitizeCSS } from "../src/services/SandboxRenderer";

describe("sanitizeCSS", () => {
  it("passes safe CSS through unchanged", () => {
    const { css, warnings } = sanitizeCSS(".box { display: flex; justify-content: center; }");
    expect(warnings).toHaveLength(0);
    expect(css).toContain("display: flex");
  });

  it("blocks @import with http URL", () => {
    const { css, warnings } = sanitizeCSS("@import 'https://evil.com/style.css';");
    expect(warnings[0]?.type).toBe("blocked-import");
    expect(css).not.toContain("evil.com");
  });

  it("blocks url() with http reference", () => {
    const { css, warnings } = sanitizeCSS(".bg { background: url('https://evil.com/img.png'); }");
    expect(warnings[0]?.type).toBe("blocked-url");
    expect(css).toContain("url(about:blank)");
  });

  it("allows data: URIs", () => {
    const { warnings } = sanitizeCSS(".icon { background: url('data:image/png;base64,abc'); }");
    expect(warnings).toHaveLength(0);
  });
});
