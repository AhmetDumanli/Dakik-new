# Testing Patterns

**Analysis Date:** 2026-02-01

## Test Framework

**Runner (Java):**
- JUnit 5 (Jupiter) included via `spring-boot-starter-test`
- Spring Boot Test framework
- Reactor Test for async testing (in api-gateway: `reactor-test` dependency)

**Runner (JavaScript):**
- Not detected; no test framework configured
- No Jest, Vitest, or other test runner in package.json

**Assertion Library (Java):**
- JUnit 5 assertions (included with spring-boot-starter-test)
- AssertJ or Hamcrest available via transitive dependency but not explicitly used

**Run Commands (Java):**
```bash
mvn test                    # Run all tests
mvn test -Dtest=ClassName  # Run specific test class
mvn clean test              # Clean and run tests
```

**Run Commands (JavaScript):**
- Not configured; no test command in `package.json`

## Test File Organization

**Location (Java):**
- `src/test/java/` directory following Maven conventions
- Package structure mirrors main source: `src/main/java/com/example/service-name/` → `src/test/java/com/example/service-name/`

**Location (JavaScript):**
- Not applicable; no test files found in source tree
- node_modules contain transitive test files only (gensync, json-schema-traverse)

**Naming (Java):**
- Test classes suffixed with `Tests` (e.g., `UserServiceApplicationTests.java`)
- Follows Spring Boot convention for integration tests
- Single test per application bootstrap in each service

**Naming (JavaScript):**
- Convention not established (no tests present)
- Standard would be `*.test.js` or `*.spec.js` suffix

**Structure (Java):**
```
src/test/java/com/example/user_service/
├── UserServiceApplicationTests.java    # Bootstrap/smoke test
```

## Test Structure

**Spring Boot Integration Test Pattern:**
```java
package com.example.user_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class UserServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
```

**Test Organization:**
- Single `@Test` method per test class in current codebase
- No separate test classes per feature or layer
- No test fixtures or parameterized tests observed

**Setup/Teardown:**
- Not implemented in current tests
- Standard Spring Boot approach would use `@BeforeEach` and `@AfterEach` if needed

**Assertion Pattern:**
```java
// Current pattern: context loads, no specific assertions
@SpringBootTest
void contextLoads() {
}

// Common assertion patterns available:
// Assertions.assertEquals(expected, actual);
// Assertions.assertTrue(condition);
// Assertions.assertThrows(Exception.class, () -> { /* code */ });
```

## Mocking

**Framework (Java):**
- Mockito available via `spring-boot-starter-test` transitive dependency
- Not explicitly configured in pom.xml but included automatically

**Framework (JavaScript):**
- Not configured

