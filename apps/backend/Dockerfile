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
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./package.json
COPY --chown=node:node packages/shared ./packages/shared
COPY --chown=node:node apps/backend ./apps/backend
WORKDIR /app/apps/backend
USER node
EXPOSE 3001
CMD ["bun", "run", "start"]
