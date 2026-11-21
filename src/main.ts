import "./components/main-menu/MainMenu";
import "./components/level-select/LevelSelect";
import "./components/game-shell/EditorPane";
import "./components/game-shell/PreviewPane";
import "./components/game-shell/ResizableDivider";
import "./components/game-shell/GameShell";
import "./components/settings/Settings";

import { Router } from "./Router";
import { MainMenu } from "./components/main-menu/MainMenu";
import { LevelSelect } from "./components/level-select/LevelSelect";
import { GameShell } from "./components/game-shell/GameShell";
import { Settings } from "./components/settings/Settings";
import { i18n } from "./services/I18nEngine";
import { themeService } from "./services/ThemeService";
import { preloadGameAssets, assetUrl } from "./services/AssetLoader";

async function bootstrap(): Promise<void> {
  // Apply saved theme first (no flash)
  themeService.load();

  // Preload images as base64 so the srcdoc iframe can use them
  try {
    await preloadGameAssets();
  } catch (e) {
    console.warn("[Assets] Could not preload game assets:", e);
  }

  // Load translations
  await i18n.init();

  // Inject correct asset URLs into CSS custom properties so the
  // host page (menu, level-select etc.) also uses the right paths
  document.documentElement.style.setProperty(
    "--asset-web", `url('${assetUrl("base.png")}')`
  );
  document.documentElement.style.setProperty(
    "--asset-heroes", `url('${assetUrl("rostros.jpg")}')`
  );

  const app = document.getElementById("app")!;
  const router = new Router(app);

  router.register("/", () => new MainMenu());

  router.register("/levels", () => new LevelSelect());

  router.register("/play/:chapterId/:levelId", (params) => {
    const shell = new GameShell();
    requestAnimationFrame(() => {
      shell.loadLevel(params.chapterId ?? "", params.levelId ?? "");
    });
    return shell;
  });

  router.register("/settings", () => new Settings());

  router.start();
}

bootstrap().catch(console.error);
