# Spatialytics (Astro)

Modern, cinematic website for Spatialytics LLC — spatial intelligence, print/POD SaaS, and business efficiency tools for Greater Minnesota.

## Features

- Astro 5 + Tailwind + React islands
- View Transitions for smooth navigation
- Dark cinematic design system (deep navy / cyan / amber)
- Regional comparison page (wages, cost of living, industry gap)
- Content-ready structure for projects and case studies

## Getting Started

```bash
cd spatialytics-astro
npm install
npm run dev
```

Then open http://localhost:4321

## Project Structure

```
src/
  components/     # Reusable UI + React islands
  content/        # Content collections (projects, etc.)
  layouts/        # BaseLayout with nav + footer
  pages/          # File-based routing
    index.astro   # Homepage
    compare.astro # Regional wages / costs / industry gap
  styles/         # Global Tailwind + custom utilities
```

## Key Pages

- `/` — Homepage with pillars + impact teaser
- `/compare` — Full regional comparison + industry gap analysis
- More pages (solutions, work, impact, about, contact) can be added next

## Deploy

Push to GitHub and connect to Vercel (or Netlify). Astro builds to static by default — extremely fast.
