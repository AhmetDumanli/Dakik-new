# Phase 1: Container Images - Research

**Researched:** 2026-02-02
**Domain:** Docker multi-stage builds for Spring Boot Java microservices and React/Vite frontend
**Confidence:** HIGH

## Summary

This research covers implementing production-ready Docker images for a microservices architecture consisting of 5 Java Spring Boot services (using Spring Boot 3.3.5-4.0.1, Java 17, Maven) and a React 19 frontend built with Vite. The standard approach uses multi-stage Docker builds to separate build and runtime environments, achieving significant size reductions (50%+) while improving security.

For Spring Boot services, the recommended pattern uses Eclipse Temurin for building, Spring Boot's layered jar feature for optimal caching, and either distroless or slim images for runtime. For the React frontend, a two-stage build compiles with Node.js and serves production assets via nginx Alpine.

Multi-stage builds solve the "all those layers end up in your final image" problem by using distinct FROM statements to eliminate build tools from final images. Spring Boot's layered jars separate dependencies by change frequency (dependencies, spring-boot-loader, snapshot-dependencies, application), allowing Docker to cache layers effectively and rebuild only what changed. This approach is well-established across the ecosystem with official support from Spring Boot documentation and Docker best practices.

**Primary recommendation:** Use multi-stage builds with Spring Boot layered jars for Java services and nginx Alpine for the React frontend, following the official Spring Boot jarmode extraction pattern and implementing comprehensive .dockerignore files to exclude build artifacts and sensitive files.

## Standard Stack

The established tools and base images for this domain:

### Core Base Images
| Image | Version | Purpose | Why Standard |
|-------|---------|---------|--------------|
| eclipse-temurin | 17-jdk | Java build stage | Official OpenJDK distribution, TCK-tested, best balance of performance/security/compatibility |
| eclipse-temurin | 17-jre | Java runtime (basic) | Smaller than JDK, includes only runtime components |
| gcr.io/distroless/java17-debian12 | latest | Java runtime (secure) | Minimal attack surface, no shell, 192MB, based on Temurin |
| node | 20-alpine | Frontend build stage | Official Node.js, Alpine variant for smaller size |
| nginx | alpine | Frontend runtime | Lightweight (~20MB), production-ready web server |
| maven | 3.9-eclipse-temurin-17 | Maven build (alternative) | Official Maven with Temurin, useful for CI/CD |

### Supporting Tools
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| Spring Boot jarmode | 3.3.5+ | Layer extraction | All Spring Boot services for layered builds |
| maven dependency:go-offline | 3.x | Dependency caching | Build stage to cache dependencies in separate layer |
| envsubst | (nginx package) | Runtime config substitution | Vite apps needing runtime environment variables |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| distroless | eclipse-temurin:17-jre | distroless = better security, no shell for debugging |
| nginx | standalone Java server | nginx = better performance for static assets, smaller image |
| node:alpine | node:slim | alpine = smaller (~20MB vs ~60MB), may have glibc compatibility issues |
| Maven in Dockerfile | Pre-built JAR | Building in container ensures consistent environment but slower CI |

**Installation:**
```bash
# Base images pulled automatically by Docker
docker pull eclipse-temurin:17-jdk
docker pull gcr.io/distroless/java17-debian12
docker pull node:20-alpine
docker pull nginx:alpine
```

## Architecture Patterns

### Recommended Project Structure
```
dakik/
├── user-service/
│   ├── Dockerfile              # Multi-stage: maven build + distroless runtime
│   ├── .dockerignore           # Exclude target/, .git, etc.
│   ├── pom.xml
│   └── src/
├── event-service/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
├── appointment-service/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
├── api-gateway/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
├── eureka-server/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
└── frontend/
    ├── Dockerfile              # Multi-stage: node build + nginx runtime
    ├── .dockerignore           # Exclude node_modules/, dist/, .env
    ├── nginx.conf              # SPA routing, security headers
    └── ...
```

### Pattern 1: Spring Boot Multi-Stage with Layered Jars

