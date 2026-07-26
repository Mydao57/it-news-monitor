# Wire — IT news, monitored

A small self-hosted feed reader. Add RSS/Atom feeds, see them as a board of
status cards, and open one to read its items as a wire printout.

- **apps/web** — React + Vite frontend
- **apps/api** — Express + TypeScript API, polls feeds and stores items in MongoDB

## Local development

Requires Node 20+, pnpm, and Docker (for a local Mongo).

```bash
pnpm install

# start MongoDB
docker compose up -d mongo

# API — copy the env file once, then run
cp apps/api/.env.example apps/api/.env
pnpm api:dev      # http://localhost:4000

# Web — in another terminal
cp apps/web/.env.example apps/web/.env
pnpm web:dev      # http://localhost:5173
```

The API polls every feed on startup and then every `POLL_INTERVAL_MINUTES`
(default 15). A feed's status is derived from how recently it last published:
**live** (≤3 days), **stale** (≤14 days), **dead** (unreachable, or quiet for
longer).

## Deploying to a Raspberry Pi

The app is light enough to run on a Pi: the frontend is a static build, and
the API is a single Node process. MongoDB is the one piece that needs care.

### MongoDB on Pi 4 vs Pi 5

MongoDB's official arm64 builds from **5.0 onward require the ARMv8.2-A**
instruction set. The Raspberry Pi 4's Cortex-A72 only implements ARMv8.0-A, so
`mongod` crashes on startup with `Illegal instruction (core dumped)`. The
Raspberry Pi 5's Cortex-A76 does support ARMv8.2-A, so the official `mongo:7`
image (as pinned in `docker-compose.yml`) works there without changes.

If you're on a **Pi 4** (or older), pick one:

- Pin MongoDB to a version built for ARMv8.0-A: `mongo:4.4` is the last
  official image that runs. Edit `docker-compose.yml`'s `image:` line.
- Run MongoDB on another machine (a NAS, a second Pi 5, your dev machine) and
  point the Pi's API at it via `MONGO_URI` — only the Node processes need to
  run on the Pi itself.
- Build MongoDB yourself for ARMv8.0-A (`CCFLAGS="-march=armv8-a+crc
  -mtune=cortex-a72"`) — more effort, keeps a current MongoDB version.

Sources: [docker-library/mongo#510](https://github.com/docker-library/mongo/issues/510),
[MongoDB Community: MongoDB and the Pi 4 on Ubuntu 64-bit](https://www.mongodb.com/community/forums/t/mongodb-and-the-pi-4-on-ubuntu-64-bit-aka-armv8-0-a-support/220635).

### Running it

1. Build the frontend: `pnpm --filter web build` produces static files in
   `apps/web/dist`. Serve them with any static file server (nginx, `serve`,
   or have the API serve them — not wired up yet, so a lightweight nginx
   container is the simplest option).
2. Build and run the API: `pnpm --filter api build && pnpm --filter api start`,
   with `MONGO_URI` pointing at your Mongo instance and `CORS_ORIGIN` set to
   wherever the frontend is served from.
3. Keep the API running with a process manager — a `systemd` unit or `pm2` is
   enough for a single Pi:

   ```ini
   # /etc/systemd/system/it-news-api.service
   [Unit]
   Description=Wire API
   After=network.target mongod.service

   [Service]
   WorkingDirectory=/home/pi/it-news-monitor/apps/api
   ExecStart=/usr/bin/node dist/server.js
   EnvironmentFile=/home/pi/it-news-monitor/apps/api/.env
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```

## API reference

| Method | Path                      | Description                                  |
| ------ | ------------------------- | --------------------------------------------- |
| GET    | `/api/feeds`               | List feeds with status and unread counts     |
| POST   | `/api/feeds`               | Add a feed — `{ url, name? }`                 |
| GET    | `/api/feeds/:id/items`     | List a feed's items, marks it as read         |
| POST   | `/api/feeds/:id/refresh`   | Fetch a feed immediately                      |
| DELETE | `/api/feeds/:id`           | Stop monitoring a feed and delete its items    |
