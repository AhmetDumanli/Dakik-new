# Architecture

**Analysis Date:** 2026-02-01

## Pattern Overview

**Overall:** Microservices Architecture with API Gateway and Service Discovery

**Key Characteristics:**
- Distributed system with independent Spring Boot microservices
- API Gateway pattern for request routing and load balancing
- Eureka Server for service discovery and registration
- React frontend communicating via gateway
- Database-per-service pattern (PostgreSQL)
- Synchronous inter-service communication via OpenFeign

## Layers

**API Gateway (Port 8080):**
- Purpose: Single entry point for all client requests; routes to backend services
- Location: `C:\Users\PC\Desktop\Dakik\api-gateway`
- Contains: Spring Cloud Gateway configuration, route definitions, CORS setup
- Depends on: Eureka Server for service discovery, downstream microservices
- Used by: React frontend (`http://localhost:5173`)

**User Service (Port 8081):**
- Purpose: Manages user creation, retrieval, and validation
- Location: `C:\Users\PC\Desktop\Dakik\user-service`
- Contains: User CRUD operations, authentication-related logic
- Depends on: PostgreSQL (`dakik_user` database), Eureka for registration
- Used by: Event Service and Appointment Service via OpenFeign

**Event Service (Port 8082):**
- Purpose: Manages event creation, locking, booking operations
- Location: `C:\Users\PC\Desktop\Dakik\event-service`
- Contains: Event lifecycle management, event-user relationships
- Depends on: PostgreSQL (`dakik_event` database), User Service (OpenFeign client), Eureka
- Used by: Appointment Service, Frontend via API Gateway

**Appointment Service (Port 8083):**
- Purpose: Manages appointment bookings and cancellations
- Location: `C:\Users\PC\Desktop\Dakik\appointment-service`
- Contains: Appointment CRUD, event availability validation
- Depends on: PostgreSQL (`dakik_appointment` database), User Service, Event Service (OpenFeign clients), Eureka
- Used by: Frontend via API Gateway

**Eureka Server (Port 8761):**
- Purpose: Service registry and discovery for dynamic service location
- Location: `C:\Users\PC\Desktop\Dakik\eureka-server`
- Contains: Service registration, heartbeat monitoring
- Depends on: None
- Used by: All microservices for registration and discovery

**Frontend (Port 5173):**
- Purpose: React-based UI for user, event, and appointment management
- Location: `C:\Users\PC\Desktop\Dakik\frontend`
- Contains: React components, pages, API client
- Depends on: API Gateway at `http://localhost:8080`
- Used by: End users

## Data Flow

**User Creation Flow:**

1. Frontend sends POST request to API Gateway (`/users`)
2. API Gateway routes to User Service using load-balanced URI (`lb://USER-SERVICE`)
3. User Service validates email uniqueness, persists to PostgreSQL
4. User Service returns UserResponse to API Gateway
5. API Gateway returns response to Frontend
6. Frontend updates local state and UI

**Event Booking Flow:**

1. Frontend sends POST request to API Gateway (`/appointments`)
2. API Gateway routes to Appointment Service
3. Appointment Service calls User Service (OpenFeign) to validate user exists
4. Appointment Service calls Event Service (OpenFeign) to validate event availability
5. If valid, Appointment Service persists booking to PostgreSQL
6. Response flows back through API Gateway to Frontend

**State Management:**
- Backend: Stateless services; state persisted in PostgreSQL databases
- Frontend: React component state using `useState` hook; no centralized state management (props drilling)
- Service Registration: Eureka maintains dynamic service registry; clients discover services via Eureka

## Key Abstractions

**Service Layer Pattern:**
- Purpose: Encapsulates business logic and repository access
- Examples: `C:\Users\PC\Desktop\Dakik\user-service\src\main\java\com\example\user_service\Service\UserService.java`, `C:\Users\PC\Desktop\Dakik\event-service\src\main\java\com\example\event_service\Service\EventService.java`
- Pattern: Services receive repositories via constructor injection; methods transform DTOs and domain objects

**DTO Pattern (Data Transfer Objects):**
- Purpose: Separate API contracts from domain entities
- Examples: `UserCreate`, `UserResponse`, `EventCreate`, `EventResponse`, `AppointmentCreate`, `AppointmentResponse`
- Pattern: Requests use `Create` DTOs; responses use `Response` DTOs