**What:** Two-stage build that extracts Spring Boot layers in builder stage and copies them separately in runtime stage

**When to use:** All Spring Boot microservices (user-service, event-service, appointment-service, api-gateway, eureka-server)

**Example:**
```dockerfile
# Source: https://docs.spring.io/spring-boot/reference/packaging/container-images/dockerfiles.html
# Builder stage - extract layers
FROM eclipse-temurin:17-jdk AS builder
WORKDIR /builder
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} application.jar
RUN java -Djarmode=tools -jar application.jar extract --layers --destination extracted

# Runtime stage
FROM gcr.io/distroless/java17-debian12
WORKDIR /application
COPY --from=builder /builder/extracted/dependencies/ ./
COPY --from=builder /builder/extracted/spring-boot-loader/ ./
COPY --from=builder /builder/extracted/snapshot-dependencies/ ./
COPY --from=builder /builder/extracted/application/ ./
ENTRYPOINT ["java", "-jar", "application.jar"]
```

**Key details:**
- `jarmode=tools` with `extract --layers` separates JAR into 4 layers: dependencies, spring-boot-loader, snapshot-dependencies, application
- Each COPY creates a Docker layer; order matters for caching (dependencies change least, application changes most)
- distroless image has no shell, package manager, or unnecessary tools (security best practice)
- Final image ~192MB vs 880MB single-stage build (78% reduction)

### Pattern 2: Maven Dependency Caching

**What:** Copy pom.xml first and run dependency:go-offline before copying source code

**When to use:** When building JAR inside Docker (CI/CD, reproducible builds)

**Example:**
```dockerfile
# Source: https://www.baeldung.com/ops/docker-cache-maven-dependencies
FROM eclipse-temurin:17-jdk AS builder
WORKDIR /build

# Cache dependencies in separate layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build application
COPY src ./src
RUN mvn clean package -DskipTests -o

# Runtime stage (same as Pattern 1)
FROM gcr.io/distroless/java17-debian12
WORKDIR /application
COPY --from=builder /build/target/*.jar application.jar
ENTRYPOINT ["java", "-jar", "application.jar"]
```

**Key details:**
- `dependency:go-offline` downloads all dependencies when pom.xml changes
- Docker caches this layer; rebuilds only when pom.xml modified
- `-o` (offline) flag in package step uses cached dependencies
- Known limitation: go-offline doesn't download everything (plugins may still download), but "good enough"

### Pattern 3: React/Vite + Nginx Multi-Stage

**What:** Build React app with Node.js, serve production build with nginx Alpine

**When to use:** Frontend service (React 19 + Vite 7.2.4)

