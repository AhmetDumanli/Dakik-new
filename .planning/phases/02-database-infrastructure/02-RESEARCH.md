# Phase 2: Database Infrastructure - Research

**Researched:** 2026-02-02
**Domain:** PostgreSQL Docker containerization with multi-database initialization
**Confidence:** HIGH

## Summary

PostgreSQL in Docker with multiple databases is a well-established pattern supported by the official PostgreSQL Docker image through the `/docker-entrypoint-initdb.d/` initialization mechanism. The standard approach uses a combination of environment variables and shell scripts to create multiple databases on first container startup, with named volumes providing persistence across container restarts.

For this phase, we need to create 3 databases (dakik_user, dakik_event, dakik_appointment) in a single PostgreSQL container, populate them with seed data, and configure Spring Boot services to connect using Docker network hostnames. Since the services use Hibernate with `ddl-auto=update`, we don't need migration tools like Flyway—Hibernate will automatically create tables when services first connect.

The key insight is that PostgreSQL's initialization scripts only run when the data directory is empty (first startup), and they execute in alphabetical order. This allows precise control over database creation and seed data loading through numbered script files.

**Primary recommendation:** Use PostgreSQL 17 (not 18) to avoid PGDATA location changes, mount volumes at `/var/lib/postgresql/data`, create databases via shell script in `/docker-entrypoint-initdb.d/`, and override Spring Boot datasource URLs with environment variables using Docker's relaxed binding.

## Standard Stack

The established tools for PostgreSQL in Docker:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| postgres | 17.7 | Official PostgreSQL Docker image | Most recent stable version without breaking PGDATA changes |
| pg_isready | Built-in | PostgreSQL readiness check utility | Official tool for health checks, bundled with PostgreSQL |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| docker-compose | 2.x | Container orchestration | Local development environments |
| Spring Boot Actuator | - | Application health endpoints | Service readiness verification beyond database |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| PostgreSQL 17 | PostgreSQL 18 | Version 18 changes PGDATA from `/var/lib/postgresql/data` to `/var/lib/postgresql/18/docker`, breaking existing volume mounts |
| Single container, 3 DBs | 3 separate PostgreSQL containers | More resource-intensive (3x memory/CPU), more complex networking, overkill for development |
| Shell script DB creation | Extended Dockerfile with hardcoded DBs | Less flexible, requires image rebuild for database name changes |
| Hibernate ddl-auto | Flyway/Liquibase migrations | Unnecessary complexity when services already use `ddl-auto=update` for table creation |

**Installation:**
```bash
# No installation needed - using official Docker image
docker pull postgres:17
```

## Architecture Patterns

### Recommended Project Structure
```
docker/
├── postgres/
│   ├── init/
│   │   ├── 01-init-databases.sh       # Creates 3 databases
│   │   ├── 02-seed-user-db.sql        # Seeds dakik_user
│   │   ├── 03-seed-event-db.sql       # Seeds dakik_event
│   │   └── 04-seed-appointment-db.sql # Seeds dakik_appointment
└── docker-compose.yml                 # PostgreSQL service definition
```

### Pattern 1: Multi-Database Initialization via Environment Variable
**What:** Use a shell script that reads `POSTGRES_MULTIPLE_DATABASES` environment variable and creates each database using psql.
**When to use:** When you need multiple databases in a single PostgreSQL instance (database-per-service pattern).
**Example:**
```bash
#!/bin/bash
# Source: https://github.com/mrts/docker-postgresql-multiple-databases
set -e
set -u

function create_user_and_database() {
    local database=$1
    echo "Creating database '$database'"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
        CREATE DATABASE $database;
        GRANT ALL PRIVILEGES ON DATABASE $database TO $POSTGRES_USER;
EOSQL
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
    echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
    for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
        create_user_and_database $db
    done
    echo "Multiple databases created"
fi
```

