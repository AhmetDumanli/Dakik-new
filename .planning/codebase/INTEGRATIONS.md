# External Integrations

**Analysis Date:** 2026-02-01

## APIs & External Services

**Internal Service-to-Service Communication:**
- Event Service client in Appointment Service
  - SDK/Client: Spring Cloud OpenFeign (`@FeignClient`)
  - Interface: `C:\Users\PC\Desktop\Dakik\appointment-service\src\main\java\com\example\appointment_service\Client\EventClient.java`
  - Endpoints: GET `/events/{id}`, PUT `/events/{id}/lock`, PUT `/events/{id}/book`, PUT `/events/{id}/unlock`

- User Service client in Appointment Service
  - SDK/Client: Spring Cloud OpenFeign
  - Interface: `C:\Users\PC\Desktop\Dakik\appointment-service\src\main\java\com\example\appointment_service\Client\UserClient.java`
  - Endpoints: GET `/users/{id}`, POST `/users`

- User Service client in Event Service
  - SDK/Client: Spring Cloud OpenFeign
  - Interface: `C:\Users\PC\Desktop\Dakik\event-service\src\main\java\com\example\event_service\client\UserClient.java`
  - Endpoints: GET `/users/{id}`

## Data Storage

**Databases:**
- PostgreSQL (primary)
  - User Service: Database `dakik_user` (jdbc:postgresql://localhost:5432/dakik_user)
  - Event Service: Database `dakik_event` (jdbc:postgresql://localhost:5432/dakik_event)
  - Appointment Service: Database `dakik_appointment` (jdbc:postgresql://localhost:5432/dakik_appointment)
  - Credentials: Username `postgres`, password `postgres` (in application properties)
  - Client: Spring Data JPA with Hibernate ORM
  - Configuration files:
    - `C:\Users\PC\Desktop\Dakik\user-service\src\main\resources\application.properties`
    - `C:\Users\PC\Desktop\Dakik\event-service\src\main\resources\application.properties`
    - `C:\Users\PC\Desktop\Dakik\appointment-service\src\main\resources\application.properties`

**File Storage:**
- Local filesystem only (no external file storage detected)

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- Custom or none (no OAuth/JWT framework detected in dependencies)
- No explicit authentication layer in current implementation

## Service Discovery

**Service Registry:**
- Netflix Eureka Server (Spring Cloud)
  - Server location: `C:\Users\PC\Desktop\Dakik\eureka-server`
  - Port: 8761
  - Configuration: `C:\Users\PC\Desktop\Dakik\eureka-server\src\main\resources\application.properties`
  - All services register with Eureka and use it for discovery
  - Service names:
    - `USER-SERVICE`
    - `EVENT-SERVICE`
    - `APPOINTMENT-SERVICE`

## API Gateway

**Gateway:**
- Spring Cloud Gateway
  - Location: `C:\Users\PC\Desktop\Dakik\api-gateway`
  - Port: 8080
  - Load Balancing: Spring Cloud LoadBalancer
  - Routes configured in `C:\Users\PC\Desktop\Dakik\api-gateway\src\main\resources\application.properties`:
    - `/users/**` → USER-SERVICE
    - `/events/**` → EVENT-SERVICE
    - `/appointments/**` → APPOINTMENT-SERVICE
  - CORS enabled for `http://localhost:5173` (frontend dev server)

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, Rollbar, or similar)

**Logs:**
- Standard Spring Boot logging
- Debug logging enabled for Feign and application code in services
  - Configuration: `logging.level.feign=DEBUG`, `logging.level.com.example=DEBUG`
  - See: `C:\Users\PC\Desktop\Dakik\user-service\src\main\resources\application.properties`

## CI/CD & Deployment

**Hosting:**
- Not configured (local development setup)

**CI Pipeline:**
- None detected

## Frontend Integration

**API Communication:**
- Frontend uses native Fetch API (no external HTTP library)
- Base URL: `http://localhost:8080` (API Gateway)
- Implementation: `C:\Users\PC\Desktop\Dakik\frontend\src\api.js`
- Endpoints consumed:
  - POST `/users` - Create user
  - GET `/users/{id}` - Get user by ID
  - POST `/events` - Create event
  - GET `/events/user/{userId}` - Get events by user
  - POST `/appointments` - Create appointment
  - GET `/appointments/user/{userId}` - Get user's appointments
  - DELETE `/appointments/{id}/user/{userId}` - Cancel appointment

## Environment Configuration

**Required env vars:**
- `SPRING_DATASOURCE_URL` - Database connection string (currently in properties files)
- `SPRING_DATASOURCE_USERNAME` - Database username
- `SPRING_DATASOURCE_PASSWORD` - Database password
- `EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE` - Eureka server location
- `SPRING_CLOUD_GATEWAY_GLOBALCORS_*` - CORS settings

**Current configuration approach:**
- Environment-specific `application.properties` files in each service
- Database credentials in properties files (security concern - should use env vars)
- Eureka URL hardcoded to `http://localhost:8761/eureka`

**Secrets location:**
- Currently hardcoded in `application.properties` files (NOT RECOMMENDED for production)

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

---

*Integration audit: 2026-02-01*