**Patterns (Java):**
- No mocking detected in current test code
- Service layer tests would need mocking of:
  - `UserRepository` (or service's injected repositories)
  - `EventClient` and `UserClient` (Feign clients in appointment-service)
  - `UserClient` (in event-service)

**Recommended Mocking Pattern:**
```java
@SpringBootTest
class AppointmentServiceTests {
    @MockBean
    private AppointmentRepo repo;

    @MockBean
    private EventClient eventClient;

    @MockBean
    private UserClient userClient;

    @Autowired
    private AppointmentService service;

    @Test
    void testCreateAppointment() {
        // Setup mocks
        when(userClient.getById(1L))
            .thenReturn(new UserResponse());

        // Test logic
        // Assert results
    }
}
```

**What to Mock:**
- External service clients (Feign clients: `EventClient`, `UserClient`)
- Repository/database operations (for unit tests of services)
- Remote API responses when testing inter-service communication

**What NOT to Mock:**
- Spring Framework components (let Spring manage beans)
- Service layer business logic when testing integration
- Exception classes (test actual exception throwing)

## Fixtures and Factories

**Test Data:**
- Not implemented in current codebase
- Would typically create builder or factory for DTOs:

```java
// Recommended pattern
public class UserResponseTestFixture {
    public static UserResponse createUser() {
        UserResponse dto = new UserResponse();
        dto.setId(1L);
        dto.setName("Test User");
        dto.setEmail("test@example.com");
        return dto;
    }
}
```

**Location:**
- `src/test/java/com/example/service-name/fixture/` or `src/test/java/com/example/service-name/builder/`
- Factory classes would be utility classes in test source tree

## Coverage

**Requirements:**
- Not configured; no coverage plugin in pom.xml
- No explicit target percentage set

**View Coverage (if JaCoCo added):**
```bash
mvn jacoco:report                  # Generate coverage report
# Report location: target/site/jacoco/index.html
```

**Coverage Gaps (Current):**
- All service layer: untested
  - UserService: create(), getById()
  - AppointmentService: create(), getAppointments(), cancel()
  - EventService: (not examined but likely untested)
- All controller endpoints: untested
- Exception handling paths: untested
- Client/Feign communication: untested
- DTOs and Entities: no validation tests
- Repository queries: untested (rely on Spring Data convention)

## Test Types

**Unit Tests:**
- Scope: Individual service methods or utility functions
- Approach: Mock dependencies, test business logic in isolation
- Current implementation: Not present
- Would test: Service methods with mocked repositories and clients

**Integration Tests:**
- Scope: Service + repository, or service + external client communication
- Approach: `@SpringBootTest` with mocked external clients (Feign)
- Current implementation: Only bootstrap smoke tests (`contextLoads()`)
- Would verify: Spring context loads, beans wired correctly, transactions

**E2E Tests:**
- Framework: Not used
- Would require: TestContainers or Docker Compose for database, mock external services
- Current approach: Manual testing only (no automated E2E)

## Common Patterns

**Async Testing (Java):**
```java
// Pattern with reactor-test (in api-gateway)
@Test
void testAsyncOperation() {
    Mono<UserResponse> result = userService.createUserAsync(request);

    StepVerifier.create(result)
        .expectNextMatches(user -> user.getId() == 1L)
        .verifyComplete();
}
```

**Error Testing:**
```java
@Test
void testUserNotFound() {
    Assertions.assertThrows(UserNotFoundException.class, () -> {
        userService.getById(999L);
    });
}
```

**Transactional Testing:**
```java
@SpringBootTest
@Transactional
class TransactionalServiceTests {
    @Test
    void testComplexTransaction() {
        // Test rollback behavior
        // Test constraint violations
    }
}
```

## Database Testing

**Approach (Java Services):**
- `spring-boot-starter-data-jpa` provides test annotations
- `@DataJpaTest` for repository-only tests
- `spring-boot-starter-test` includes H2 in-memory database for testing

**Repository Testing Pattern:**
```java
@DataJpaTest
class UserRepositoryTests {
    @Autowired
    private UserRepository repo;

    @Test
    void testFindByEmail() {
        User user = new User();
        user.setEmail("test@example.com");
        repo.save(user);

        Optional<User> found = repo.findByEmail("test@example.com");
        assertTrue(found.isPresent());
    }
}
```

## Current Test Coverage Summary

**What's Tested:**
- Application bootstrap only (Spring context loads)

**What's NOT Tested (Priority Gaps):**
1. **High Priority:**
   - Service layer business logic (all services)
   - Exception paths and error handling
   - Inter-service communication (Feign clients)
   - Complex transactional scenarios (appointment creation with event locking)

2. **Medium Priority:**
   - Repository/database queries
   - DTO validation
   - Controller endpoint mappings and status codes

3. **Low Priority (Data Classes):**
   - Entity getters/setters
   - Enum values

## Frontend Testing

**JavaScript/React:**
- No test framework configured
- No test files present
- Would require: Jest, Vitest, or React Testing Library

**Recommended Setup:**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event
```

**Test Coverage Needed:**
- `src/pages/UsersPage.jsx` - User creation, selection, error handling
- `src/pages/EventsPage.jsx` - Event creation, listing, booking
- `src/pages/AppointmentsPage.jsx` - Appointment listing and cancellation
- `src/components/Navbar.jsx` - Navigation and user display
- `src/api.js` - API client functions, error parsing

## Recommended Testing Improvements

1. **Setup coverage measurement:**
   - Add JaCoCo Maven plugin for Java services
   - Set minimum coverage threshold (e.g., 60%)

2. **Add service layer tests:**
   - Mock repositories and Feign clients
   - Test business logic and exception scenarios

3. **Add controller tests:**
   - `@WebMvcTest` for endpoint testing
   - Verify request validation and response format

4. **Add integration tests:**
   - Test Feign client communication with mock servers
   - Test transaction rollback behavior

5. **Add frontend tests:**
   - Component unit tests
   - API client tests
   - User interaction tests

---

*Testing analysis: 2026-02-01*
