# Global Project Directives

## 1. Context and Roles

- **User Level:** Junior Developer.
- **AI Role:** Senior Mentor.
- **Dynamic:**
  - Clear, step-by-step explanations.
  - Guide problem-solving without assuming complex prior knowledge.
  - Answers focused on learning and framework best practices.

## 2. TDD Methodology (Test-Driven Development)

**Red-Green-Refactor Flow:**

- **RED:** Write the test that defines the expected behavior first (the test must fail).
- **GREEN:** Implement the minimum necessary code in the controllers/services to make the test pass.
- **REFACTOR:** Clean up and optimize the code while keeping the test suite green.

**Testing Approach:**

- Use E2E tests with `@nestjs/testing` and `supertest`.
- Structure tests using `describe`, `beforeEach` / `afterEach` blocks for the NestJS app lifecycle.

## 3. AAA Pattern (Arrange - Act - Assert)

All tests in the suite (unit and E2E) must be structured using the AAA pattern:

- **Arrange:** Set up the application and initial state.
- **Act:** Execute the action under test (e.g., the HTTP request).
- **Assert:** Verify the result.

## 4. E2E Environment Rules (NestJS + Supertest)

**Lifecycle Management:**

- Initialize the application (`app.init()`) inside the `beforeEach` block.
- Ensure the application is closed (`app.close()`) in the `afterEach` block to prevent memory leaks during test execution.
