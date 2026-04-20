# SyntaxArena

SyntaxArena is a full-stack technical assessment platform prototype designed for **live coding interviews**, **candidate evaluation**, and **collaborative coding sessions**.

It combines:

- A React + TypeScript front end with a browser-based IDE experience.
- An ASP.NET Core backend with REST endpoints and SignalR collaboration.
- A RabbitMQ-based execution queue with a Docker-ready worker scaffold.
- Early anti-cheat/proctoring hooks and keystroke session tracking.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Current Feature Set](#current-feature-set)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Repository Structure](#repository-structure)
6. [How It Works End-to-End](#how-it-works-end-to-end)
7. [Prerequisites](#prerequisites)
8. [Quick Start (Local Development)](#quick-start-local-development)
9. [Configuration Notes](#configuration-notes)
10. [API and Realtime Contracts](#api-and-realtime-contracts)
11. [Frontend Routing and Roles](#frontend-routing-and-roles)
12. [State Management Model](#state-management-model)
13. [Code Execution Pipeline (Current vs Target)](#code-execution-pipeline-current-vs-target)
14. [Collaboration Model (Yjs + SignalR)](#collaboration-model-yjs--signalr)
15. [Proctoring and Integrity Signals](#proctoring-and-integrity-signals)
16. [Known Gaps / Prototype Limitations](#known-gaps--prototype-limitations)
17. [Development Scripts](#development-scripts)
18. [Suggested Next Steps](#suggested-next-steps)
19. [Troubleshooting](#troubleshooting)
20. [License](#license)

---

## Project Overview

SyntaxArena aims to provide a LeetCode-style assessment environment with recruiter/candidate workflows and live collaboration support.

At the moment, the project is a **working prototype foundation** with key building blocks in place:

- Candidate IDE layout with split panels (problem/editor/console).
- Demo role-based login and protected layout routing.
- Assessment problem retrieval + queued code execution request.
- Background worker that consumes execution jobs from RabbitMQ.
- SignalR hub for session presence and CRDT/WebRTC signaling channels.

This makes the codebase a strong starting point for a production-grade interview platform.

---

## Current Feature Set

### Frontend

- Demo login flow with role selection (candidate/recruiter).
- Role-based app shells:
  - `/candidate/*`
  - `/recruiter/*`
- Candidate assessment workspace with resizable split panes.
- Monaco editor integration.
- Client-side collaboration hook using Yjs + SignalR.
- Proctoring hook for focus/tab/mouse-leave/copy-paste events.
- Zustand stores for auth/session/editor state.

### Backend

- REST API endpoints:
  - `POST /api/auth/login` (stub authentication)
  - `GET /api/assessment/{id}` (mock problem)
  - `POST /api/assessment/{id}/run` (enqueue execution task)
- SignalR hub at `/hubs/collaboration` for:
  - Session join/leave notifications
  - Yjs update relay
  - WebRTC offer/answer/ICE signaling
- RabbitMQ producer service for execution job queueing.
- Background worker for queue consumption (Docker execution path scaffolded).

---

## Architecture

```text
┌────────────────────────────┐
│        React Client        │
│  (Vite + TS + Monaco IDE)  │
└──────────────┬─────────────┘
               │ HTTP (/api) + WebSocket (/hubs)
┌──────────────▼─────────────┐
│      ASP.NET Core API      │
│ Controllers + SignalR Hub  │
└───────┬───────────┬────────┘
        │           │
        │           └─────────────► Realtime collaboration messages
        │
        └────────────► RabbitMQ queue (execution_queue)
                            │
                            ▼
                   Background ExecutionWorker
                   (Docker runner scaffold)
```

---

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS (via `@tailwindcss/vite`)
- Zustand (state management)
- Monaco Editor (`@monaco-editor/react`)
- Yjs + y-monaco (collaborative editing)
- SignalR JavaScript client
- React Router

### Backend

- ASP.NET Core (.NET 8)
- SignalR
- RabbitMQ.Client
- Docker.DotNet (currently scaffolded in worker)
- Swagger (development)

---

## Repository Structure

```text
SyntaxArena/
├── SyntaxArena.API/
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   └── AssessmentController.cs
│   ├── Hubs/
│   │   └── CollaborationHub.cs
│   ├── Services/
│   │   ├── RabbitMQProducer.cs
│   │   └── ExecutionWorker.cs
│   ├── Program.cs
│   └── SyntaxArena.API.csproj
├── client/
│   ├── src/
│   │   ├── components/ide/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── router/
│   │   ├── store/
│   │   └── lib/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## How It Works End-to-End

1. User opens client and logs in using demo role.
2. Candidate route loads assessment workspace.
3. Client fetches problem data from backend.
4. Candidate runs code:
   - API receives run request.
   - Request is published to RabbitMQ (`execution_queue`).
5. `ExecutionWorker` consumes the queue item.
6. Worker currently simulates container processing (mock path).
7. Collaboration traffic (Yjs updates/presence/signaling) flows through SignalR hub.

---

## Prerequisites

Install the following:

- **Node.js** 20+
- **npm** 10+
- **.NET SDK** 8.0+
- **RabbitMQ** (local instance or container)
- **Docker Desktop / Docker Engine** (needed for future real execution worker path)

Optional but useful:

- `dotnet-ef` (if you later add EF migrations)
- MongoDB (dependency exists in API package references but is not wired yet)

---

## Quick Start (Local Development)

### 1) Clone and enter repo

```bash
git clone <your-repo-url> SyntaxArena
cd SyntaxArena
```

### 2) Start RabbitMQ

If you have Docker:

```bash
docker run -d --name syntaxtarena-rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

RabbitMQ management UI: <http://localhost:15672> (default `guest/guest`).

### 3) Start backend API

From repo root:

```bash
cd SyntaxArena.API
dotnet restore
dotnet run --urls "http://localhost:5000"
```

Why port `5000`? The Vite proxy in this repo currently targets `http://localhost:5000`.

### 4) Start frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open: <http://localhost:5173>

### 5) Use demo login

- Choose **Candidate** or **Recruiter** role in login UI.
- Candidate flow routes to `/candidate/assessment/1`.

---

## Configuration Notes

### Port Alignment

There is an important local-dev detail:

- Vite proxy points to **`http://localhost:5000`**.
- `launchSettings.json` defaults API HTTP profile to **`http://localhost:5183`**.

Use one of these options:

1. Start backend with `--urls "http://localhost:5000"` (recommended for current setup).
2. Or update `client/vite.config.ts` proxy target to match your backend port.

### CORS

Backend CORS policy currently allows:

- `http://localhost:5173`
- `http://localhost:3000`

If your frontend runs elsewhere, update `Program.cs`.

### Collaboration Hub URL

`useCollaboration` currently points to a hardcoded URL:

- `https://localhost:7155/hubs/collaboration`

For production/readiness, move this to environment-based config and ensure protocol/port match your backend deployment.

---

## API and Realtime Contracts

## REST API

### `POST /api/auth/login`

Request:

```json
{
  "email": "candidate@demo.com",
  "password": "any"
}
```

Response (stub):

```json
{
  "token": "fake-jwt-token-ey...",
  "user": {
    "id": "<guid>",
    "email": "candidate@demo.com",
    "name": "Bob (Candidate)",
    "role": "candidate"
  }
}
```

### `GET /api/assessment/{id}`

Returns a mocked problem descriptor (currently “Two Sum”).

### `POST /api/assessment/{id}/run`

Request:

```json
{
  "code": "print('hello')",
  "language": "python"
}
```

Behavior:

- Enqueues execution task to RabbitMQ.
- Returns `202 Accepted` with queued message.

## SignalR Hub: `/hubs/collaboration`

Server methods:

- `JoinSession(sessionId)`
- `LeaveSession(sessionId)`
- `SendYJsUpdate(sessionId, update)`
- `SendWebRTCOffer(toConnectionId, offer)`
- `SendWebRTCAnswer(toConnectionId, answer)`
- `SendICECandidate(toConnectionId, candidate)`

Client events broadcasted:

- `UserJoined`
- `UserLeft`
- `ReceiveYJsUpdate`
- `ReceiveWebRTCOffer`
- `ReceiveWebRTCAnswer`
- `ReceiveICECandidate`

---

## Frontend Routing and Roles

Routing currently defined with three top-level areas:

- `/auth/login`
- `/candidate/assessment/:id`
- `/recruiter/dashboard`

Additional recruiter subroutes exist as placeholders:

- `/recruiter/tests`
- `/recruiter/library`
- `/recruiter/settings`

Login is demo-only and role selection is client-driven.

---

## State Management Model

Zustand stores:

- `authStore`
  - `user`, `isAuthenticated`
  - `login`, `logout`, `setRole`
- `editorStore`
  - Language, code, active problem
  - Console tab/input/run state
  - Keystroke delta replay buffer (`deltas`)

This gives a clean separation between user/session and editor-runtime data.

---

## Code Execution Pipeline (Current vs Target)

### Current (implemented)

- API accepts run request and publishes to RabbitMQ queue.
- Worker consumes message and logs simulated execution lifecycle.

### Target (planned, scaffolded in comments)

- Spin up per-run sandbox container (e.g., Node/Python image).
- Inject code/test harness.
- Enforce strict limits:
  - Memory (e.g., 256MB)
  - Timeouts (e.g., 2 seconds)
  - Network disabled
- Capture stdout/stderr/exit status.
- Return result to client (SignalR or persisted datastore).

---

## Collaboration Model (Yjs + SignalR)

The collaboration hook currently:

1. Creates a local Yjs document.
2. Connects to SignalR collaboration hub.
3. Joins a session room/group by assessment ID.
4. Converts local Yjs updates to base64 and sends to hub.
5. Receives remote updates from hub and applies them to local Yjs doc.
6. Binds Yjs text type to Monaco editor via `MonacoBinding`.

This pattern supports eventual consistency and low-latency text sync for pair/interviewer coding.

---

## Proctoring and Integrity Signals

`useProctoring` introduces a prototype integrity monitor that can:

- Detect hidden tab visibility changes.
- Detect window blur events.
- Detect cursor leaving the viewport boundaries.
- Block paste attempts and log copy/paste violations.
- Start webcam capture and periodically snapshot frames (mock upload path).

Important: this is **not yet hardened** for production privacy/compliance needs.

---

## Known Gaps / Prototype Limitations

- Auth endpoint is stubbed (no true JWT issuance/validation yet).
- No persistent database integration wired yet.
- Execution worker has mocked Docker lifecycle (no real compile/run pipeline yet).
- Collaboration URL is hardcoded in frontend hook.
- Route guard behavior and auth token flow are still partial.
- Several pages are stubs/placeholders.
- No CI pipeline, tests, or deployment manifests yet.

---

## Development Scripts

### Frontend (`client/package.json`)

```bash
npm run dev      # start Vite dev server
npm run build    # type-check + build
npm run lint     # ESLint
npm run preview  # preview production build
```

### Backend

```bash
dotnet restore
dotnet run
dotnet build
```

Swagger is enabled in Development.

---

## Suggested Next Steps

To move from prototype to production-ready platform:

1. **Authentication & Authorization**
   - Implement real JWT + refresh tokens.
   - Add role/permission checks server-side.

2. **Assessment Data Model**
   - Add persistent entities: tests, questions, submissions, users.
   - Add migration strategy and seed data.

3. **Execution Sandbox**
   - Implement deterministic language runners.
   - Add strict cgroup/network/file-system sandboxing.
   - Support hidden test cases + verdict scoring.

4. **Realtime Hardening**
   - Add authenticated SignalR connections.
   - Add reconnect/session recovery semantics.

5. **Observability**
   - Structured logging and trace IDs.
   - Metrics for queue latency, run duration, pass rates.

6. **Security & Privacy**
   - Encrypt PII-sensitive data.
   - Add explicit consent flows for webcam/proctoring.
   - Add policy-based data retention and deletion.

7. **Delivery**
   - CI/CD with lint/test/build gates.
   - Containerization + environment configs.
   - Infra docs for staging/production rollout.

---

## Troubleshooting

### `RabbitMQ not available` in backend logs

- Ensure RabbitMQ is running on `localhost:5672`.
- If using Docker, check `docker ps` and mapped ports.

### Frontend can’t reach API

- Confirm backend is running and Vite proxy target matches backend URL.
- If you see CORS/proxy issues, re-check `Program.cs` CORS policy and `vite.config.ts`.

### SignalR collaboration not connecting

- Confirm hub route `/hubs/collaboration` is mapped by backend.
- Ensure frontend hub URL uses the correct protocol (`http` vs `https`) and port.

### Webcam errors during proctoring

- Browser permission denied or unavailable media devices.
- Use HTTPS/localhost contexts where media APIs are allowed.

---

## License

No license file is currently included in this repository.

If this is intended to be open-source, add a `LICENSE` file (for example, MIT or Apache-2.0) and update this section accordingly.
