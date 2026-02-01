# Coding Conventions

**Analysis Date:** 2026-02-01

## Naming Patterns

**Files:**
- Java files: PascalCase for class names matching filename exactly (e.g., `UserController.java`, `UserService.java`, `User.java`)
- JavaScript/JSX files: PascalCase for React components (e.g., `UsersPage.jsx`, `Navbar.jsx`), camelCase for utilities (e.g., `api.js`)
- Package structure: lowercase, underscore-separated for multi-word packages (e.g., `user_service`, `appointment_service`)

**Functions/Methods:**
- Java: camelCase for method names (e.g., `getById()`, `createUser()`, `mapToResponse()`)
- JavaScript: camelCase for function names and handlers (e.g., `handleSubmit()`, `loadEvents()`, `createUser()`)
- Private methods: underscore prefix convention not used; rely on access modifiers
- Private utility methods: camelCase with descriptive names (e.g., `mapToResponse()`)

**Variables:**
- Java: camelCase for local variables and fields (e.g., `userRepository`, `eventClient`, `appointmentId`)
- JavaScript: camelCase for all variables (e.g., `activeUser`, `setUsers`, `searchId`)
- State variables (React): prefixed with state name and setter (e.g., `users`/`setUsers`, `error`/`setError`)
- Constants: UPPER_SNAKE_CASE for truly constant values (not observed extensively, but follows Java convention)

**Types:**
- Java: PascalCase for class names and interfaces
- DTOs: Named with `Dto` suffix (e.g., `UserCreate.java`, `UserResponse.java`, `AppointmentResponse.java`)
- Entities: Plain singular names (e.g., `User.java`, `Event.java`, `Appointment.java`)
- Exceptions: Named with `Exception` suffix (e.g., `UserNotFoundException.java`, `EmailAlreadyExistsException.java`)
- Enums: PascalCase with UPPER_SNAKE_CASE values (e.g., `AppointmentStatus.PENDING`, `AppointmentStatus.BOOKED`)

## Code Style

**Formatting:**
- No explicit formatter configuration found (ESLint for JavaScript, no Prettier detected)
- 2-space indentation appears standard in JavaScript/JSX files
- 4-space indentation in Java files (Spring Boot standard)

**Linting:**
- JavaScript: ESLint 9.39.1 configured via `eslint.config.js`
- Config location: `frontend/eslint.config.js`
- Key rules enforced:
  - `no-unused-vars`: Error, with exception for variables starting with uppercase or underscore (`varsIgnorePattern: '^[A-Z_]'`)
  - React Hooks plugin rules enabled via `reactHooks.configs.flat.recommended`
  - React Refresh plugin enabled for Vite integration
  - ES2020 and latest JSX support enabled

**Java Formatting:**
- Spring Boot standard (4-space indentation)
- Constructor injection pattern consistently used
- Explicit getter/setter methods preferred (not Lombok)

## Import Organization

**Order (JavaScript):**
1. React core imports (e.g., `import { useState } from "react"`)
2. External libraries (e.g., `react-router-dom`)
3. Local imports (e.g., `../api`, `../components`)
4. CSS imports (e.g., `./App.css`)

**Order (Java):**
1. Standard library imports (`java.*`, `jakarta.*`)
2. Framework imports (`org.springframework.*`)
3. Third-party imports (`feign.*`)
4. Application imports (`com.example.*`)

**Path Aliases:**
- Relative imports only (no path aliases configured)
- JavaScript: Relative paths like `../api`, `../components`, `../pages`
- Java: Full package paths via Maven/Spring classpath

## Error Handling

**Patterns (JavaScript):**
- try-catch-finally pattern in async functions
- Error message extraction in `parseError()` helper: attempts JSON parsing, falls back to text
- Error thrown as `new Error(message)` with custom messages
- Component-level error state: `[error, setError]` pattern used consistently
- Silent failure on error recovery: `catch { setEvents([]) }` for optional data loads

**Patterns (Java):**
- Spring Boot exception handling via `@RestControllerAdvice` and `@ExceptionHandler`
- Custom exceptions inherit from `RuntimeException` (implicit)
- Exceptions listed: `UserNotFoundException`, `EmailAlreadyExistsException`, `AppointmentNotFoundException`, `SelfBookingException`, `EventAlreadyBookedException`, `EventLockException`, `AppointmentForbiddenException`, `AppointmentException`
- Response status mapping in exception handlers (e.g., `@ResponseStatus(HttpStatus.NOT_FOUND)`)
- Service layer: Optional-based exception throwing (e.g., `.orElseThrow(() -> new UserNotFoundException(id))`)
- FeignException handling with specific status code matching (e.g., `catch (FeignException.NotFound e)`)

