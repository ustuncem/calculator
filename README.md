# Calculator API

A Go API that evaluates decimal expressions using addition, subtraction, multiplication, and division.

## Setup

From the repository root, build and start the API with Docker.

```sh
docker build -t calculator-api:local backend
docker run --detach --rm --name calculator-api -p 127.0.0.1:8080:8080 calculator-api:local
```

Stop the container with `docker stop calculator-api`.

To run directly with Go 1.27.4, use these commands from the repository root.

```sh
cd backend
go run ./internal/calculator
```

The API defaults to port `8080`. Set `PORT` to configure the server's listening port.

## API usage

With the API running at `http://127.0.0.1:8080`, use `GET /health` to check availability, `/docs` to browse the API, and `/openapi.json` to retrieve the OpenAPI definition.

Send an expression to `POST /api/v1/calculate`.

```sh
curl --fail --silent --show-error http://127.0.0.1:8080/api/v1/calculate \
  -H 'Content-Type: application/json' \
  --data '{"expression":"0.1 + 0.2"}'
```

```json
{"result":"0.3","rounded":false}
```

Results are decimal strings. Repeating decimals round to 15 fractional places and return `"rounded":true`. Invalid expressions return HTTP 422 with a stable error `code` and a UTF-16 span when the error points to part of the expression. JSON bodies over 4,096 bytes return HTTP 413. For grammar, limits, and error examples, see the [business rules](specs/business_rules.md).

To try the API in Postman, import the collection and set `baseUrl` if the service uses a different URL. [Calculator API collection](postman/calculator.postman_collection.json)

## Tests

Run the same verification locally and in GitHub Actions from the repository root.

```sh
docker compose up --build --exit-code-from verify
docker compose down
```

The Docker build runs the Go tests. Compose starts the resulting image on its own network, exports `/openapi.json`, regenerates the Postman requests, and runs the existing Postman assertions against that container. A failed build or assertion fails the command. GitHub Actions attaches the OpenAPI spec and generated requests as the `postman-contract` artifact on successful runs.

Run the expression domain tests with the race detector and statement coverage, then fuzz the evaluator. Start from the repository root.

```sh
cd backend
go test -race -count=1 -coverprofile=/tmp/calculator-domain-coverage.out ./internal/calculator/domain/expression
go tool cover -func=/tmp/calculator-domain-coverage.out
go test -run '^$' -fuzz '^FuzzEvaluate$' -fuzztime 10s -parallel 4 ./internal/calculator/domain/expression
```

To run the Postman collection against the running API from the repository root, use the Postman CLI.

```sh
postman collection run postman/calculator.postman_collection.json --no-report-events
```

## Deployment

The `Calculator CI` workflow runs on pull requests and pushes to `main`. After a successful run on `main`, the workflow advances the `production` branch to the tested commit. Railway follows `production`, builds from `/backend`, and checks `/health` before routing traffic to the new release. The `production` branch is for CI promotion. GitHub Actions can send failed-run notifications by email or on GitHub, and Railway can send deployment failure notifications.

Use the same Postman collection with `baseUrl` set for local development or CI. If you add a production Postman environment, point it at the Railway URL and use it for smoke checks such as `GET /health`. The full regression suite runs against the isolated Compose service.