**OpenFeign Clients:**
- Purpose: Declarative HTTP client for inter-service communication
- Examples: `C:\Users\PC\Desktop\Dakik\event-service\src\main\java\com\example\event_service\client\UserClient.java`, `C:\Users\PC\Desktop\Dakik\appointment-service\src\main\java\com\example\appointment_service\Client\UserClient.java`
- Pattern: Interface annotated with `@FeignClient(name = "service-name")`; Eureka resolves service name to actual host

**Controller Pattern:**
- Purpose: HTTP request handling and routing
- Examples: `UserController`, `EventController`, `AppointmentController`
- Pattern: `@RestController` with `@RequestMapping` base paths; methods decorated with `@PostMapping`, `@GetMapping`, etc.

## Entry Points

**API Gateway Routes:**
- Location: `C:\Users\PC\Desktop\Dakik\api-gateway\src\main\resources\application.properties`
- Triggers: Incoming HTTP requests from frontend
- Responsibilities: Route requests to appropriate service, handle CORS, load balance

**User Service Endpoints:**
- Location: `C:\Users\PC\Desktop\Dakik\user-service\src\main\java\com\example\user_service\Controller\UserController.java`
- Routes: `POST /users`, `GET /users/{id}`
- Triggers: API Gateway forwards requests
- Responsibilities: User creation, user retrieval

**Event Service Endpoints:**
- Location: `C:\Users\PC\Desktop\Dakik\event-service\src\main\java\com\example\event_service\Controller\EventController.java`
- Routes: `POST /events`, `GET /events/{id}`, `GET /events/user/{userId}`, `PUT /events/{id}/lock`, `PUT /events/{id}/book`, `PUT /events/{id}/unlock`
- Triggers: API Gateway forwards requests; Appointment Service calls internally
- Responsibilities: Event creation, state management, user-event associations

**Appointment Service Endpoints:**
- Location: `C:\Users\PC\Desktop\Dakik\appointment-service\src\main\java\com\example\appointment_service\Controller\AppointmentController.java`
- Routes: `POST /appointments`, `GET /appointments/user/{bookedBy}`, `DELETE /appointments/{id}/user/{bookedBy}`
- Triggers: API Gateway forwards requests
- Responsibilities: Appointment creation, retrieval, cancellation

**Frontend Entry:**
- Location: `C:\Users\PC\Desktop\Dakik\frontend\src\main.jsx`
- Triggers: Browser navigates to `http://localhost:5173`
- Responsibilities: Renders React app with routing

## Error Handling

**Strategy:** Exception-based with custom handlers

**Patterns:**
- Custom exceptions in each service: `EmailAlreadyExistsException` (UserService), `EventNotFoundException` (EventService), `AppointmentNotFoundException` (AppointmentService)
- Global exception handlers via `@RestControllerAdvice` and `@ExceptionHandler` (e.g., `GlobalExceptionHandler` in each service)
- HTTP status codes: `@ResponseStatus(HttpStatus.CREATED)` for successful creates, implicit 404/400/500 for errors
- Error responses include message field: `ErrorResponse` DTO with message property
- Frontend parses error responses: `parseError()` function extracts message from response body

## Cross-Cutting Concerns

**Logging:**
- Framework: SLF4J (implicit with Spring Boot)
- Configuration: `application.properties` files set logging levels (`logging.level.com.example=DEBUG`)
- OpenFeign debug logging enabled: `logging.level.feign=DEBUG`

**Validation:**
- Framework: Jakarta Bean Validation
- Usage: `@Valid` annotation on controller request parameters; `@NotNull`, `@NotBlank`, `@Email` on DTOs
- Example: `C:\Users\PC\Desktop\Dakik\user-service\src\main\java\com\example\user_service\Dto\UserCreate.java`

**Authentication:**
- Status: Not fully implemented (passwords stored as plain text per code comment)
- Approach: Basic HTTP transport; no JWT or session tokens
- Recommendation: Implement proper authentication before production use

**CORS:**
- Configuration: Handled in API Gateway via `spring.cloud.gateway.globalcors.cors-configurations`
- Allowed origins: `http://localhost:5173` (frontend dev server)
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed headers: All (`*`)

---

*Architecture analysis: 2026-02-01*
