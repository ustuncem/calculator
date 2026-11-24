# Calculator project definition

The Sezzle assignment asks for a React calculator whose backend performs the arithmetic. A user enters an expression, reviews it, and presses equals. The API returns a decimal result or an error that identifies what the user can correct. For example, `2 + 3 * 4` returns `14`, and `8 / (3 - 3)` identifies the division that failed.

This phase defines the API and the behavior the existing Figma design can rely on. The assignment gives the full stack a 2–4 hour budget. Complete the essential release before spending that budget on optional operations.

## Stack and responsibilities

- **Shared HTTP server.** Chi routes requests and Huma generates OpenAPI. The common server owns JSON handling, body-limit enforcement, health, documentation, and the Problem Details format.
- **Calculator HTTP port.** The port defines the calculate request and response, configures its body size limit, calls the calculation use case, and translates calculator errors into HTTP responses.
- **Calculation use case.** The application layer accepts an expression and returns a canonical result or a calculator error without relying on HTTP.
- **Expression domain.** A decimal-only lexer and parser own the grammar, limits, and precedence. Evaluation uses Go’s `math/big.Rat` for exact arithmetic. The domain is independent of HTTP and application code.
- **React and TypeScript.** The client assembles expressions, sends them to the API, displays the returned string, and marks rounded results. Keypad symbols such as × and ÷ map to the API spellings `*` and `/`.
- **Tests.** Use Go domain tests for arithmetic, grammar, expression limits and fuzz invariants. Use the Postman collection to exercise the API contract against local and deployed environments.
- **Hosting.** Package the Go API with a checked-in Dockerfile and use it for both local container runs and deployment as one stateless service on Railway. Startup configuration, timeouts, logging and shutdown belong in the server. Calculation requires neither persistence nor calls to another service. Measure throughput and latency on a stated workload before making capacity claims.

## Public interface

One business endpoint evaluates an expression. Health and API documentation routes serve operational purposes.

```http
POST /api/v1/calculate
Content-Type: application/json

{"expression":"0.1 + 0.2"}
```

```json
{"result":"0.3","rounded":false}
```

The string preserves the decimal representation across JSON and JavaScript. The client can localize its display while retaining the canonical value. The rounding flag describes this evaluation.

## Maintaining the specs

[Features](features.md) owns delivery scope. [Business rules](business_rules.md) owns observable behavior, errors and boundary examples. When a decision changes, update the owning document and its acceptance examples together. Values marked **proposed** are open for revision. These files describe intended behavior.
