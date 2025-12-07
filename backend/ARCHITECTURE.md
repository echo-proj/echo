# Architecture & Programming Guidelines

## Project Structure

The codebase is organized by **bounded contexts**. Each context represents a distinct domain area.

```
src/main/java/com/echoproject/echo/
├── user/
│   ├── controller/     # HTTP request handling
│   ├── service/        # Orchestration layer (shell)
│   ├── repository/     # Data access
│   └── domain/         # Pure business logic
├── security/
│   ├── controller/
│   ├── service/
│   └── domain/
└── ...
```

## Design Principles

### Functional Core, Imperative Shell

We follow the **Functional Core, Imperative Shell** pattern:

**Controller (Entry Point)**
- Accept and parse HTTP requests
- **Validate input using Bean Validation annotations** (`@Valid`, `@NotBlank`, etc.)
- Call service layer
- Return HTTP responses
- **Owns all request-level validation** - domain should NOT re-validate request inputs

**Service (Imperative Shell)**
- Orchestrate the workflow
- Fetch data using repositories
- Call pure domain functions for business logic
- Handle side effects (database writes, external calls)
- Return results to controller

**Domain (Functional Core)**
- Pure, immutable functions
- Contains **business logic only** (not input validation)
- No side effects, no dependencies
- Takes input → produces output
- Easy to reason about and test
- **Does NOT validate request inputs** - controller already did that

### Example Flow

```
Request → Controller → Service → Domain Function
                ↓           ↓
            Response    Repository
```

1. Controller receives request
2. Service orchestrates: fetches data from repository
3. Service calls domain function with that data
4. Domain function returns result (pure logic)
5. Service persists changes if needed
6. Controller returns response

## Testing Strategy

### Unit Tests
- **Only test domain entry points** (public API used by services)
- Cover all use cases and edge cases
- Do NOT test internal domain functions (they are implementation details)
- Aim for 100% coverage of domain logic

### Integration Tests
- **One happy path test per service**
- Tests the full flow: controller → service → repository → database
- Ensures everything works together

### What NOT to Test
- Internal/private domain functions
- Repository methods (trust Spring Data JPA)
- Framework code

## Code Guidelines

### Immutability
- Domain objects should be immutable
- Use `final` fields, no setters in domain classes
- Create new objects instead of modifying existing ones

### Pure Functions
- Domain functions should have no side effects
- Same input always produces same output
- No database calls, no external API calls

### Naming Conventions
- Controllers: `*Controller`
- Services: `*Service`
- Domain functions: Clear, descriptive names (e.g., `validateUser`, `calculateTotal`)
- Repositories: `*Repository`

### Validation Strategy
- **Controller validates request inputs** using `@Valid` and Bean Validation annotations
- **Domain validates business rules** (e.g., "user cannot have more than 5 active sessions")
- Don't duplicate validation - if it's a simple format check, controller handles it
- Domain only validates things that require business logic or data

### Package Organization
- Keep related code together within bounded contexts
- Shared utilities can live in a `common/` package
- DTOs live within their bounded context (e.g., `user/dto/`)

---

#### Keep it simple. Keep it clean. Keep logic in the domain.
