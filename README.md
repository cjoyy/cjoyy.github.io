# Calvin Joy Tarigan — Portfolio

Single-page portfolio at [cjoyy.dev](https://cjoyy.dev) with CalvinBot AI chat.

## Stack

- **Vite** — dev/build tooling
- **Vanilla JS + CSS** — dark SaaS aesthetic with canvas particles
- **Cloudflare Workers** — `workers/chat.js` for CalvinBot (Groq API)
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
| `GROQ_API_KEY` | GitHub Secrets → Cloudflare Worker |

## CalvinBot

The floating chat widget answers questions about Calvin's projects, skills, and experience. It performs a local relevance check before calling Groq — off-topic questions never trigger the API.
