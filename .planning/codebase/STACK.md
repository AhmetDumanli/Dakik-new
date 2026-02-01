# Technology Stack

**Analysis Date:** 2026-02-01

## Languages

**Primary:**
- Java 17 - Backend services (API Gateway, User Service, Event Service, Appointment Service, Eureka Server)
- JavaScript (ES2020+) - Frontend development

**Secondary:**
- JSX - React component syntax in frontend

## Runtime

**Environment:**
- Java Runtime Environment (JRE) 17 for backend services
- Node.js - For frontend development and build tooling

**Package Manager:**
- Maven 3.x - Java dependency management
  - Lockfile: `pom.xml` for each service
- npm - JavaScript dependency management
  - Lockfile: `package-lock.json` in frontend directory

## Frameworks

**Core Backend:**
- Spring Boot 3.x (varies by service):
  - API Gateway: 3.3.5
  - User Service: 3.4.1
  - Event Service: 3.4.1
  - Appointment Service: 4.0.1
  - Eureka Server: 3.3.5
- Spring Cloud (service discovery and gateway):
  - Spring Cloud Gateway - API Gateway routing and load balancing
  - Spring Cloud Netflix Eureka - Service registry and discovery
  - Spring Cloud OpenFeign - Declarative HTTP client for inter-service communication

**Core Frontend:**
- React 19.2.0 - UI framework
- React Router DOM 7.13.0 - Client-side routing

**Testing:**
- JUnit (via Spring Boot Test) - Java unit testing
- Reactor Test - Reactive testing framework
- Spring Boot Test - Integration testing

**Build/Dev:**
- Vite 7.2.4 - Frontend build tool and dev server
- Maven - Java build and project management
- ESLint 9.39.1 - JavaScript linting
- @vitejs/plugin-react 5.1.1 - React support in Vite

## Key Dependencies

**Critical Backend:**
- `spring-boot-starter-web` - REST endpoint support
- `spring-boot-starter-data-jpa` - ORM and database access
- `spring-boot-starter-validation` - Bean validation framework
- `spring-cloud-starter-netflix-eureka-client` - Service registration and discovery
- `spring-cloud-starter-gateway` - API Gateway routing (API Gateway only)
- `spring-cloud-starter-openfeign` - Inter-service HTTP communication
- `spring-cloud-starter-loadbalancer` - Client-side load balancing (API Gateway only)
- `postgresql` - PostgreSQL database driver

**Frontend:**
- `react-dom` - React DOM rendering
- `react-router-dom` - Client routing

**Dev Dependencies Frontend:**
- `@types/react` - TypeScript definitions for React
- `@types/react-dom` - TypeScript definitions for React DOM
- `eslint-plugin-react-hooks` - ESLint rules for React Hooks
- `eslint-plugin-react-refresh` - React Fast Refresh support
- `globals` - Global variable definitions for ESLint

## Configuration

**Environment:**
- Backend services configured via `application.properties` files in `src/main/resources/`
- Database credentials stored in properties files (not externalized to env vars in current setup)
- Eureka Server URL: `http://localhost:8761/eureka`

**Build:**
- Maven POM files: `pom.xml` in each Java service directory
- Frontend config: `vite.config.js` in frontend directory
- Frontend linting: `eslint.config.js`

**Port Configuration:**
- API Gateway: 8080
- User Service: 8081
- Event Service: 8082
- Appointment Service: 8083
- Eureka Server: 8761

## Platform Requirements

**Development:**
- Java 17 JDK
- Maven 3.6+
- Node.js 18+ (frontend)
- npm (frontend)
- PostgreSQL 12+ (local development)

**Production:**
- Java 17 JRE for all backend services
- PostgreSQL database
- Service discovery infrastructure (Eureka Server)
- Reverse proxy/load balancer (supports Spring Cloud Gateway)

---

*Stack analysis: 2026-02-01*
