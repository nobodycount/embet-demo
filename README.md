# emBET-demo (PWA)

This repo contains a small demo site with an emBET panel configured as a Progressive Web App (PWA). It includes a manifest, service worker, and icons needed for install on Android and iOS.

## What I changed
- `index.html` is the PWA entry (previously `embet-panel-webview-new.html`).
- `manifest.json` start_url set to `./` and scope to `.`.
- `sw.js` updated to a better caching strategy (precache + runtime cache, navigation fallback).
- Added icons in `icons/` and Apple touch icon sizes.

## How to test locally
Service workers require HTTPS or `localhost`. You can run a local server and test on `http://localhost:8000`.

```bash
python3 -m http.server 8000
# or
npx http-server -p 8000
```

Open `http://localhost:8000/` in Chrome, then open DevTools → Application:
- Manifest: verify icons, start_url
- Service Worker: verify `sw.js` is registered

## Deploy to GitHub Pages
1. Commit & push to GitHub.
2. In repository settings → Pages, enable GitHub Pages from the `main` branch (or `gh-pages`) and root `/`.
3. Wait a few minutes for the site to be published at `https://<username>.github.io/<repo>/`.

## Verification on Android
- Open the published URL in Chrome on Android.
- Confirm the site is served over HTTPS.
- Check DevTools → Application → Manifest and Service Workers.
- Chrome may show an install prompt; you can also use the menu to "Install app".

## Verification on iOS
- Open the site in Safari.
- Use Share → "Add to Home Screen" to add the app; iOS uses apple-touch-icon files and meta tags.

If you want, I can now:
- Replace placeholder icon PNGs with your real icons.
- Add more advanced caching rules or a resource versioning strategy.
- Create a CI action to automatically publish to GitHub Pages.

## CI: Auto-deploy to GitHub Pages

There is a GitHub Actions workflow included at `.github/workflows/pages.yml` that will publish the repository root to GitHub Pages whenever you push to `main`.

Notes:
- The action uses the provided `GITHUB_TOKEN` automatically — you don't need to add additional secrets for a basic publish. If you use a custom domain, set it in the Pages settings on GitHub.
- If you prefer to publish from a `gh-pages` branch instead of the repo root, I can adjust the workflow.
