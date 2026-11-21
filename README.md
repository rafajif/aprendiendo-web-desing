# HéroesCSS — Aprende CSS

Juego para aprender CSS con misiones interactivas. La interfaz inicia en español y recuerda el idioma que el jugador seleccione en Ajustes.

## Iniciar en Windows

Haz doble clic en `INICIAR-JUEGO.bat`. Se abrirá el juego en el navegador y una ventana de terminal mantendrá activo el servidor local. Para detenerlo, cierra esa terminal.

También puedes iniciarlo desde una terminal:

```sh
npm ci
npm run dev -- --host 0.0.0.0 --open
```

No abras `index.html` directamente con doble clic: el navegador no puede cargar los módulos TypeScript ni los datos locales desde `file://`. El servidor de Vite sirve esos archivos correctamente.

## Publicar en GitHub Pages

El workflow en `.github/workflows/deploy.yml` compila y publica al hacer push a `main` o `master`. En GitHub, selecciona **Settings → Pages → GitHub Actions** como origen.

El sitio se publicará en `https://rafajif.github.io/aprendiendo-web-desing/`.

## Compilar

```sh
npm run build
npm run preview
```
