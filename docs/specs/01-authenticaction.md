# Software Design Document (SDD): Authentication & User Management

## 1. System Overview

This document specifies the business requirements and acceptance criteria for the **User Authentication and Registration** module.

It serves as the single source of truth for generating **Test-Driven Development (TDD) RED phase skeletons** in `test/auth.e2e-spec.ts`.

## 2. Domain Data Model Reference

Reference: See `prisma/schema.prisma` for exact database model structure.

- Primary entity: `User` (`id`, `email`, `password`).

## 3. BDD Test Scenarios (Acceptance Criteria)

### Scenario 1: Successful Registration & Login Flow

- **Given** a new user payload with valid credentials meeting all validation criteria.
- **When** sending a registration request to `POST /api/auth/register` and subsequent login to `POST /api/auth/login`.
- **Then** the registration must succeed with `201 Created`, login must return `200 OK` with a valid JWT token, and response payloads MUST strip sensitive attributes (e.g., password).

### Scenario 2: Password Complexity Validations

#### Scenario 2.1: Password Under Minimum Length

- **Given** a user registration payload where password length is strictly under 8 characters.
- **When** sending a request to `POST /api/auth/register`.
- **Then** the API must reject the request with `400 Bad Request` and return a validation error regarding password length.

#### Scenario 2.2: Missing Uppercase Character

- **Given** a user registration payload where password lacks at least one uppercase letter.
- **When** sending a request to `POST /api/auth/register`.
- **Then** the API must reject the request with `400 Bad Request` and specify missing uppercase constraint.

#### Scenario 2.3: Missing Special Character

- **Given** a user registration payload where password lacks at least one special character.
- **When** sending a request to `POST /api/auth/register`.
- **Then** the API must reject the request with `400 Bad Request` and specify missing special character constraint.

### Scenario 3: Structural Input Validation

- **Given** a user registration payload containing a malformed email format (e.g., `invalid-email`).
- **When** sending a request to `POST /api/auth/register`.
- **Then** the API must respond with `400 Bad Request`.

### Scenario 4: Authentication & JWT Token

- **Given** valid credentials for an existing registered user.
- **When** sending a request to `POST /api/auth/login`.
- **Then** the API must respond with `200 OK` and include a non-empty `access_token` string in the body.

### Scenario 5: Edge Case - Duplicate Account Registration

- **Given** an existing registered user in the system with a specific email.
- **When** attempting to register a new user using the exact same email address.
- **Then** the API must block the operation with `409 Conflict` (or `400 Bad Request`) stating the user already exists.

### Scenario 6: Security - Rate Limiting

- **Given** a client reaching the authentication endpoints (`/api/auth/*`).
- **When** sending more than 5 requests within a 1-minute window.
- **Then** the 6th request must be throttled and respond with HTTP `429 Too Many Requests`.
