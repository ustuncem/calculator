# Calculator

A React calculator with a Go backend that evaluates decimal expressions using exact rational arithmetic. [Live calculator](https://calculator-web-production-710b13d9.up.railway.app) · [Git repository](https://github.com/ustuncem/calculator) · [Design decisions](specs/business_rules.md) · [AI prompt excerpts](specs/ai-prompts.md)

## Setup

From the repository root, start the Vite frontend and Go API with Docker Compose.

```sh
docker-compose up
```

Open [the calculator](http://127.0.0.1:3000) or [the API docs](http://127.0.0.1:8080/docs). Both services load the current workspace source. Vite applies frontend edits live, and Air rebuilds the API when Go files change. Press Ctrl+C to stop the stack.

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

The frontend uses TypeScript, Vite and Tailwind. Start the development server with Node 24 and npm.

```sh
cd frontend
npm ci
npm run dev
```

Vite and Caddy forward `/api/*` and `/problems/*` to the same upstream. Vite uses `frontend/.env.development` for local development. The production image reads the Railway URL from `frontend/.env.production`. Compose overrides `API_URL` to reach its local Go container.

Run `npm run lint`, `npm run format:check`, and `npm run build` in the same directory to check the frontend.

Put frontend tests in a `__tests__` subfolder of the directory they cover. Run `npm test` to run the Vitest suite once or `npm run test:watch` to rerun it as you edit.

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

Results are decimal strings. Results with an absolute value of 10^15 or greater use scientific notation such as `"1E+15"`. Repeating decimals round to 15 fractional places and return `"rounded":true`. Invalid expressions return HTTP 422 with a stable error `code` and a UTF-16 span when the error points to part of the expression. JSON bodies over 4,096 bytes return HTTP 413. For grammar, limits, and error examples, see the [business rules](specs/business_rules.md).

In Postman, import the [Calculator API collection](postman/calculator.postman_collection.json) and both environments. Select [Calculator Local](postman/local.postman_environment.json) or [Calculator Production](postman/production.postman_environment.json) in the environment picker. Each request uses the selected environment’s `baseUrl`.

## Tests

Run the Postman contract suite from the repository root.

```sh
docker compose -p calculator-check up --build --exit-code-from verify verify
docker compose -p calculator-check --profile verify down
```

The Docker build runs the Go tests. Compose starts the resulting image on its own network, exports `/openapi.json`, regenerates the Postman requests, and runs the existing Postman assertions against that container. A failed build or assertion fails the command. GitHub Actions attaches the OpenAPI spec and generated requests as the `postman-contract` artifact on successful runs.

Run the browser regressions against the production images with Node 24, frontend dependencies and Google Chrome installed.

```sh
docker compose -p calculator-check up --build -d web-ci
sh frontend/smoke-test.sh http://127.0.0.1:8181
CALCULATOR_URL=http://127.0.0.1:8181 npm --prefix frontend run test:browser
docker compose -p calculator-check --profile verify down
```

The browser suite exercises desktop and emulated touch input, history, rounding, sign changes, and the published expression limits. Each limit example checks the editor and posts to the Go endpoint through the same frontend origin.

### V1 coverage

Measured on November 27, 2026. Go tests covered **90.5%** of backend statements and **100%** of expression-domain statements. The 45 Vitest tests covered **63.79%** of frontend statements. The six Chrome regressions and 66 Postman assertions run separately from statement coverage.

Generate both coverage reports from the repository root after installing the frontend dependencies.

```sh
mkdir -p coverage/backend
(cd backend && go test -race -count=1 -coverpkg=./... -coverprofile=../coverage/backend/coverage.out ./...)
(cd backend && go tool cover -func=../coverage/backend/coverage.out > ../coverage/backend/summary.txt)
(cd backend && go tool cover -html=../coverage/backend/coverage.out -o ../coverage/backend/index.html)
npm --prefix frontend run test:coverage
```

Open `coverage/backend/index.html` and `coverage/frontend/index.html` for line-by-line reports. The backend also writes `summary.txt`, and the frontend writes `coverage-summary.json`.

Run the evaluator fuzzer separately from the repository root.

```sh
(cd backend && go test -run '^$' -fuzz '^FuzzEvaluate$' -fuzztime 10s -parallel 4 ./internal/calculator/domain/expression)
```

To run the Postman collection against the running API from the repository root, use the Postman CLI.

```sh
postman collection run postman/calculator.postman_collection.json -e postman/local.postman_environment.json --no-report-events
```

## Deployment

GitHub Actions selects builds by the files changed on a pull request or push to `main`.

| Changed paths | Build |
| --- | --- |
| `frontend/**` | Build the production images, lint, format-check, type-check, run Vitest and exercise the frontend through Chrome |
| `backend/**` | Run Go and Postman verification plus the browser suite against the changed Go image |
| `postman/**` | Run Go and Postman verification |
| `compose.yaml` or `.github/workflows/**` | Run contract and browser verification |
| Documentation only | Skip builds |

After verification succeeds on a push to `main`, each changed service directory is eligible for deployment to Railway with the production `RAILWAY_TOKEN` project secret. Each service has its own deployment queue. A newer commit supersedes a pending deployment only when its service directory differs.

Railway builds `calculator-web` from `/frontend` and checks `/`. It builds `calculator-api` from `/backend` and checks `/health`. Each service watches its own directory for any Railway Git-triggered deployments.

To smoke-test production, run the collection’s `Health` request against Railway.

```sh
postman collection run postman/calculator.postman_collection.json -e postman/production.postman_environment.json -i Health --no-report-events
```
