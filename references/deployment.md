# Deployment Guide for Simulation Walkthroughs

## Tech Stack

```json
{
  "dependencies": {
    "framer-motion": "^12.x",
    "lucide-react": "^0.5xx",
    "react": "^19.x",
    "react-dom": "^19.x"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.x",
    "tailwindcss": "^4.x",
    "typescript": "~5.9",
    "@vitejs/plugin-react": "^4.x",
    "vite": "^6.x"
  }
}
```

## Scaffold a New Project

```bash
bun create vite <project-name> --template react-ts
cd <project-name>
bun add framer-motion lucide-react
bun add -d tailwindcss @tailwindcss/vite
```

## Vite Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': resolve(__dirname, './src') }
  }
})
```

## Build Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "generate:llms": "bun scripts/generate-llms-txt.ts",
    "build": "bun run generate:llms && tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

## SPA Routing on Cloudflare Pages

Create `public/_redirects`:
```
/* /index.html 200
```

This catches all routes and serves the SPA. Since static files (like `llms.txt`) take priority over redirects on Cloudflare Pages, the text files are served correctly.

## Cache Headers for llms.txt

Create `public/_headers`:
```
/llms.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=3600

/llms-full.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=3600
```

## Deploy to Cloudflare Pages

### First time:
```bash
npx wrangler pages project create <project-name>
npx wrangler pages deploy dist --project-name=<project-name>
```

### Subsequent deploys:
```bash
bun run build && npx wrangler pages deploy dist --project-name=<project-name>
```

### Custom domain (optional):
Configure in the Cloudflare dashboard under Pages → Custom Domains.

## Tailwind CSS v4 Gotcha

Tailwind v4 with JIT cannot generate dynamic class names like `` bg-${color}-500 ``. If you're mapping over items with different colors, use explicit per-item JSX with literal class names:

```tsx
// BAD — won't work
items.map(item => <div className={`bg-${item.color}-500`}>)

// GOOD — literal classes
<div className="bg-blue-500">...</div>
<div className="bg-purple-500">...</div>
```

## File Structure

```
project/
├── public/
│   ├── _redirects          # SPA routing
│   ├── _headers            # Cache + content-type for text files
│   ├── llms.txt            # Generated: summary
│   └── llms-full.txt       # Generated: complete walkthrough
├── scripts/
│   └── generate-llms-txt.ts
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   │   ├── Visualizer.tsx
│   │   ├── CodePanel.tsx
│   │   ├── DiagramPanel.tsx
│   │   ├── NarrativePanel.tsx
│   │   ├── GlossaryPopup.tsx
│   │   ├── CopyToChatbot.tsx
│   │   ├── Landing.tsx
│   │   ├── Glossary.tsx
│   │   ├── About.tsx
│   │   └── ThemeToggle.tsx
│   ├── context/
│   │   └── Theme.tsx
│   ├── data/
│   │   ├── steps.ts        # Single source of truth
│   │   └── glossary.ts
│   └── utils/
│       └── cn.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```
