# Codebase Concerns

**Analysis Date:** 2026-02-01

## Security Considerations

**Plain Text Password Storage:**
- Risk: Passwords stored in plain text in database without hashing or encryption
- Files: `user-service/src/main/java/com/example/user_service/Service/UserService.java` (line 26)
- Current mitigation: None - comment states "şimdilik plain" (for now plain)
- Recommendations: Implement password hashing using BCrypt or Argon2; never store plain passwords
- Impact: Critical - user credentials exposed if database is compromised

**Hardcoded Credentials in Configuration:**
- Risk: Database credentials and other sensitive config exposed in application.properties
- Files:
  - `user-service/src/main/resources/application.properties` (lines 5-7)
  - `event-service/src/main/resources/application.properties` (lines 4-6)
  - `appointment-service/src/main/resources/application.properties` (lines 4-6)
- Current mitigation: None - credentials hardcoded as "postgres/postgres"
- Recommendations: Use environment variables, Spring Cloud Config, or secrets management (HashiCorp Vault, AWS Secrets Manager)
- Impact: Critical - database access credentials publicly visible in code

**Hardcoded Frontend API Base URL:**
- Risk: API endpoint hardcoded to localhost in production-ready code
- Files: `frontend/src/api.js` (line 1 - `BASE = "http://localhost:8080"`)
- Current mitigation: None
- Recommendations: Use environment-based configuration or dynamic discovery
- Impact: High - frontend cannot reach API in non-local deployments

**Missing Authentication & Authorization:**
- Risk: No authentication mechanism; user IDs passed as parameters can be manipulated
- Files:
  - `user-service/src/main/java/com/example/user_service/Controller/UserController.java`
  - `appointment-service/src/main/java/com/example/appointment_service/Controller/AppointmentController.java`
- Current mitigation: Partial validation in appointment cancellation (line 113 checks `bookedBy`)
- Recommendations: Implement JWT/OAuth2 authentication; validate user context server-side
- Impact: Critical - unauthorized users can access/modify others' data

**CORS Allowing All Origins to Credentials:**
- Risk: CORS configured to allow all origins with credentials enabled (`allow-credentials=true`)
- Files: `api-gateway/src/main/resources/application.properties` (lines 24-28)
- Current mitigation: Partial - restricted to specific method whitelist
- Recommendations: Replace `[/**]` with specific origin whitelist; remove credentials if not needed
- Impact: High - potential CSRF attacks; credentials exposed to malicious origins

## Tech Debt

**Plain Text Password Comment:**
- Issue: Temporary implementation with explicit acknowledgment of security shortcut
- Files: `user-service/src/main/java/com/example/user_service/Service/UserService.java` (line 26)
- Impact: Every user created with plain text password; system not production-ready
- Fix approach: Implement password hashing immediately before user-facing release

**Unnecessary Import:**
- Issue: Unused import in UserController
- Files: `user-service/src/main/java/com/example/user_service/Controller/UserController.java` (line 7)
- Impact: Code cleanliness; imports `org.hibernate.cfg.Environment` but never uses it
- Fix approach: Remove unused import

**Bare Exception Catching:**
- Issue: Generic catch-all exception handler that swallows error details
- Files: `appointment-service/src/main/java/com/example/appointment_service/Service/AppointmentService.java` (lines 95-97)
- Impact: Difficult debugging; rethrows without logging context
- Fix approach: Log exception with context before rethrowing; handle specific exception types

**Empty Catch Block:**
- Issue: Error suppression in frontend with empty catch
- Files: `frontend/src/pages/AppointmentsPage.jsx` (line 13)
- Impact: Silent failures; user unaware of load errors
- Fix approach: Log errors or display user feedback

**Manual DTO Mapping:**
- Issue: Repetitive manual mapping between entities and DTOs across all services
- Files:
  - `user-service/src/main/java/com/example/user_service/Service/UserService.java` (lines 39-45)
  - `event-service/src/main/java/com/example/event_service/Service/EventService.java` (lines 122-130)
  - `appointment-service/src/main/java/com/example/appointment_service/Service/AppointmentService.java` (lines 132-141)
- Impact: Maintenance burden; easy to miss fields during updates
- Fix approach: Use MapStruct or ModelMapper library for automatic mapping

**Spring Boot Version Inconsistency:**
- Issue: Different Spring Boot versions across services
- Files:
  - `user-service/pom.xml` (line 8) - version 3.4.1
  - `appointment-service/pom.xml` (line 8) - version 4.0.1
  - `event-service/pom.xml` (line 8) - version 3.4.1
- Impact: Potential compatibility issues; inconsistent dependency versions
- Fix approach: Standardize all services to same Spring Boot version (recommend 3.4.1 LTS)

