# Calculator

A Go API that evaluates decimal expressions using addition, subtraction, multiplication, and division.

## Setup

From the repository root, start the website and API with Docker Compose.

```sh
docker compose up --build
```

Open [the website](http://localhost:3000). The Postman checks run once against the API on the Compose network. Use `docker compose down` to stop the stack.

To run the API by itself and publish it on port 8080, use:

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

## Frontend

The [React starter](https://calculator-web-production-710b13d9.up.railway.app) uses TypeScript, Vite and Tailwind. Start the development server with Node 24 and npm.

```sh
cd frontend
npm ci
npm run dev
```

Run `npm run lint` and `npm run build` in the same directory to verify a production build.

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

In Postman, import the [Calculator API collection](postman/calculator.postman_collection.json) and both environments. Select [Calculator Local](postman/local.postman_environment.json) or [Calculator Production](postman/production.postman_environment.json) in the environment picker. Each request uses the selected environment’s `baseUrl`.

## Tests

Run the same verification locally and in GitHub Actions from the repository root.

```sh
docker compose up --build --exit-code-from verify verify
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
postman collection run postman/calculator.postman_collection.json -e postman/local.postman_environment.json --no-report-events
```

## Deployment

GitHub Actions selects builds by the files changed on a pull request or push to `main`.

| Changed paths | Build |
| --- | --- |
| `frontend/**` | Lint, type-check, build and smoke-test the React image |
| `backend/**` | Build the Go image and run the Postman contract tests |
| Both folders | Run both workflows independently |
| Only files outside those folders | Skip both builds |

After a successful push build on `main`, the matching workflow uploads that commit to Railway using the production `RAILWAY_TOKEN` project secret. Each service has its own deployment queue. A newer commit supersedes a pending deployment only when its service directory differs.

Railway builds `calculator-web` from `/frontend` and checks `/`. It builds `calculator-api` from `/backend` and checks `/health`. Each service watches its own directory for any Railway Git-triggered deployments.

To smoke-test production, run the collection’s `Health` request against Railway.

```sh
postman collection run postman/calculator.postman_collection.json -e postman/production.postman_environment.json -i Health --no-report-events
```
