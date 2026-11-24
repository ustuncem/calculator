# Calculator project definition

The Sezzle assignment asks for a React calculator whose backend performs the arithmetic. A user enters an expression, reviews it, and presses equals. The API returns a decimal result or an error that identifies what the user can correct. For example, `2 + 3 * 4` returns `14`, and `8 / (3 - 3)` identifies the division that failed.

This phase defines the API and the behavior the existing Figma design can rely on. The assignment gives the full stack a 2–4 hour budget. Complete the essential release before spending that budget on optional operations.

## Stack and responsibilities

- **Go, Chi and Huma.** Chi routes requests. Huma describes the typed JSON contract and generates OpenAPI. The HTTP layer validates requests and translates calculator errors into HTTP responses.
- **Calculator package.** A small arithmetic parser owns the grammar, limits, precedence and evaluation. Keep it independent of HTTP and framework packages. Exact rational arithmetic, for example Go’s standard `math/big.Rat` behind a decimal-only lexer, is a proposed implementation for the four basic operations. The externally observable precision rules are binding.
- **React and TypeScript.** The client assembles expressions, sends them to the API, displays the returned string, and marks rounded results. Keypad symbols such as × and ÷ map to the API spellings `*` and `/`.
- **Tests.** Use Go table tests for arithmetic and grammar, `httptest` for the real router, fuzz tests for parser invariants, and an architecture check for package imports. A Postman collection should exercise the same contract against local and deployed environments.
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
