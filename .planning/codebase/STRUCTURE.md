# Codebase Structure

**Analysis Date:** 2026-02-01

## Directory Layout

```
Dakik/
├── api-gateway/                    # Spring Cloud Gateway; request routing and load balancing
├── user-service/                   # User CRUD microservice
├── event-service/                  # Event management microservice
├── appointment-service/            # Appointment booking microservice
├── eureka-server/                  # Service discovery and registration server
├── frontend/                       # React UI application
├── db/                             # Database files (H2/persistent storage)
├── .planning/
│   └── codebase/                  # Planning documents
├── .git/                           # Git repository
└── .claude/                        # Claude workspace metadata
```

## Directory Purposes

**api-gateway:**
- Purpose: API Gateway for request routing, load balancing, and CORS handling
- Contains: Spring Boot application, gateway configuration, route definitions
- Key files: `C:\Users\PC\Desktop\Dakik\api-gateway\src\main\resources\application.properties`

**user-service:**
- Purpose: User account management microservice
- Contains: User controllers, services, repositories, DTOs, domain entities, exception handlers
- Key files:
  - `C:\Users\PC\Desktop\Dakik\user-service\src\main\java\com\example\user_service\UserServiceApplication.java`
  - `C:\Users\PC\Desktop\Dakik\user-service\src\main\java\com\example\user_service\Controller\UserController.java`
  - `C:\Users\PC\Desktop\Dakik\user-service\src\main\java\com\example\user_service\Service\UserService.java`

**event-service:**
- Purpose: Event creation and management microservice
- Contains: Event controllers, services, repositories, DTOs, domain entities, exception handlers, OpenFeign clients
- Key files:
  - `C:\Users\PC\Desktop\Dakik\event-service\src\main\java\com\example\event_service\EventServiceApplication.java`
  - `C:\Users\PC\Desktop\Dakik\event-service\src\main\java\com\example\event_service\Controller\EventController.java`
  - `C:\Users\PC\Desktop\Dakik\event-service\src\main\java\com\example\event_service\client\UserClient.java`

**appointment-service:**
- Purpose: Appointment booking and management microservice
- Contains: Appointment controllers, services, repositories, DTOs, domain entities, exception handlers, OpenFeign clients
- Key files:
  - `C:\Users\PC\Desktop\Dakik\appointment-service\src\main\java\com\example\appointment_service\AppointmentServiceApplication.java`
  - `C:\Users\PC\Desktop\Dakik\appointment-service\src\main\java\com\example\appointment_service\Controller\AppointmentController.java`
  - `C:\Users\PC\Desktop\Dakik\appointment-service\src\main\java\com\example\appointment_service\Client\UserClient.java`
  - `C:\Users\PC\Desktop\Dakik\appointment-service\src\main\java\com\example\appointment_service\Client\EventClient.java`

**eureka-server:**
- Purpose: Service discovery and registration center
- Contains: Eureka server configuration
- Key files: `C:\Users\PC\Desktop\Dakik\eureka-server\src\main\resources\application.properties`