### Pattern 2: Seed Data with Database-Specific SQL Files
**What:** Use numbered SQL files that specify target database with `\c database_name` at the top.
**When to use:** When each database needs different seed data loaded on first startup.
**Example:**
```sql
-- Source: Docker official documentation - https://hub.docker.com/_/postgres
-- File: 02-seed-user-db.sql
\c dakik_user;

-- Seed data for user service
INSERT INTO users (username, email, created_at) VALUES
    ('test_user', 'test@example.com', NOW()),
    ('demo_user', 'demo@example.com', NOW());
```

### Pattern 3: Docker Compose Health Check for Database Readiness
**What:** Use `pg_isready` command in healthcheck with `depends_on: service_healthy` condition.
**When to use:** Always, to prevent services from attempting database connections before PostgreSQL is ready.
**Example:**
```yaml
# Source: https://docs.docker.com/compose/how-tos/startup-order/
services:
  postgres:
    image: postgres:17
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d dakik_user"]
      interval: 10s
      timeout: 10s
      retries: 5
      start_period: 30s

  user-service:
    depends_on:
      postgres:
        condition: service_healthy
```

### Pattern 4: Environment Variable Override for Spring Boot Datasource
**What:** Override `spring.datasource.url` using Docker environment variables with relaxed binding.
**When to use:** When containerizing Spring Boot services that need to connect to databases via Docker network hostnames.
**Example:**
```yaml
# Source: https://medium.com/@AlexanderObregon/how-spring-boot-maps-environment-variables-to-configuration-properties-2ddc55e361ca
services:
  user-service:
    environment:
      # Spring Boot automatically converts SPRING_DATASOURCE_URL to spring.datasource.url
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/dakik_user
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres
```

### Anti-Patterns to Avoid
- **Mounting volumes at `/var/lib/postgresql` for PostgreSQL 17**: This path is only for PostgreSQL 18+. For v17 and below, mount at `/var/lib/postgresql/data` or data won't persist.
- **Skipping health checks in depends_on**: Without `condition: service_healthy`, services start when PostgreSQL container starts, not when it's ready to accept connections.
- **Non-alphabetical script naming**: Scripts execute in lexicographic order. Use numeric prefixes (01-, 02-) to ensure database creation happens before seed data loading.
- **Using `ddl-auto=create` or `create-drop` in production**: These settings drop and recreate tables on startup. For development with seed data, use `update` or `validate`.
- **Hardcoding localhost in datasource URLs**: In Docker, services use container names as hostnames. `localhost` refers to the service's own container, not the PostgreSQL container.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multiple database creation | Custom Dockerfile with CREATE DATABASE commands | Shell script reading `POSTGRES_MULTIPLE_DATABASES` env var | More flexible (no rebuild needed), community-standard pattern, supports dynamic database lists |
| Database readiness checks | Sleep timers or retry loops in service code | PostgreSQL's `pg_isready` with Docker health checks | Official tool, precisely detects readiness, prevents false positives |
| Test data generation | Hand-written INSERT statements | SQL files with realistic data or tools like Mockaroo | Maintains referential integrity, generates realistic data, easier to update |
| Environment-specific config | Multiple application.properties files | Spring Boot environment variable overrides | No code changes, Docker-native, supports secrets management |
| Database connection retry logic | Custom retry code in application | Spring Boot's built-in connection retry with health checks | Already implemented, tested, and maintained |

**Key insight:** PostgreSQL's Docker image has built-in support for initialization scripts and environment-based configuration. The official image already handles the complex parts (permissions, timing, script execution order). Custom solutions often miss edge cases like script error handling, character encoding, or initialization race conditions.

## Common Pitfalls

### Pitfall 1: Volume Mount Path Mismatch (PostgreSQL 17 vs 18)
**What goes wrong:** Using `volumes: - postgres-data:/var/lib/postgresql` with PostgreSQL 17 causes data loss because the actual data directory is `/var/lib/postgresql/data`.
**Why it happens:** PostgreSQL 18 changed the PGDATA location to `/var/lib/postgresql/18/docker`, and developers copy examples without checking version compatibility.
**How to avoid:** For PostgreSQL 17 and below, always mount at `/var/lib/postgresql/data`. For 18+, mount at `/var/lib/postgresql`.
**Warning signs:** Database appears empty after container restart, initialization scripts run on every startup instead of just the first time.
**Source:** https://aronschueler.de/blog/2025/10/30/fixing-postgres-18-docker-compose-startup/ and https://github.com/docker-library/postgres/pull/1259

