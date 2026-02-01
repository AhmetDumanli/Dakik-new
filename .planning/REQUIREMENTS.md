# Requirements: Dakik Docker Orchestration

**Defined:** 2026-02-01
**Core Value:** One command brings the entire local development environment up with working data

## v1 Requirements

### Dockerization

- [ ] **DOCK-01**: Dockerfile for each Java microservice (multi-stage Maven build)
- [ ] **DOCK-02**: Dockerfile for React frontend (Node build + nginx)
- [ ] **DOCK-03**: docker-compose.yml orchestrating all containers
- [ ] **DOCK-04**: .dockerignore files for each service

### Database

- [ ] **DB-01**: PostgreSQL container with auto-creation of 3 databases (dakik_user, dakik_event, dakik_appointment)
- [ ] **DB-02**: Seed data scripts for all 3 databases loaded on first startup
- [ ] **DB-03**: Volume persistence for database data across restarts

### Orchestration

- [ ] **ORCH-01**: Service startup ordering (Eureka → services → gateway → frontend)
- [ ] **ORCH-02**: Shared Docker network for inter-service communication via Eureka
- [ ] **ORCH-03**: Health checks for container readiness
- [ ] **ORCH-04**: Environment variable overrides for container networking (DB host, Eureka URL)

## v2 Requirements

### Developer Experience

- **DX-01**: Hot-reload for Java services in Docker (Spring DevTools + volume mounts)
- **DX-02**: Hot-reload for React frontend in Docker
- **DX-03**: Docker Compose profiles (full stack vs infrastructure-only)
- **DX-04**: Makefile or shell aliases for common operations

### Observability

- **OBS-01**: Centralized logging (stdout aggregation)
- **OBS-02**: Service health dashboard

## Out of Scope

| Feature | Reason |
|---------|--------|
| Kubernetes/Helm | Local dev only, Docker Compose sufficient |
| CI/CD pipeline | Not needed for local orchestration |
| SSL/TLS | Unnecessary for local development |
| Monitoring stack (ELK, Prometheus) | Adds complexity beyond core need |
| Production configs | Local dev only |
| Multiple environment configs | Single local environment |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DOCK-01 | — | Pending |
| DOCK-02 | — | Pending |
| DOCK-03 | — | Pending |
| DOCK-04 | — | Pending |
| DB-01 | — | Pending |
| DB-02 | — | Pending |
| DB-03 | — | Pending |
| ORCH-01 | — | Pending |
| ORCH-02 | — | Pending |
| ORCH-03 | — | Pending |
| ORCH-04 | — | Pending |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 0
- Unmapped: 11 ⚠️

---
*Requirements defined: 2026-02-01*
*Last updated: 2026-02-01 after initial definition*
