# Echo — Collaborative Editing

Real-time collaborative editing with versioning, presence and access control.

## What Is It?
- Multiplayer text editor for teams, inspired by Google Docs/Overleaf.
- Real-time collaboration powered by Yjs (CRDT) over WebSockets.
- Durable storage in Postgres via Spring Boot; state is persisted and survives restarts.
- Version snapshots you can label, browse, and restore instantly for all connected users.
- Access control: owners invite/remove collaborators; backend enforces JWT-secured permissions.
- Presence: see who’s active in a document with live awareness.
- Deployable by design: separated services, Docker Compose, and strict env-driven config.

## Services
- `gateway/` (8080): Spring Cloud Gateway. Auth boundary and routing.
- `user-service/` (8081 internal): Auth (JWT), profiles, user search.
- `document-service/` (8082 internal): Documents, collaborators, content.
- `version-service/` (8083 internal): Versions (create/list/restore/delete).
- `collaboration-service/` (3001 internal): WebSocket sync (Yjs) and notifications.
- `frontend/` (3000): Next.js client (Tiptap + Yjs).

## URLs & Ports
- API Gateway: `http://localhost:8080`
- Frontend: `http://localhost:3000`
- Collab WS (via gateway): `ws://localhost:8080/ws`
- Postgres: `localhost:5433`

## Auth & Inter‑Service Comms
- Browser → Gateway: `Authorization: Bearer <jwt>`.
- Gateway validates JWT and injects `X-Username` to downstream services for `/api/**` routes.
- Collaboration WS connects through `/ws/**` with `?token=<jwt>`; collab validates via `GET /api/auth/me` through the gateway.
- Services call each other via gateway:
  - user-service: `/api/internal/users/*` (summaries, search, by-username)
  - document-service: `/api/internal/documents/*` (owner, collaborators, overwrite content)

## Databases & Migrations
- Separate DBs per service (created by Docker init script):
  - user-service → `userdb`
  - document-service → `docdb`
  - version-service → `versiondb`
- Liquibase runs per service on startup (changelogs in each service under `src/main/resources/db/changelog`).

## Run with Docker Compose
Prereqs: Java 17, Node 18+, Docker, Docker Compose.

1) Start everything (DB, services, collab)
```bash
docker compose down -v  # optional: reset DBs for a clean start
docker compose up -d
```

2) Frontend (in `frontend/`)
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
echo "NEXT_PUBLIC_WS_URL=http://localhost:8080/ws" >> .env.local
npm install
npm run dev
```

Open: Gateway `http://localhost:8080` • Frontend `http://localhost:3000`

## Local Development
- Run services individually with `mvn spring-boot:run` or `npm run dev`.
- Collab dev: `SPRING_BOOT_URL=http://localhost:8080 npm run dev` (in `collaboration-service/`).
- Frontend dev: set `.env.local` as above.

## Notes
- Documents persist via document-service; collab debounces saves and reloads on version restore.
- Notifications are delivered over a dedicated WS (`/ws/notifications?token=...`).

## Tests
- Backend: `./mvnw test` (per service)
