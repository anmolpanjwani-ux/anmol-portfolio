# Anmol Panjwani — Interior Designer Portfolio

Luxury, cinematic portfolio site built with Next.js 16 (App Router), React 19, Tailwind v4, Three.js / react-three-fiber, Framer Motion, GSAP, and Lenis smooth scroll. The site is built as a fully static export and deployed to GitHub Pages via GitHub Actions.

Live URL (once deployed): **https://&lt;your-github-username&gt;.github.io/anmol-portfolio/**

---

## Stack

- **Framework:** Next.js 16 (App Router, static export — `output: 'export'`)
- **Styling:** Tailwind CSS v4, custom design tokens, grain texture, glassmorphism
- **3D:** `@react-three/fiber` + `@react-three/drei` (animated particles + floating panels hero scene)
- **Animation:** `framer-motion`, `gsap`, `lenis` (smooth scroll)
- **UI primitives:** Radix UI / shadcn pattern
- **Fonts:** Inter + Cormorant Garamond via Google Fonts CDN

---

## Local development

```bash
# Use Node 20 (matches CI)
npm ci
npm run dev          # → http://localhost:3000
```

To preview the **production export** exactly as Pages serves it:

```bash
NEXT_PUBLIC_BASE_PATH=/anmol-portfolio npm run build
npm run preview      # → http://localhost:3000/anmol-portfolio/
```

If you build without `NEXT_PUBLIC_BASE_PATH`, the export targets `/` (useful for serving from a custom domain or `<user>.github.io` root repo).

---

## Deployment (GitHub Pages)

Deployment is fully automated via `.github/workflows/deploy.yml`.

### One-time setup

1. Push this repo to `github.com/<your-username>/anmol-portfolio`.
2. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main` (or run the **Deploy to GitHub Pages** workflow manually from the Actions tab).

That's it. The first run will:
- Install dependencies with `npm ci`
- Run `next build` with `NEXT_PUBLIC_BASE_PATH=/anmol-portfolio`
- Touch `.nojekyll` so Pages doesn't strip `_next/` folders
- Upload `out/` as a Pages artifact
- Deploy via `actions/deploy-pages@v4`

The deploy URL is printed in the **deploy** job summary.

### Changing the repo name

If you rename the repo, change `NEXT_PUBLIC_BASE_PATH` in `.github/workflows/deploy.yml` to match (`/<new-name>`). If you use a **user/org site** repo (named `<username>.github.io`), set `NEXT_PUBLIC_BASE_PATH: ''`.

### Custom domain

1. Add your domain as a `CNAME` file in `public/` (e.g. `public/CNAME` containing `anmolpanjwani.com`).
2. Set `NEXT_PUBLIC_BASE_PATH: ''` in the workflow.
3. Add the CNAME DNS record at your registrar pointing at `<username>.github.io`.

---

## What's static vs interactive

Everything works on GitHub Pages without modification:

- The 3D hero scene runs client-side via WebGL — no SSR/WebGL conflict because Canvas defers init to `useEffect`.
- The custom cursor, Lenis smooth scroll, and Framer Motion animations are all client-only.
- The loading screen runs on mount and dismisses itself.
- The **contact form** opens the user's mail client with a pre-filled `mailto:` (static hosts can't accept POSTs). To make it a real form, wire it to Formspree / Getform / Resend / your own endpoint inside `components/contact-section.tsx → handleSubmit`.

---

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server (with HMR) |
| `npm run build` | Static export to `out/` |
| `npm run preview` | Serve the `out/` directory locally |
| `npm run clean` | Remove `.next/` and `out/` |
| `npm run lint` | ESLint |

---

## Project structure

```
app/                 Next.js App Router pages
  layout.tsx         Root layout (fonts, metadata, analytics)
  page.tsx           Single-page composition
  globals.css        Tailwind + design tokens + cursor + grain
components/
  hero-scene.tsx     react-three-fiber 3D background
  hero-section.tsx   Main hero copy + parallax
  about-section.tsx
  projects-section.tsx
  project-modal.tsx
  contact-section.tsx
  navigation.tsx     Header + mobile menu
  loading-screen.tsx
  custom-cursor.tsx
  smooth-scroll.tsx  Lenis wrapper
  footer.tsx
  ui/                shadcn primitives (unused by this site, kept for future)
lib/
  projects.ts        Project data
  utils.ts
public/              Static assets (icons, .nojekyll)
.github/workflows/
  deploy.yml         GH Pages CI/CD
next.config.mjs      Static export, basePath, trailingSlash
```

---

## Notes on the static export

Two non-obvious decisions:

1. **Fonts load from Google Fonts CDN at runtime** instead of `next/font/google`'s build-time fetch. This makes the build portable to any environment (no network dependency at build time) and keeps the visual identical. To switch back, replace the `<link>` tags in `app/layout.tsx` with `next/font/google` imports — visually no change.

2. **`trailingSlash: true`** is required for project Pages so directory-style URLs (`/anmol-portfolio/`) serve `index.html` correctly.

3. **`.nojekyll`** is committed in `public/` so Pages does not strip files/folders starting with `_` (Next emits `_next/...`).

---

## License

© Anmol Panjwani. All rights reserved.