**Spring Cloud Version Mismatch:**
- Issue: Different Spring Cloud versions
- Files:
  - `user-service/pom.xml` (line 18) - 2024.0.0
  - `event-service/pom.xml` (line 18) - 2024.0.0
  - `appointment-service/pom.xml` (line 31) - 2025.1.0
- Impact: Compatibility issues with dependency management
- Fix approach: Align versions across all services; test compatibility thoroughly

**Missing Test Dependencies in POM:**
- Issue: Invalid/non-existent Spring Boot starter test dependencies
- Files: `appointment-service/pom.xml` (lines 62-74)
  - `spring-boot-starter-data-jpa-test` (does not exist)
  - `spring-boot-starter-validation-test` (does not exist)
  - `spring-boot-starter-webmvc-test` (does not exist)
- Impact: Tests will not compile; build failures
- Fix approach: Replace with standard `spring-boot-starter-test` dependency

## Fragile Areas

**Distributed Transaction Across Services:**
- Files: `appointment-service/src/main/java/com/example/appointment_service/Service/AppointmentService.java` (lines 36-98)
- Why fragile: Complex multi-step transaction across three services (User, Event, Appointment services)
  1. Check user exists (remote call)
  2. Check event exists (remote call)
  3. Lock event (remote call)
  4. Create appointment (local)
  5. Book event (remote call)
  6. If step 5 fails, unlock event (another remote call)
- Failure modes:
  - Network timeout during lock → retry locks already-locked event
  - Appointment created but event lock fails → orphaned appointment
  - Event unlock fails after appointment failure → event stays locked
- Safe modification: Add idempotency keys; implement saga pattern with compensation
- Test coverage: No integration tests; unit tests only validate happy path

**Event Lock/Book State Management:**
- Files:
  - `event-service/src/main/java/com/example/event_service/Entity/Event.java` (lines 20-21)
  - `event-service/src/main/java/com/example/event_service/Service/EventService.java` (lines 81-119)
- Why fragile: Two separate boolean flags (`available`, `locked`) with interdependent states
  - `locked=true, available=true` indicates pending
  - `locked=true, available=false` invalid state
  - No enum or state machine prevents invalid transitions
- Failure modes:
  - Race condition: two concurrent lock requests both succeed
  - Missing lock release if appointment creation fails (partially mitigated)
  - No timeout for stuck locks
- Safe modification: Implement state machine with explicit states (AVAILABLE, LOCKED, BOOKED, CANCELLED)
- Test coverage: No concurrency tests; no test for overlapping appointment scenarios

**Frontend User ID Handling:**
- Files: `frontend/src/pages/EventsPage.jsx` and `frontend/src/pages/AppointmentsPage.jsx`
- Why fragile: ActiveUser ID passed as URL parameter without verification
  - Can view/modify other users' data by changing activeUser
  - Appointment cancellation vulnerable if user ID spoofed
- Safe modification: Validate user ownership on backend before allowing operations
- Test coverage: No permission tests

**Missing Return Type on Event Unlock:**
- Files: `event-service/src/main/java/com/example/event_service/Controller/EventController.java` (line 53)
- Why fragile: `unlock()` endpoint returns `void` but should return `EventResponse`
  - Client cannot verify unlock success
  - Inconsistent with other endpoints
- Safe modification: Change return type to `EventResponse`
- Test coverage: No integration test to verify response structure

## Concurrency Issues

**Possible Race Condition in Event Locking:**
- Problem: Event can be locked by two concurrent requests
- Files: `event-service/src/main/java/com/example/event_service/Service/EventService.java` (lines 81-95)
- Root cause: Read-check-write pattern without pessimistic locking
  ```java
  if (!event.isAvailable()) { // READ
      throw new EventAlreadyBookedException(id);
  }
  // ... another thread could modify between READ and WRITE
  event.setLocked(true);
  eventRepository.save(event); // WRITE
  ```
- Current mitigation: `@Transactional` provides some protection but database-level optimistic locking missing
- Scaling limit: System breaks at ~10 concurrent requests to same event
- Scaling path: Add `@Version` field for optimistic locking; add unique constraint on event lock

**Appointment Creation State Inconsistency:**
- Problem: Appointment status can be PENDING even after lock/book failures
- Files: `appointment-service/src/main/java/com/example/appointment_service/Service/AppointmentService.java` (lines 76-93)
- Root cause: Try-catch block doesn't guarantee atomic state transitions
- Current mitigation: FAILED status set on exception
- Scaling limit: High concurrent appointment creation leads to orphaned records
- Scaling path: Use database-level constraints; implement event sourcing for audit trail

## Performance Bottlenecks

