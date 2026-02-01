# Dakik — Docker Orchestration

## What This Is

A Docker Compose setup that containerizes the entire Dakik appointment booking platform — all 5 Spring Boot microservices, the React frontend, and PostgreSQL — so the full stack spins up with a single `docker-compose up` command. Databases are created and seeded automatically.

## Core Value

One command brings the entire local development environment up with working data — no manual setup.

## Requirements

### Validated

- ✓ Eureka Server for service discovery — existing
- ✓ API Gateway routing to backend services — existing
- ✓ User Service (CRUD, port 8081) — existing
- ✓ Event Service (CRUD, locking, booking, port 8082) — existing
- ✓ Appointment Service (booking, cancellation, port 8083) — existing
- ✓ React frontend on port 5173 — existing
- ✓ 3 PostgreSQL databases (dakik_user, dakik_event, dakik_appointment) — existing

### Active

- [ ] Dockerfile for each Java service (multi-stage build)
- [ ] Dockerfile for React frontend
- [ ] docker-compose.yml orchestrating all containers
- [ ] PostgreSQL container with automatic DB creation (3 databases)
- [ ] Seed data for all 3 databases
- [ ] Service startup ordering (Eureka first, then services, then gateway)
- [ ] Health checks for service readiness
- [ ] Shared Docker network for inter-service communication via Eureka

### Out of Scope

- Production deployment (Kubernetes, cloud) — this is local dev only
- CI/CD pipeline — not needed for local orchestration
- SSL/TLS — unnecessary for local development
- Monitoring/logging stack (ELK, Prometheus) — adds complexity, not core need
- Multiple environment configs — local dev only

## Context

- Dakik is a microservices appointment booking platform built with Spring Boot 3 and Spring Cloud
- Services communicate via OpenFeign with Eureka service discovery
- Each service has its own PostgreSQL database (database-per-service pattern)
- Hibernate with `ddl-auto` handles schema creation
- React frontend talks to services through the API Gateway on port 8080
- Current setup requires manually starting each service and having Postgres running locally

## Constraints

- **Tech stack**: Must use Docker Compose (not Kubernetes or alternatives)
- **Compatibility**: Services expect PostgreSQL on standard port, Eureka on 8761
- **Build tool**: Services use Maven (pom.xml based)
- **Ports**: Must preserve existing port assignments (8080, 8081, 8082, 8083, 8761, 5173)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Docker Compose over K8s | Local dev only, simplicity | — Pending |
| Multi-stage Docker builds | Keep images small, build inside container | — Pending |
| Init script for DB creation | Postgres supports /docker-entrypoint-initdb.d/ scripts | — Pending |

---
*Last updated: 2026-02-01 after initialization*
