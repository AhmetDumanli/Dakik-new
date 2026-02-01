# Roadmap: Dakik Docker Orchestration

## Overview

Transform the existing microservices stack into a containerized development environment where `docker-compose up` brings up all 5 Spring Boot services, React frontend, and PostgreSQL databases with seed data — no manual setup required.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Container Images** - Dockerize all services and frontend
- [ ] **Phase 2: Database Infrastructure** - PostgreSQL container with seed data
- [ ] **Phase 3: Orchestrated Stack** - Full stack coordination with docker-compose

## Phase Details

### Phase 1: Container Images
**Goal**: All services can be built as Docker images with optimized multi-stage builds
**Depends on**: Nothing (first phase)
**Requirements**: DOCK-01, DOCK-02, DOCK-04
**Success Criteria** (what must be TRUE):
  1. Each Java service builds into a Docker image using multi-stage Maven build
  2. React frontend builds into a Docker image with nginx serving production build
  3. Docker images exclude unnecessary files via .dockerignore
  4. Image sizes are optimized (no build artifacts in final images)
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Dockerize all 5 Java microservices (multi-stage builds with layered jars)
- [ ] 01-02-PLAN.md — Dockerize React frontend (Vite build + nginx runtime)

### Phase 2: Database Infrastructure
**Goal**: PostgreSQL runs in Docker with automatic database creation, seed data, and persistent storage
**Depends on**: Phase 1
**Requirements**: DB-01, DB-02, DB-03
**Success Criteria** (what must be TRUE):
  1. PostgreSQL container automatically creates 3 databases on first startup
  2. Seed data scripts populate all 3 databases with test data
  3. Database data persists across container restarts
  4. Services can connect to databases using container hostnames
**Plans**: TBD

Plans:
- [ ] TBD (planning phase not yet complete)

### Phase 3: Orchestrated Stack
**Goal**: Full stack runs with one command, services discover each other, frontend connects to backend
**Depends on**: Phase 2
**Requirements**: DOCK-03, ORCH-01, ORCH-02, ORCH-03, ORCH-04
**Success Criteria** (what must be TRUE):
  1. Running `docker-compose up` starts all containers in dependency order
  2. Eureka starts first, then services register, then gateway, then frontend
  3. All services discover each other via Eureka on shared Docker network
  4. Health checks verify service readiness before dependent containers start
  5. Frontend at localhost:5173 successfully communicates with backend via API Gateway
**Plans**: TBD

Plans:
- [ ] TBD (planning phase not yet complete)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Container Images | 0/2 | Ready to execute | - |
| 2. Database Infrastructure | 0/? | Not started | - |
| 3. Orchestrated Stack | 0/? | Not started | - |

---
*Roadmap created: 2026-02-01*
