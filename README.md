# Echo — Collaborative Editing

Real-time collaborative text editing with versioning.

## What Is It?
- Multiplayer text editor for teams, inspired by Google Docs/Overleaf.
- Real-time collaboration powered by Yjs (CRDT) over WebSockets.
- Durable storage in Postgres via Spring Boot; state is persisted and survives restarts.
- Version snapshots you can label, browse, and restore instantly for all connected users.
- Access control: owners invite/remove collaborators; backend enforces JWT-secured permissions.
- Presence: see who’s active in a document with live awareness.
- Deployable by design: separated services, Docker Compose, and strict env-driven config.

## Repo Structure
- `backend/`: Spring Boot (JWT auth, Postgres, Liquibase)
- `collaboration-service/`: Node + Express + ws + Yjs (awareness, syncing)
- `frontend/`: Next.js + Tiptap (Yjs Collaboration)

## Default Ports
- API: `http://localhost:8080`
- Collab WS: `ws://localhost:3001`
- Frontend: `http://localhost:3000`
- Postgres: `localhost:5433`

## Environment Variables (required)
- Frontend
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_WS_URL`
- Backend
  - `SPRING_DATASOURCE_URL`
  - `SPRING_DATASOURCE_USERNAME`
  - `SPRING_DATASOURCE_PASSWORD`
  - `JWT_SECRET`
  - `JWT_EXPIRATION`
  - `COLLABORATION_SERVICE_URL`
- Collaboration Service
  - `SPRING_BOOT_URL`
  - `PORT` (optional, defaults to 3001 when using Docker Compose)

Frontend env is validated in `next.config.ts` (no fallbacks). Backend reads values from environment (no code‑level defaults).

## Quick Start
Prereqs: Java 17, Docker, Docker Compose, Node 18+.

1) Start DB + backend + collaboration service
```bash
docker compose up -d
```

2) Frontend (in `frontend/`)
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" >> .env.local
echo "NEXT_PUBLIC_WS_URL=ws://localhost:3001" >> .env.local
npm install
npm run dev
```

API: `http://localhost:8080` • Frontend: `http://localhost:3000`

## Run Services Individually
- Backend (in `backend/`)
  - Set env vars (see above)
  - `./mvnw spring-boot:run`
- Collaboration Service (in `collaboration-service/`)
  - `SPRING_BOOT_URL=http://localhost:8080` `npm run dev`
- Frontend (in `frontend/`)
  - Set `.env.local` then `npm run dev`

## Collaboration Protocol
- WS URL: `${NEXT_PUBLIC_WS_URL}/${documentId}?token=<jwt>`
- Uses Yjs sync + awareness. Server persists doc state (debounced) and pushes awareness snapshots on connect.

## Versioning Flow
- “Save Version” snapshots the current Yjs state to DB.
- “Restore” persists selected version; backend notifies collab service to reload the doc; clients reconnect and load restored state.

## Tests
- Backend: `./mvnw test`

## Architecture
📖 See `ARCHITECTURE.md` for details.
