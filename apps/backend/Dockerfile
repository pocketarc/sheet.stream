# Backend image: serves the Hono API (default CMD) and the refresh worker
# (compose overrides the command). node:22-alpine provides tsx's Node runtime;
# bun handles the workspace install.
FROM node:22-alpine AS base
RUN npm install --global bun@1.3.5
WORKDIR /app

# Install the monorepo workspace (backend + shared) from the lockfile.
FROM base AS deps
COPY package.json bun.lock bunfig.toml ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN bun install

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./package.json
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
EXPOSE 3001
CMD ["bun", "run", "start"]