### Pitfall 2: Initialization Scripts Ignored After First Startup
**What goes wrong:** Modifying scripts in `/docker-entrypoint-initdb.d/` has no effect, even after restarting the container.
**Why it happens:** Initialization scripts only run when the data directory is empty. Once PostgreSQL creates the data directory, it assumes initialization is complete.
**How to avoid:** To re-run initialization scripts, delete the named volume: `docker volume rm <volume-name>` before starting the container. Or use SQL migrations for schema changes after initial setup.
**Warning signs:** Changes to seed data scripts don't appear in the database, new databases in `POSTGRES_MULTIPLE_DATABASES` aren't created.
**Source:** https://docs.docker.com/guides/pre-seeding/ and https://dev.to/karanpratapsingh/seeding-postgres-with-docker-19n7

### Pitfall 3: Race Conditions Between Database Creation and Seed Data
**What goes wrong:** Seed data scripts fail with "database does not exist" errors, even though the database creation script is alphabetically first.
**Why it happens:** Scripts run in separate psql sessions. A database created in `01-init-databases.sh` may not be immediately visible to `02-seed-data.sql` due to transaction timing.
**How to avoid:** Use `\c database_name` at the top of each seed data script to explicitly connect to the target database. Or combine database creation and seeding in a single script.
**Warning signs:** Seed data scripts show "FATAL: database does not exist" in logs, containers restart in loops, healthcheck failures.
**Source:** Community pattern from https://github.com/mrts/docker-postgresql-multiple-databases

### Pitfall 4: Services Start Before PostgreSQL Is Ready
**What goes wrong:** Spring Boot services fail to start with "Connection refused" or "database does not exist" errors, even though the PostgreSQL container is running.
**Why it happens:** `depends_on` without `condition: service_healthy` only waits for the container to start, not for PostgreSQL to finish initialization and accept connections. PostgreSQL takes 10-30 seconds to initialize on first startup.
**How to avoid:** Always use `depends_on` with `condition: service_healthy` and configure a health check using `pg_isready`. Set `start_period: 30s` to allow initialization time.
**Warning signs:** Services work after manual restart, services fail on first `docker-compose up`, logs show connection refused errors.
**Source:** https://docs.docker.com/compose/how-tos/startup-order/ and https://last9.io/blog/docker-compose-health-checks/

### Pitfall 5: Forgetting to Override Datasource URL for Docker Networking
**What goes wrong:** Services attempt to connect to `localhost:5432` instead of `postgres:5432`, resulting in "Connection refused" errors.
**Why it happens:** application.properties contains `jdbc:postgresql://localhost:5432/...` for local development. In Docker, each container has its own localhost, so services must use the PostgreSQL service name as the hostname.
**How to avoid:** Override `spring.datasource.url` using environment variables in docker-compose.yml: `SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/database_name`. Spring Boot's relaxed binding automatically converts underscores to dots.
**Warning signs:** PostgreSQL container is healthy, but services can't connect. Logs show "Connection refused" or "Unknown host" errors.
**Source:** https://medium.com/@AlexanderObregon/how-spring-boot-maps-environment-variables-to-configuration-properties-2ddc55e361ca

### Pitfall 6: Using Hibernate ddl-auto Inappropriately
**What goes wrong:** Choosing wrong `ddl-auto` setting for the environment—using `create` or `create-drop` wipes seed data on restart, while `validate` prevents Hibernate from creating tables.
**Why it happens:** Confusion about what each setting does. `create` drops and recreates schema on startup, `create-drop` adds drop on shutdown, `update` adds missing columns/tables, `validate` only checks schema matches entities.
**How to avoid:** For local development with Docker seed data, use `ddl-auto=update` or `ddl-auto=validate` (if seed scripts create tables). Never use `create` or `create-drop` with seed data you want to keep.
**Warning signs:** Seed data disappears after service restart, tables are missing even though seed scripts ran, foreign key constraints fail.
**Source:** https://www.baeldung.com/spring-boot-postgresql-docker and https://copyprogramming.com/howto/java-spring-jpa-hibernate-ddl-auto-default