## Logging

**Framework (JavaScript):**
- `console` (no specialized logging framework configured)
- No explicit console statements observed; error messaging via component state

**Framework (Java):**
- No explicit logger configuration found
- Comments used instead of logging for execution flow documentation (e.g., `// 1️⃣ User var mı?`, `// 🔐 SADECE BOOK EDEN`)
- Emoji annotations used for clarity in critical sections

**Patterns:**
- Turkish language comments used throughout to describe steps in business logic
- No formal log levels (info, warn, error) configured
- Error messages passed through exceptions rather than logged

## Comments

**When to Comment:**
- Business logic steps: Numbered comments with Turkish descriptions (e.g., `// 1️⃣ Event oluştur`)
- Security checks: Emoji-prefixed comments (e.g., `// 🔐 SADECE BOOK EDEN`)
- Error recovery steps: Emoji-prefixed explanations (e.g., `// ❗ Event'i geri aç`)
- Comments placed inline before code blocks or in margins
- No file-level or class-level documentation comments observed

**JSDoc/TSDoc:**
- Not detected in codebase
- No structured documentation comments on methods or classes
- Javadoc not used in Java classes

## Function Design

**Size:**
- Methods typically 5-30 lines; larger methods in service layer (up to ~40 lines for complex transaction logic)
- Controllers keep methods short (2-5 lines) with logic delegated to services

**Parameters:**
- Java: Dependency injection via constructor; methods receive request/entity objects
- JavaScript: Props passed as objects/array spread; handler functions receive event objects
- Validation: `@Valid` annotation on `@RequestBody` in controllers; no validation in JavaScript components
- Variable parameters: Stream collectors and list operations used for multiple items

**Return Values:**
- Java: Service methods return DTOs (e.g., `UserResponse`, `AppointmentResponse`), never raw entities
- JavaScript: Promise<Object> for async API calls; void for state setters
- Mapping performed in service layer (private `mapToResponse()` methods)
- API layer: Raw JSON parsed and returned

## Module Design

**Exports:**
- JavaScript: `export default` for components; `export async function` for API functions
- Java: No export keyword; visibility controlled via `public` class and method declarations
- DTOs, Entities, Exceptions: All public classes

**Barrel Files:**
- Not detected; JavaScript imports are direct from modules
- No index.js files used for re-exporting

**Service Layer Pattern:**
- Services annotated with `@Service`
- Constructor injection of repositories and remote clients
- Methods organize business logic; return DTOs, not entities
- Private mapper methods convert entities to response DTOs

**Repository Pattern:**
- Repositories extend Spring Data `JpaRepository` or `CrudRepository`
- Method naming follows Spring Data conventions: `findById()`, `findByEmail()`, `findByBookedBy()`
- Query methods return `Optional<T>` for single results, `List<T>` for multiple

**Controller Pattern:**
- `@RestController` annotation with `@RequestMapping` for base path
- Methods mapped with `@PostMapping`, `@GetMapping`, `@DeleteMapping`, `@PutMapping`
- Request validation with `@Valid` on DTOs
- Response status codes set via `@ResponseStatus` annotations
- Path variables extracted via `@PathVariable`

## Architectural Patterns

**Dependency Injection:**
- Constructor injection exclusively (no field injection)
- Spring's built-in DI; no custom DI framework
- Immutable dependency references via `final` fields

**Transaction Management:**
- `@Transactional` annotation on service methods that modify state
- Used in appointment creation (complex operation with multiple service calls)

**Client Communication:**
- Feign clients for inter-service communication in `appointment-service`
- Location: `com.example.appointment_service.Client` package
- Exception handling for Feign errors with status code matching

## Code Organization Summary

**Java Structure:**
- `Controller/` - REST endpoints, request validation, response mapping
- `Service/` - Business logic, transactions, exception handling
- `Entity/` - JPA entity definitions
- `Dto/` - Request and response transfer objects
- `Repository/` - Data access interfaces
- `Exception/` - Custom exception classes and global exception handler
- `Client/` - Feign clients for remote service calls

**JavaScript Structure:**
- `src/pages/` - Page components (UsersPage, EventsPage, AppointmentsPage)
- `src/components/` - Reusable components (Navbar)
- `src/api.js` - Centralized API client functions
- `src/App.jsx` - Main router and layout
- `src/main.jsx` - React root initialization

---

*Convention analysis: 2026-02-01*
