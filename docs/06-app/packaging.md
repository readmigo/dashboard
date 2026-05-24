---
title: Packaging & Build Artefacts
phase: app
status: active
owner: data-team
last_updated: 2026-05-24
---

# Packaging & Build Artefacts

## Artefact format

The Readmigo Dashboard is a **static Single-Page Application (SPA)** deployed as a collection of HTML, CSS, and JavaScript files.

**Build output**: `dist/` directory containing:

- `index.html` — Vite-generated entry point with inline hashes
- `assets/` — Bundled and minified JavaScript, CSS, TypeScript source maps
  - `main-{hash}.js` — React application bundle
  - `index-{hash}.css` — Stylesheet bundle
  - `vendor-{hash}.js` — node_modules dependencies (react, react-admin, MUI, etc.)
- `.well-known/` — Web standard metadata (if needed for platform verification)

**Content**: React 18 + react-admin v5 SPA. No server-side rendering, backend processing, or binary artefacts.

## Build commands

```
pnpm build      # Runs: tsc && vite build
```

**Build pipeline**:

1. **TypeScript compilation** (`tsc`) — Type check entire codebase, catch errors before bundling
2. **Vite bundling** (`vite build`) — Tree-shake, minify, generate static assets in `dist/`

**Build script** (from `package.json`):
```json
"build": "tsc && vite build"
```

**Output location**: `dist/` directory in project root.

**Build dependencies**:
- Node.js 20.x
- pnpm 9.x (or npm)
- All dependencies locked in `pnpm-lock.yaml`

**Build time**: ~30–60 seconds on modern hardware.

## Signing & verification

**Signing**: Not applicable. Static files are unsigned; integrity is verified via:

- **Checksums**: GitHub Actions logs show the exact commit hash (SHA-1) for each build
- **HTTPS transport**: All files served over TLS from `dashboard.readmigo.com`
- **SRI (Subresource Integrity)**: Can be implemented in HTML `<script>` tags if enhanced security is required (not currently deployed)

**Verification**:

- Verify file integrity by comparing the commit hash in GitHub Actions with the deployed version
- For manual verification: `pnpm build` locally and compare file hashes with `dist/` directory

## Artefact distribution

### GitHub Pages deployment

1. **Trigger**: Push to `main` branch
2. **Workflow**: `.github/workflows/ci.yml` runs `pnpm build`
3. **Destination**: `dist/` directory uploaded to GitHub Pages (`gh-pages` branch)
4. **URL**: `https://dashboard.readmigo.com` (via DNS CNAME)

### Vercel deployment (alternative)

Dashboard can optionally be deployed to Vercel for faster edge delivery:

1. **Trigger**: Same as GitHub Pages (push to `main`)
2. **Configuration**: `vercel.json` (if present)
3. **Destination**: Vercel's CDN
4. **URL**: `https://dashboard.readmigo.com` (Vercel alias)

### Rollback

Each commit to `main` generates a new build. To rollback:

1. Revert the commit: `git revert <commit-hash>`
2. Push to `main`: `git push origin main`
3. CI/CD re-runs, deploying the previous stable version within 2–3 minutes

---

**Related**: [Deployment Guide](../08-deploy/deployment-guide.md) | [CI Flow](../07-pipeline/ci.md)
