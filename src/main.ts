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

async function bootstrap(): Promise<void> {
  // Apply saved theme first (no flash)
  themeService.load();

  // Load translations
  await i18n.init();

  const app = document.getElementById("app")!;
  const router = new Router(app);

  router.register("/", () => {
    const el = new MainMenu();
    return el;
  });

  router.register("/levels", () => {
    const el = new LevelSelect();
    return el;
  });

  router.register("/play/:chapterId/:levelId", (params) => {
    const shell = new GameShell();
    // Load level after element is in DOM
    requestAnimationFrame(() => {
      shell.loadLevel(params.chapterId ?? "", params.levelId ?? "");
    });
    return shell;
  });

  router.register("/settings", () => {
    const el = new Settings();
    return el;
  });

  router.start();
}

bootstrap().catch(console.error);
