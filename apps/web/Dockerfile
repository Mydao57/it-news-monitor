# Build context is the repo root (needs the pnpm workspace).
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /workspace

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY apps/web apps/web
# Same-origin deploy: Caddy reverse-proxies /api/* to the api service,
# so the frontend can call relative paths and needs no API base URL.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter web build

FROM caddy:2-alpine AS runtime
COPY --from=build /workspace/apps/web/dist /srv
COPY deploy/Caddyfile /etc/caddy/Caddyfile