## Code Examples

Verified patterns from official sources:

### Complete Multi-Database Initialization Script
```bash
#!/bin/bash
# Source: https://github.com/mrts/docker-postgresql-multiple-databases
# File: 01-init-databases.sh

set -e
set -u

function create_user_and_database() {
    local database=$1
    echo "Creating database '$database'"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
        CREATE DATABASE $database;
        GRANT ALL PRIVILEGES ON DATABASE $database TO $POSTGRES_USER;
EOSQL
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
    echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
    for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
        create_user_and_database $db
    done
    echo "Multiple databases created"
fi
```

### Seed Data Script with Database Connection
```sql
-- Source: Official PostgreSQL Docker documentation
-- File: 02-seed-user-db.sql

-- Connect to target database (critical for multi-database setup)
\c dakik_user;

-- Set error handling
\set ON_ERROR_STOP on

-- Seed data
INSERT INTO users (id, username, email, created_at) VALUES
    (1, 'test_user', 'test@example.com', NOW()),
    (2, 'admin_user', 'admin@example.com', NOW()),
    (3, 'demo_user', 'demo@example.com', NOW());

-- Verify data loaded
SELECT COUNT(*) as user_count FROM users;
```

### Docker Compose PostgreSQL Service with Health Check
```yaml
# Source: https://docs.docker.com/compose/how-tos/startup-order/
services:
  postgres:
    image: postgres:17
    container_name: dakik-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres  # Default database
      POSTGRES_MULTIPLE_DATABASES: dakik_user,dakik_event,dakik_appointment
    volumes:
      - postgres-data:/var/lib/postgresql/data  # Persistent storage
      - ./docker/postgres/init:/docker-entrypoint-initdb.d  # Init scripts
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d dakik_user"]
      interval: 10s
      timeout: 10s
      retries: 5
      start_period: 30s
    networks:
      - dakik-network

volumes:
  postgres-data:
    driver: local

networks:
  dakik-network:
    driver: bridge
```

