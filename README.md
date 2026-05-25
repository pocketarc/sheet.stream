# Sheet Stream

Display data from a Google Sheet on your Twitch/YouTube/TikTok streams in real-time.

## Technical Details

Sheet Stream is a [bun](https://bun.sh/) workspaces monorepo. The source code is available under the AGPLv3 license.

- `apps/frontend` — Next.js static export, deployed to Cloudflare Pages.
- `apps/backend` — [Hono](https://hono.dev/) API server + refresh worker, deployed to VMs.
- `packages/shared` — TypeScript types shared by both apps.

## Getting Started

Install dependencies:

```bash
bun install
```

Copy the env files and fill in the values:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Start MySQL, apply migrations, and run the backend API + refresh worker:

```bash
docker compose up -d
```

Start the frontend dev server on the host:

```bash
bun run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000); the backend API runs on [http://localhost:3001](http://localhost:3001).

### Working on the backend

To iterate on backend code, run only MySQL in Docker and the backend on the host:

```bash
docker compose up -d mysql
bun run migrate
bun run dev:backend    # Hono API with hot reload
bun run jobs:backend   # refresh worker
```
