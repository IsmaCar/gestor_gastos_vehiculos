# Software Design Document (SDD): Vehicle Management

## 1. System Overview

This document specifies the business requirements and acceptance criteria for the **Vehicle Management** module.

It serves as the single source of truth for generating **Test-Driven Development (TDD) RED phase skeletons** in:

- `test/vehicles/vehicles.e2e-spec.ts` (end-to-end, HTTP contract)
- `src/vehicles/vehicles.service.spec.ts` (unit, business logic)

## 2. Domain Data Model Reference

Reference: See `prisma/schema.prisma` for exact database model structure.

- Primary entity: `Vehicle` (`id`, `userId`, `licenPlate`, `brand`, `model`, `kmAct`, `type`, `active`).
- Enum: `VehicleType` (`coche`, `moto`, `furgoneta`).
- Ownership: every `Vehicle` belongs to exactly one `User` through `userId`, resolved from the authenticated request (JWT), never trusted from the request body.
- Lifecycle: `Vehicle.active` (`Boolean`, default `true`) tracks deregistration. Vehicles are never hard-deleted, to preserve historical `Expense` records. Uniqueness of `licenPlate` is enforced only among active vehicles via a partial unique index.

## 3. BDD Test Scenarios (Acceptance Criteria)

### Scenario 1: Successful Vehicle Creation

- **Given** an authenticated user and a valid vehicle payload (`brand`, `model`, `kmAct`, `type` within the `VehicleType` enum).
- **When** sending a registration request to `POST /api/vehicles`.
- **Then** the creation must succeed with `201 Created`, the response must contain the created vehicle, and its `userId` must match the authenticated user, not any value supplied in the request body.

### Scenario 2: Vehicle Type Enum Validation

- **Given** an authenticated user and a vehicle payload where `type` is not one of `coche`, `moto`, `furgoneta`.
- **When** sending a request to `POST /api/vehicles`.
- **Then** the API must reject the request with `400 Bad Request` and specify the invalid `type` constraint.

### Scenario 3: Odometer (`kmAct`) Cannot Be Decreased

This scenario is covered at two levels, since the rule depends on comparing the incoming value against the value already persisted (not a static DTO constraint):

#### Scenario 3.1: Unit — `VehiclesService` rejects a lower `kmAct`

- **Given** a vehicle persisted with a known `kmAct` value (Prisma mocked).
- **When** calling `VehiclesService.update()` with a `kmAct` lower than the currently stored value.
- **Then** the service must throw a `BadRequestException` before attempting to persist any change.

#### Scenario 3.2: E2E — `PATCH /api/vehicles/:id` rejects a lower `kmAct`

- **Given** an authenticated user who owns an existing vehicle with a known `kmAct` value.
- **When** sending a request to `PATCH /api/vehicles/:id` with a `kmAct` lower than the currently stored value.
- **Then** the API must respond with `400 Bad Request` and the stored `kmAct` must remain unchanged.

### Scenario 4: A Vehicle Cannot Belong to More Than One User (Deregistration Required)

**Design decision:** a vehicle is never hard-deleted (`DELETE`), since that would break the historical `Expense` records tied to it via `vehicleId`. Deregistration is a **soft delete**: the `Vehicle.active` boolean field (`@default(true)`) is flipped to `false`.

Uniqueness of `licenPlate` is enforced at the database level with a **partial unique index** — `UNIQUE (licenPlate) WHERE active = true` — rather than a plain `@unique` column. This allows:

- Only one **active** vehicle to exist per `licenPlate` at any time.
- A `licenPlate` to be reused by a new owner once the previous vehicle has been deregistered (`active = false`).
- Multiple **inactive** vehicles to share the same `licenPlate` (e.g. a car resold and deregistered more than once over its lifetime).
- `NULL` plates to never conflict with one another (Postgres does not treat `NULL = NULL` as a match in unique constraints).

#### Scenario 4.1: E2E — Blocking Duplicate Active Registration

- **Given** a vehicle already registered and owned by `User A` with `licenPlate = "1234ABC"` and `active = true`.
- **When** `User B` attempts to register a new vehicle via `POST /api/vehicles` using the same `licenPlate`, without `User A` having deregistered it first.
- **Then** the API must block the operation with `409 Conflict`.

#### Scenario 4.2: E2E — Deregistering a Vehicle (Soft Delete)

- **Given** an authenticated user who owns an active vehicle.
- **When** sending a request to `DELETE /api/vehicles/:id`.
- **Then** the API must respond with `200 OK` (or `204 No Content`), the vehicle's `active` field must become `false` internally (soft delete, not a physical row removal), and its historical `Expense` records must remain untouched and queryable.

#### Scenario 4.3: E2E — Reusing a Plate After Deregistration

- **Given** a vehicle owned by `User A` with `licenPlate = "1234ABC"` that has since been deregistered (`active = false`).
- **When** `User B` registers a new vehicle via `POST /api/vehicles` using the same `licenPlate`.
- **Then** the API must accept the registration with `201 Created`, since no other **active** vehicle currently holds that plate.

### Scenario 5: Listing Own Vehicles

- **Given** two authenticated users, each owning at least one vehicle.
- **When** a user sends a request to `GET /api/vehicles`.
- **Then** the API must respond with `200 OK` and a list containing only the vehicles owned by that authenticated user, never vehicles belonging to other users.

### Scenario 6: Fetching a Single Vehicle Scoped to Its Owner

- **Given** an authenticated user who owns a vehicle, and a second user who does not own it.
- **When** the owner sends a request to `GET /api/vehicles/:id` for that vehicle.
- **Then** the API must respond with `200 OK` and the matching vehicle.
- **When** the non-owner sends a request to `GET /api/vehicles/:id` for the same vehicle id.
- **Then** the API must respond with `404 Not Found`, never exposing data belonging to another user.