### Spring Boot Service with Database Dependency and Environment Overrides
```yaml
# Source: https://www.baeldung.com/spring-boot-postgresql-docker
services:
  user-service:
    build: ./user-service
    container_name: user-service
    environment:
      # Override datasource URL for Docker networking
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/dakik_user
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres
      # Keep ddl-auto as update for Hibernate table creation
      SPRING_JPA_HIBERNATE_DDL_AUTO: update
    ports:
      - "8081:8081"
    depends_on:
      postgres:
        condition: service_healthy  # Wait for PostgreSQL to be ready
    networks:
      - dakik-network
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| PostgreSQL 16 and below | PostgreSQL 17 (stable), 18 (avoid) | Nov 2024 (v17), Sept 2025 (v18) | v18 introduced breaking PGDATA location change, v17 is current stable without breaking changes |
| Separate PostgreSQL containers per service | Single PostgreSQL instance with multiple databases | Ongoing pattern | More resource-efficient for development, simpler networking, easier to manage |
| Fixed sleep timers for database readiness | Docker health checks with `pg_isready` | Docker Compose v2+ | Eliminates race conditions, faster startup, more reliable |
| application.properties profiles for environments | Environment variable overrides | Spring Boot 2.0+ standard | Container-friendly, no code changes, supports secrets |
| Manual SQL INSERT statements | SQL seed files with \c database switching | PostgreSQL init script pattern | Better organization, easier to maintain, separates concerns |

**Deprecated/outdated:**
- **PostgreSQL Alpine images for production**: Alpine uses musl libc instead of glibc, which can cause subtle compatibility issues. Standard Debian-based images are recommended unless image size is critical.
- **POSTGRES_HOST_AUTH_METHOD=trust**: Older examples use `trust` to skip passwords. PostgreSQL 14+ defaults to `scram-sha-256` for better security. Keep the default.
- **Using `latest` tag**: Always pin to specific major version (e.g., `postgres:17`) to avoid unexpected upgrades and breaking changes like the PostgreSQL 18 PGDATA issue.

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal health check timing for 3-database setup**
   - What we know: Standard recommendations are `interval: 10s`, `timeout: 10s`, `retries: 5`, `start_period: 30s`
   - What's unclear: Whether creating 3 databases increases initialization time enough to warrant longer `start_period`
   - Recommendation: Start with standard timings, monitor logs during first startup. If health check fails during initialization, increase `start_period` to 40-45s.

2. **Seed data size and complexity**
   - What we know: Simple INSERT statements work fine for small datasets. For large datasets, COPY is faster.
   - What's unclear: Requirements don't specify how much seed data is needed per database
   - Recommendation: Start with 10-50 rows per key table using INSERT statements. If seed data grows beyond 1000 rows, switch to COPY or pg_restore.

3. **Character encoding for Turkish characters**
   - What we know: PostgreSQL defaults to UTF8 encoding, which supports Turkish characters (ş, ğ, ü, ö, ç, ı)
   - What's unclear: Whether application code properly handles Turkish collation (sorting order)
   - Recommendation: Default UTF8 encoding should work. If Turkish sorting is critical, test seed data with Turkish characters and verify sort order. Can specify `POSTGRES_INITDB_ARGS: "--encoding=UTF8 --lc-collate=tr_TR.UTF-8"` if needed.

## Sources

### Primary (HIGH confidence)
- Official PostgreSQL Docker image README - https://github.com/docker-library/docs/blob/master/postgres/README.md - Initialization scripts, environment variables, volume persistence, version information
- Docker Compose documentation - https://docs.docker.com/compose/how-tos/startup-order/ - Health checks, depends_on conditions, startup ordering
- Docker pre-seeding guide - https://docs.docker.com/guides/pre-seeding/ - Best practices for database seeding

### Secondary (MEDIUM confidence)
- PostgreSQL 18 PGDATA change analysis - https://aronschueler.de/blog/2025/10/30/fixing-postgres-18-docker-compose-startup/ - Verified with official GitHub PR
- Multi-database pattern repository - https://github.com/mrts/docker-postgresql-multiple-databases - Community-standard pattern with 1.5k+ stars
- Spring Boot environment variable mapping - https://medium.com/@AlexanderObregon/how-spring-boot-maps-environment-variables-to-configuration-properties-2ddc55e361ca - Verified with Spring documentation references
- Baeldung Spring Boot + PostgreSQL Docker - https://www.baeldung.com/spring-boot-postgresql-docker - Authoritative Spring ecosystem resource
- Docker health checks guide (Last9) - https://last9.io/blog/docker-compose-health-checks/ - Recent 2025-2026 best practices

### Tertiary (LOW confidence)
- Various blog posts on seed data patterns - Used for pattern validation only, cross-referenced with official sources
- Community discussions on volume persistence - Used to identify common mistakes, verified against official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using official PostgreSQL Docker image with well-documented features
- Architecture: HIGH - Patterns verified from official Docker and PostgreSQL documentation
- Pitfalls: HIGH - Common issues documented in official sources and community with large sample sizes
- Integration patterns: HIGH - Spring Boot environment variable overrides are standard and well-documented

**Research date:** 2026-02-02
**Valid until:** 2026-03-02 (30 days - PostgreSQL and Docker are stable technologies)

**Notes for planner:**
- All three services (user-service, event-service, appointment-service) need identical environment variable overrides (different database names only)
- Hibernate ddl-auto=update means we don't need table creation in seed scripts—only INSERT data
- Phase 3 will handle docker-compose.yml creation for full stack, but Phase 2 can create a standalone postgres service for testing
- No CONTEXT.md exists, so planner has full discretion on implementation details
