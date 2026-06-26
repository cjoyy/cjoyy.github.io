# Calvin Joy Tarigan — Portfolio

Single-page portfolio at [cjoyy.dev](https://cjoyy.dev) with CalvinBot AI chat.

## Stack

- **Vite** — dev/build tooling
- **Vanilla JS + CSS** — dark SaaS aesthetic with canvas particles
- **Vercel Functions** — `api/chat.js` for CalvinBot (Gemini 2.0 Flash)
- **Deploy** — Vercel (GitHub integration, auto-deploys on push)

## Development

```bash
npm run dev      # Vite dev server on :3000
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

For CalvinBot API locally:
```bash
npx vercel dev   # Runs Vite + serverless functions
```

## Environment

| Variable | Where |
|----------|-------|
| `GEMINI_API_KEY` | Vercel dashboard → Environment Variables |

## CalvinBot

The floating chat widget answers questions about Calvin's projects, skills, and experience. It performs a local relevance check before calling Gemini — off-topic questions never trigger the API.