**frontend:**
- Purpose: React-based user interface
- Contains: React components, pages, CSS styles, API client layer
- Key files:
  - `C:\Users\PC\Desktop\Dakik\frontend\src\main.jsx` - Entry point
  - `C:\Users\PC\Desktop\Dakik\frontend\src\App.jsx` - Main app component with routing
  - `C:\Users\PC\Desktop\Dakik\frontend\src\api.js` - API client functions
  - `C:\Users\PC\Desktop\Dakik\frontend\src\components\` - Reusable components
  - `C:\Users\PC\Desktop\Dakik\frontend\src\pages\` - Page components

**db:**
- Purpose: Database storage files
- Contains: H2/PostgreSQL persistence files
- Generated: Yes
- Committed: No (should be in .gitignore)

## Key File Locations

**Entry Points:**
- Backend (Eureka): `C:\Users\PC\Desktop\Dakik\eureka-server\src\main\java\com\example\eureka_server\EurekaServerApplication.java`
- User Service: `C:\Users\PC\Desktop\Dakik\user-service\src\main\java\com\example\user_service\UserServiceApplication.java`
- Event Service: `C:\Users\PC\Desktop\Dakik\event-service\src\main\java\com\example\event_service\EventServiceApplication.java`
- Appointment Service: `C:\Users\PC\Desktop\Dakik\appointment-service\src\main\java\com\example\appointment_service\AppointmentServiceApplication.java`
- API Gateway: `C:\Users\PC\Desktop\Dakik\api-gateway\src\main\java\com\example\api_gateway\ApiGatewayApplication.java`
- Frontend: `C:\Users\PC\Desktop\Dakik\frontend\src\main.jsx`

**Configuration:**
- User Service: `C:\Users\PC\Desktop\Dakik\user-service\src\main\resources\application.properties`
- Event Service: `C:\Users\PC\Desktop\Dakik\event-service\src\main\resources\application.properties`
- Appointment Service: `C:\Users\PC\Desktop\Dakik\appointment-service\src\main\resources\application.properties`
- Eureka Server: `C:\Users\PC\Desktop\Dakik\eureka-server\src\main\resources\application.properties`
- API Gateway: `C:\Users\PC\Desktop\Dakik\api-gateway\src\main\resources\application.properties`
- Frontend: `C:\Users\PC\Desktop\Dakik\frontend\vite.config.js`

**Core Logic:**
- User CRUD: `C:\Users\PC\Desktop\Dakik\user-service\src\main\java\com\example\user_service\Service\UserService.java`
- Event Management: `C:\Users\PC\Desktop\Dakik\event-service\src\main\java\com\example\event_service\Service\EventService.java`
- Appointment Booking: `C:\Users\PC\Desktop\Dakik\appointment-service\src\main\java\com\example\appointment_service\Service\AppointmentService.java`

**Domain Entities:**
- User: `C:\Users\PC\Desktop\Dakik\user-service\src\main\java\com\example\user_service\Entity\User.java`
- Event: `C:\Users\PC\Desktop\Dakik\event-service\src\main\java\com\example\event_service\Entity\Event.java`
- Appointment: `C:\Users\PC\Desktop\Dakik\appointment-service\src\main\java\com\example\appointment_service\Entity\Appointment.java`

**Testing:**
- User Service: `C:\Users\PC\Desktop\Dakik\user-service\src\test\java\com\example\user_service\UserServiceApplicationTests.java`
- API Gateway: `C:\Users\PC\Desktop\Dakik\api-gateway\src\test\java\com\example\api_gateway\ApiGatewayApplicationTests.java`

## Naming Conventions

**Files (Java):**
- Controllers: PascalCase + `Controller` suffix (e.g., `UserController.java`)
- Services: PascalCase + `Service` suffix (e.g., `UserService.java`)
- Repositories: PascalCase + `Repo` suffix (e.g., `UserRepo.java`)
- DTOs: PascalCase + descriptor (e.g., `UserCreate.java`, `UserResponse.java`)
- Entities: PascalCase (e.g., `User.java`, `Event.java`)
- Exceptions: PascalCase + `Exception` suffix (e.g., `EmailAlreadyExistsException.java`)
- Clients: PascalCase + `Client` suffix (e.g., `UserClient.java`)

**Files (Frontend):**
- Components: PascalCase + `.jsx` (e.g., `Navbar.jsx`)
- Pages: PascalCase + `.jsx` (e.g., `UsersPage.jsx`)
- Utilities: camelCase + `.js` (e.g., `api.js`)
- Styles: camelCase + `.css` (e.g., `App.css`)

**Directories:**
- Java packages: lowercase with dots (e.g., `com.example.user_service.Controller`)
- Java layers: PascalCase directories (e.g., `Controller`, `Service`, `Repository`, `Dto`, `Entity`, `Exception`, `Client`)
- Frontend: lowercase (e.g., `src`, `components`, `pages`, `assets`)

**Java Classes:**
- Spring beans: Use constructor injection via `final` fields
- Naming: Controllers map to `@RequestMapping` paths; services are injected as dependencies

**Frontend Code:**
- Functions/Components: camelCase for functions, PascalCase for components
- Variables: camelCase
- Hooks: Standard React hooks pattern (`useState`, etc.)
- Routes: Defined in `App.jsx` via `<Routes>` and `<Route>` components

## Where to Add New Code

**New REST Endpoint (Java Microservice):**
- Primary code: Create new method in existing `Controller` (e.g., `C:\Users\PC\Desktop\Dakik\event-service\src\main\java\com\example\event_service\Controller\EventController.java`)
- Service logic: Add method to corresponding `Service` class
- Data access: Add method to corresponding `Repo` repository interface
- DTO: Add new `Create` or `Response` DTO class in `Dto/` directory
- Tests: Add test case to existing `*ApplicationTests.java` file

**New Microservice:**
- Create new directory at root level (e.g., `notification-service`)
- Copy structure from existing service: `src/main/java/com/example/{service-name}/` with subdirectories: `Controller`, `Service`, `Repository`, `Dto`, `Entity`, `Exception`, `Client`
- Create `pom.xml` from existing service template
- Add entry in API Gateway routes: `C:\Users\PC\Desktop\Dakik\api-gateway\src\main\resources\application.properties`
- Register service name with Eureka in `application.properties`

**New Frontend Page:**
- Create component file: `C:\Users\PC\Desktop\Dakik\frontend\src\pages\{PageName}Page.jsx`
- Add route in `App.jsx`: `<Route path="/path" element={<YourComponent />} />`
- Add navigation link in `C:\Users\PC\Desktop\Dakik\frontend\src\components\Navbar.jsx`

**New Frontend Component:**
- Create component file: `C:\Users\PC\Desktop\Dakik\frontend\src\components\{ComponentName}.jsx`
- Import and use in pages or other components

**New Frontend API Function:**
- Add function to `C:\Users\PC\Desktop\Dakik\frontend\src\api.js`
- Follow pattern: `const BASE = "http://localhost:8080"`; use `fetch()` with error handling via `parseError()`

**Database Schema Change:**
- Java service: Add/modify fields in `Entity` class (e.g., `User.java`)
- Configuration: `spring.jpa.hibernate.ddl-auto=update` in `application.properties` handles schema updates
- Test: Run service to auto-create/update schema

## Special Directories

**src/main/java:**
- Purpose: Primary Java source code
- Generated: No
- Committed: Yes

**src/main/resources:**
- Purpose: Configuration files (application.properties), static assets
- Generated: No
- Committed: Yes

**src/test/java:**
- Purpose: Unit and integration tests
- Generated: No
- Committed: Yes

**target/ (Java projects):**
- Purpose: Compiled classes, JAR files, build artifacts
- Generated: Yes
- Committed: No (should be in .gitignore)

**node_modules/ (Frontend):**
- Purpose: NPM dependencies
- Generated: Yes
- Committed: No

**dist/ (Frontend):**
- Purpose: Production build output (React/Vite compiled assets)
- Generated: Yes
- Committed: No

**db/ (Database):**
- Purpose: H2/PostgreSQL data files
- Generated: Yes
- Committed: No

---

*Structure analysis: 2026-02-01*
