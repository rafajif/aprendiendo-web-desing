export interface RouteMatch {
  params: Record<string, string>;
}

export type RouteHandler = (params: Record<string, string>) => HTMLElement;

interface Route {
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

export class Router {
  private routes: Route[] = [];
  private outlet: HTMLElement;

  constructor(outlet: HTMLElement) {
    this.outlet = outlet;
    window.addEventListener("hashchange", () => this.resolve());
  }

  register(path: string, handler: RouteHandler): void {
    // Convert "/play/:chapterId/:levelId" to regex
    const paramNames: string[] = [];
    const pattern = new RegExp(
      "^" +
        path.replace(/:([^/]+)/g, (_match, name: string) => {
          paramNames.push(name);
          return "([^/]+)";
        }) +
        "$"
    );
    this.routes.push({ pattern, paramNames, handler });
  }

  navigate(path: string): void {
    location.hash = `#${path}`;
  }

  resolve(): void {
    const hash = location.hash.replace(/^#/, "") || "/";
    for (const route of this.routes) {
      const match = hash.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, i) => {
          params[name] = match[i + 1] ?? "";
        });
        const el = route.handler(params);
        this.outlet.innerHTML = "";
        this.outlet.appendChild(el);
        return;
      }
    }
    // Fallback: home
    this.navigate("/");
  }

  start(): void {
    this.resolve();
  }
}