**Example:**
```dockerfile
# Source: https://www.buildwithmatija.com/blog/production-react-vite-docker-deployment
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf for SPA routing:**
```nginx
# Source: https://dev.to/it-wibrc/guide-to-containerizing-a-modern-javascript-spa-vuevitereact-with-a-multi-stage-nginx-build-1lma
server {
    listen 80;
    server_tokens off;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Key details:**
- `try_files $uri $uri/ /index.html;` handles client-side routing (React Router)
- `server_tokens off` hides nginx version (security)
- `add_header ... always` ensures headers on 4xx/5xx responses
- Final image ~30MB (nginx:alpine ~20MB + built assets)

### Pattern 4: .dockerignore Files

**What:** Exclude unnecessary files from Docker build context

**When to use:** All services to reduce build context size and prevent secrets exposure

**Java Service .dockerignore:**
```
# Source: https://medium.com/@bounouh.fedi/mastering-the-dockerignore-file-boosting-docker-build-efficiency-398719f4a0e1
target/
.git/
.gitignore
*.md
.env
.env.*
*.log
.vscode/
.idea/
*.iml
.DS_Store
```

**Frontend .dockerignore:**
```
# Source: https://shisho.dev/blog/posts/how-to-use-dockerignore/
node_modules/
dist/
.git/
.env
.env.*
*.log
.vscode/
.idea/
README.md
npm-debug.log
.npmrc
coverage/
.editorconfig
```

**Key details:**
- `target/` (Java) and `node_modules/`, `dist/` (Node) excluded - built inside container
- `.env*` files excluded to prevent secrets in image
- `.npmrc` may contain auth tokens - must exclude
- Reduces build context from 100s MB to <10MB

### Anti-Patterns to Avoid

- **Using "latest" tag:** Breaks reproducibility; always pin specific versions (e.g., `eclipse-temurin:17-jdk` not `eclipse-temurin:latest`)
- **Running as root:** Security risk; use `USER` instruction (note: distroless runs as non-root by default)
- **Hardcoding configuration:** Use environment variables; Spring Boot reads from ENV automatically
- **Including build artifacts:** .dockerignore should exclude `target/`, `node_modules/`, `dist/`
- **Not using multi-stage:** Single-stage includes Maven/Node.js in final image, bloating size
- **Copying before dependencies:** `COPY . .` before `mvn dependency:go-offline` breaks layer caching
- **Multiple processes per container:** One service per container; don't combine Java app + database

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Layer extraction | Custom JAR unpacking | Spring Boot jarmode tools | Supports AOT cache, CDS-friendly, maintained by Spring team |
| Dependency caching | Manual pom.xml parsing | mvn dependency:go-offline | Handles transitive deps, plugin deps, repositories |
| SPA routing | Custom nginx config | try_files $uri /index.html | Standard pattern, handles all edge cases |
| Runtime env vars (Vite) | Custom substitution script | envsubst (nginx package) | Built-in, tested, works with nginx startup |
| Security headers | Manual header config | nginx add_header with always | Ensures headers on error responses |
| Non-root user | Manual useradd commands | distroless base image | Pre-configured non-root, no shell attack surface |

**Key insight:** Docker and Spring Boot ecosystems have mature, battle-tested solutions for common containerization problems. Custom solutions miss edge cases (e.g., jarmode handles AOT cache, CDS; try_files handles trailing slashes, query params; add_header always ensures headers on 4xx/5xx).

## Common Pitfalls

### Pitfall 1: Not Fully Containerizing Maven Build
**What goes wrong:** Building JAR on host (`mvn package`), then COPYing into Dockerfile leads to "works on my machine" problems - requires Java, Maven, JAVA_HOME on every developer machine and CI server

**Why it happens:** Faster iteration during development; developers already have Maven installed

**How to avoid:** Build inside multi-stage Dockerfile (Pattern 2). For local dev, use `docker build` or keep host builds separate from containerized builds

**Warning signs:** Dockerfile starts with `COPY target/*.jar` without a builder stage; README says "Run `mvn package` first"

### Pitfall 2: Dependency Layer Cache Invalidation
**What goes wrong:** Docker rebuilds dependency layer on every code change, downloading all dependencies every build (10+ minute builds)

**Why it happens:** Dockerfile copies source code before running `mvn dependency:go-offline`, so any code change invalidates dependency layer

**How to avoid:** Follow Pattern 2 - copy pom.xml first, run dependency:go-offline, THEN copy src/

**Warning signs:** `docker build` re-downloads dependencies even when pom.xml unchanged; build times >5 minutes for code-only changes

### Pitfall 3: Vite Environment Variables Baked at Build Time
**What goes wrong:** Environment variables like API_URL are hardcoded during `npm run build`, so same Docker image can't be deployed to dev/staging/prod without rebuilding

**Why it happens:** Vite replaces `import.meta.env.VITE_*` at build time, not runtime

**How to avoid:**
- Option A: Use placeholders + envsubst at container startup (e.g., `VITE_API_URL=__API_URL__` replaced by nginx init script)
- Option B: Build separate images per environment (simpler but violates "build once, deploy many")
- Option C: External config file loaded at runtime (window.env pattern)

**Warning signs:** Need to rebuild frontend image when deploying to different environment; hardcoded URLs in built JavaScript

### Pitfall 4: Missing SPA Routing Configuration
**What goes wrong:** React Router routes (e.g., `/appointments`) return 404 in Docker, but work in Vite dev server

**Why it happens:** nginx serves files from `/usr/share/nginx/html`; `/appointments` doesn't exist as a file, so nginx returns 404

**How to avoid:** Add `try_files $uri $uri/ /index.html;` to nginx.conf (Pattern 3)

**Warning signs:** Direct navigation to React routes fails; only root path works; browser refresh on nested route shows 404

### Pitfall 5: Secrets in Docker Image
**What goes wrong:** `.env` file with database passwords, API keys copied into image; visible via `docker history`, `docker save`

**Why it happens:** `.env` in project root; .dockerignore missing or incomplete

**How to avoid:**
- Add `.env*` to .dockerignore (Pattern 4)
- Never COPY `.env` in Dockerfile
- Use Docker secrets (Swarm) or Kubernetes secrets at runtime
- Spring Boot reads from environment variables directly (no .env file needed)

**Warning signs:** `.env` file in project root; Dockerfile has `COPY .env` or `COPY . .` without .dockerignore

### Pitfall 6: Running Containers as Root
**What goes wrong:** If attacker exploits Java/Node.js vulnerability and escapes container, they have root privileges on host

**Why it happens:** Default user in many base images is root; developers don't add USER instruction

**How to avoid:**
- Use distroless images (run as non-root by default)
- OR add `USER` instruction: `RUN addgroup -S spring && adduser -S spring -G spring; USER spring:spring`

**Warning signs:** `docker exec -it <container> whoami` returns "root"; Dockerfile has no USER instruction

### Pitfall 7: Large Base Images
**What goes wrong:** Final image is 800MB+, slow to pull/push, expensive to store

**Why it happens:** Using full OS images (ubuntu, centos) or JDK instead of JRE

**How to avoid:**
- Use distroless (192MB) or alpine-based images
- Use JRE instead of JDK for runtime (temurin:17-jre vs 17-jdk)
- Multi-stage build excludes build tools

**Warning signs:** `docker images` shows >500MB for Java services, >100MB for frontend

### Pitfall 8: Memory Issues in Containers
**What goes wrong:** Java service crashes with OutOfMemoryError or container killed by Docker (OOMKilled)

**Why it happens:** JVM doesn't respect container memory limits (older Java versions) or -Xmx not set appropriately

**How to avoid:**
- Java 17 container-aware by default (detects cgroups limits)
- Set explicit -Xmx: `ENTRYPOINT ["java", "-Xmx512m", "-jar", "application.jar"]`
- Set Docker memory limit: `docker run --memory=768m` (buffer above Xmx for non-heap)

**Warning signs:** Containers randomly restart; `docker logs` shows OOMKilled; JVM uses more memory than allocated

## Code Examples

Verified patterns from official sources:

### Complete Spring Boot Multi-Stage Dockerfile (with Maven build)

```dockerfile
# Source: https://docs.spring.io/spring-boot/reference/packaging/container-images/dockerfiles.html
# and https://www.baeldung.com/ops/docker-cache-maven-dependencies

# Builder stage
FROM eclipse-temurin:17-jdk AS builder
WORKDIR /build

# Cache dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build application
COPY src ./src
RUN mvn clean package -DskipTests -o

# Extract layers
RUN java -Djarmode=tools -jar target/*.jar extract --layers --destination extracted

# Runtime stage
FROM gcr.io/distroless/java17-debian12
WORKDIR /application

# Copy layers in order of change frequency
COPY --from=builder /build/extracted/dependencies/ ./
COPY --from=builder /build/extracted/spring-boot-loader/ ./
COPY --from=builder /build/extracted/snapshot-dependencies/ ./
COPY --from=builder /build/extracted/application/ ./

ENTRYPOINT ["java", "-jar", "application.jar"]
```

### Complete React/Vite Multi-Stage Dockerfile

```dockerfile
# Source: https://www.buildwithmatija.com/blog/production-react-vite-docker-deployment

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Cache dependencies layer
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Build application
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:alpine

# Copy build artifacts
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Run as non-root (nginx:alpine includes nginx user)
USER nginx

CMD ["nginx", "-g", "daemon off;"]
```

### Production-Ready nginx.conf for React SPA

```nginx
# Source: https://dev.to/it-wibrc/guide-to-containerizing-a-modern-javascript-spa-vuevitereact-with-a-multi-stage-nginx-build-1lma
# and https://www.getpagespeed.com/server-setup/nginx-security-headers-the-right-way

server {
    listen 80;
    server_name _;
    server_tokens off;

    root /usr/share/nginx/html;
    index index.html;

    # SPA routing - all routes go to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers (always parameter ensures headers on 4xx/5xx)
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
}
```

### Java Service .dockerignore

```
# Build outputs
target/
build/
*.jar
*.war

# IDE files
.idea/
.vscode/
*.iml
*.ipr
*.iws
.project
.classpath
.settings/

# OS files
.DS_Store
Thumbs.db

# Git
.git/
.gitignore
.gitattributes

# Secrets and environment
.env
.env.*
*.pem
*.key

# Documentation
README.md
LICENSE
*.md

# Logs
*.log
logs/
```

### Frontend .dockerignore

```
# Dependencies
node_modules/

# Build outputs
dist/
build/
.vite/

# IDE files
.idea/
.vscode/
*.swp

# OS files
.DS_Store
Thumbs.db

# Git
.git/
.gitignore

# Secrets and environment
.env
.env.*
.npmrc

# Test and coverage
coverage/
.nyc_output/

# Documentation
README.md
LICENSE
*.md

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

### Building and Running Examples

```bash
# Build Java service with JAR pre-built on host
docker build -t user-service:latest ./user-service

# Build Java service with Maven build inside Docker
docker build --build-arg JAR_FILE=target/user-service-0.0.1-SNAPSHOT.jar -t user-service:latest ./user-service

# Build frontend
docker build -t frontend:latest ./frontend

# Run with environment variables
docker run -d -p 8080:8080 -e SPRING_PROFILES_ACTIVE=prod -e DB_HOST=postgres user-service:latest

# Run frontend
docker run -d -p 80:80 frontend:latest
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single-stage Dockerfile | Multi-stage builds | Docker 17.05 (2017) | 50-70% image size reduction, better security |
| Uber JAR in container | Spring Boot layered jars | Spring Boot 2.3 (2020) | Faster rebuilds, better layer caching |
| Manual layer copying | jarmode=tools extract | Spring Boot 3.2 (2023) | AOT cache support, CDS-friendly |
| openjdk base images | eclipse-temurin | 2021 | Official OpenJDK successor after Oracle license changes |
| alpine-based Java | distroless | 2018+ | No shell = smaller attack surface (but harder debugging) |
| CRA (create-react-app) | Vite | 2021+ | 10x faster builds, smaller bundles |
| Node.js in production | nginx for static assets | Always best practice | Better performance, smaller images |

**Deprecated/outdated:**
- `java:8`, `openjdk:8` - Use `eclipse-temurin:17` (Java 17 LTS, Spring Boot 3+ requires Java 17)
- `FROM maven:3.6-jdk-8` - Use `eclipse-temurin:17-jdk` or `maven:3.9-eclipse-temurin-17`
- Manual layer extraction (`unzip`, `jar -xf`) - Use Spring Boot jarmode
- `npm install` in production Dockerfile - Use `npm ci` (faster, more reliable)
- `COPY . .` before dependency install - Breaks layer caching

## Open Questions

Things that couldn't be fully resolved:

1. **CDS vs AOT Cache for Spring Boot**
   - What we know: Spring Boot docs show both CDS (Class Data Sharing, Java <24) and AOT cache (Java 24+) examples
   - What's unclear: Java 17 in this project - should we use CDS for faster startup? Worth the complexity for microservices?
   - Recommendation: Start without CDS/AOT - add only if startup time becomes issue. Layered jars are sufficient optimization for Phase 1.

2. **Multi-module Maven projects**
   - What we know: Project has 5 separate services, each with own pom.xml (not Maven multi-module)
   - What's unclear: If services share common dependencies, could there be a parent pom for version consistency?
   - Recommendation: Current structure is fine. Don't refactor to multi-module unless dependency management becomes problem.

3. **Frontend runtime environment variables**
   - What we know: Vite bakes env vars at build time; runtime substitution requires envsubst or window.env pattern
   - What's unclear: Does this project need different API URLs per environment (dev/staging/prod)?
   - Recommendation: Start with build-time env vars (simplest). If "build once, deploy many" needed, implement envsubst in nginx entrypoint later.

4. **Service discovery in containers**
   - What we know: Project uses Eureka for service discovery
   - What's unclear: How does Eureka registration work when services run in Docker? Need bridge network? Service names?
   - Recommendation: Not in scope for Phase 1 (just build images). Address in orchestration phase (Docker Compose/Kubernetes).

## Sources

### Primary (HIGH confidence)
- [Multi-stage builds | Docker Docs](https://docs.docker.com/get-started/docker-concepts/building-images/multi-stage-builds/) - Official multi-stage build documentation
- [Efficient Container Images | Spring Boot](https://docs.spring.io/spring-boot/reference/packaging/container-images/efficient-images.html) - Spring Boot layered jars specification
- [Dockerfiles | Spring Boot](https://docs.spring.io/spring-boot/reference/packaging/container-images/dockerfiles.html) - Official Spring Boot Dockerfile patterns with jarmode
- [9 Tips for Containerizing Your Spring Boot Code | Docker](https://www.docker.com/blog/9-tips-for-containerizing-your-spring-boot-code/) - Official Docker blog best practices
- [eclipse-temurin | Docker Hub](https://hub.docker.com/_/eclipse-temurin) - Official Temurin base image documentation

### Secondary (MEDIUM confidence)
- [Caching Maven Dependencies with Docker | Baeldung](https://www.baeldung.com/ops/docker-cache-maven-dependencies) - Verified dependency caching pattern
- [React Vite + Docker + Nginx Production Guide](https://www.buildwithmatija.com/blog/production-react-vite-docker-deployment) - 2025 production deployment guide
- [Guide to Containerizing Modern JavaScript SPA with Nginx](https://dev.to/it-wibrc/guide-to-containerizing-a-modern-javascript-spa-vuevitereact-with-a-multi-stage-nginx-build-1lma) - Multi-stage Vite pattern
- [Best Docker Base Images for Java Applications 2025](https://dev.to/devaaai/best-docker-base-images-and-performance-optimization-for-java-applications-in-2025-kdd) - Base image comparison
- [NGINX Security Headers 2026](https://www.getpagespeed.com/server-setup/nginx-security-headers-the-right-way) - Security header configuration

### Tertiary (LOW confidence)
- [Container Anti-Patterns | DEV Community](https://dev.to/idsulik/container-anti-patterns-common-docker-mistakes-and-how-to-avoid-them-4129) - Common mistakes compilation
- [Mastering .dockerignore | Medium](https://medium.com/@bounouh.fedi/mastering-the-dockerignore-file-boosting-docker-build-efficiency-398719f4a0e1) - .dockerignore best practices
- [Setting Up Dynamic Environment Variables with Vite and Docker](https://dev.to/dutchskull/setting-up-dynamic-environment-variables-with-vite-and-docker-5cmj) - Runtime env var patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Docker and Spring Boot documentation, Eclipse Temurin official images
- Architecture patterns: HIGH - Spring Boot docs provide exact jarmode examples, Docker docs cover multi-stage builds
- Pitfalls: MEDIUM - Compiled from multiple sources (Docker blog, community articles), cross-verified patterns
- Frontend patterns: MEDIUM - Vite + nginx is standard but less officially documented than Spring Boot

**Research date:** 2026-02-02
**Valid until:** 2026-04-02 (60 days - stable technology stack, long-term support versions)