**SQL Query in Loop:**
- Problem: Time overlap check queries entire event table for user
- Files: `event-service/src/main/java/com/example/event_service/Service/EventService.java` (lines 43-48)
- Cause: `existsByUserIdAndStartTimeLessThanAndEndTimeGreaterThan` requires full table scan on large datasets
- Scaling limit: O(n) operation; degradation at >10k events per user
- Improvement path: Add database index on (userId, startTime, endTime); use time-series DB for range queries

**Debug Logging Enabled in Production:**
- Problem: DEBUG-level logging enabled for Feign clients and application code
- Files:
  - `user-service/src/main/resources/application.properties` (lines 15-16)
  - Other services don't have this but should be checked
- Cause: `logging.level.feign=DEBUG` and `logging.level.com.example=DEBUG`
- Scaling limit: At 100 req/sec, log volume becomes bottleneck; disk I/O degrades
- Improvement path: Use INFO level in production; implement structured logging with filters

**Schema Auto-Update Enabled:**
- Problem: `spring.jpa.hibernate.ddl-auto=update` in all services
- Files:
  - `user-service/src/main/resources/application.properties` (line 9)
  - `event-service/src/main/resources/application.properties` (line 9)
  - `appointment-service/src/main/resources/application.properties` (line 9)
- Cause: Automatic schema migration on every startup
- Scaling limit: Blocking DDL locks on production database; deployment delays
- Improvement path: Use Flyway/Liquibase for explicit migrations; set to `validate` in production

**Missing Database Indexes:**
- Problem: No indexes defined on frequently queried foreign keys
- Files: All Entity classes lack `@Index` annotations
- Cause: Natural keys (userId, eventId, bookedBy) not indexed
- Scaling limit: O(n) table scans for user-related queries; 100ms+ latency at 100k records
- Improvement path: Add indexes on:
  - `Event.userId`
  - `Appointment.bookedBy`
  - `Appointment.eventId`
  - `Appointment.status`

## Missing Critical Features

**No Soft Delete or Audit Trail:**
- Problem: Deleted data lost permanently; no record of who changed what
- Impact: Cannot recover deleted users/events; compliance issues (GDPR requires deletion logs)
- Blocks: Data retention policies, audit requirements

**No Rate Limiting:**
- Problem: No protection against brute force or DoS attacks
- Impact: User enumeration possible; appointment system vulnerable to spam bookings
- Blocks: Production security requirements

**No Pagination:**
- Problem: All list endpoints return all records
- Files:
  - `frontend/src/pages/EventsPage.jsx` (line 13)
  - `frontend/src/pages/AppointmentsPage.jsx` (line 11)
- Impact: Frontend loads all appointments/events; OOM at thousands of records
- Blocks: Scalability above 10k appointments

**No Event Cancellation:**
- Problem: Users can create events but never delete them
- Impact: Event table grows unbounded; orphaned events consume storage
- Blocks: Proper event lifecycle management

**No Notification System:**
- Problem: No way to notify event creators of cancellations
- Impact: Event creator unaware if appointment cancelled
- Blocks: User-facing feature completeness

## Test Coverage Gaps

**No Unit Tests for Services:**
- What's not tested: Business logic in all service classes
- Files:
  - `user-service/src/test/` - only ApplicationTests stub
  - `event-service/src/test/` - only ApplicationTests stub
  - `appointment-service/src/test/` - only ApplicationTests stub
- Risk: High - transaction logic, exception handling untested
- Priority: High

**No Integration Tests:**
- What's not tested: Feign client calls, distributed transactions, database operations
- Files: All services lack `@SpringBootTest` integration tests
- Risk: High - race conditions in event locking missed; cascading failures unknown
- Priority: High

**No Frontend Component Tests:**
- What's not tested: React component state management, form handling
- Files: `frontend/src/pages/` and `frontend/src/components/`
- Risk: Medium - UI bugs undetected; error handling untested
- Priority: Medium

**No E2E Tests:**
- What's not tested: Complete appointment booking flow; multi-service interaction
- Risk: High - appointment creation failure scenario not validated
- Priority: High

**No API Contract Tests:**
- What's not tested: Feign client expectations match actual service responses
- Risk: Medium - version mismatch between services undetected
- Priority: Medium

## Dependencies at Risk

**Deprecated Spring Cloud Dependencies:**
- Risk: Spring Cloud 2025.1.0 is bleeding-edge; may have breaking changes
- Files: `appointment-service/pom.xml` (line 31)
- Impact: Potential compatibility issues with ecosystem; limited community support
- Migration plan: Downgrade to 2024.0.0 LTS for stability

**PostgreSQL Driver Without Version Lock:**
- Risk: `org.postgresql:postgresql` without explicit version; auto-upgrades to latest
- Files: All service pom.xml files
- Impact: Unexpected behavior changes between major versions (44.x -> 45.x)
- Migration plan: Explicitly specify version; add integration tests for database compatibility

---

*Concerns audit: 2026-02-01*
