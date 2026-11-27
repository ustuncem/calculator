# 🧮 Calculator

An animated calculator with a React frontend and a Go backend. Type or tap an expression, press equals, and keep calculating from the result.

[![Calculator CI](https://github.com/ustuncem/calculator/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ustuncem/calculator/actions/workflows/ci.yml)

[Try the calculator](https://calculator-web-production-710b13d9.up.railway.app/) · [Browse the API docs](https://calculator-api-production-537c84c7.up.railway.app/docs) · [View the GitHub repository](https://github.com/ustuncem/calculator)

## ✨ What it can do

- Add, subtract, multiply, and divide with standard operator precedence. Use parentheses to group terms, as in `(2 + 3) * 4`.
- Use postfix percentages on numbers or groups. `10%` is `0.1`, so `200 + 10%` gives `200.1`. To increase 200 by 10%, enter `200 * (1 + 10%)`.
- Enter and edit expressions with the keyboard or the animated keypad. The layout adapts to phones and desktops, with light and dark themes.
- Recall your last result, continue a calculation, and see when a result was rounded.

## 🚀 Quick start

Docker with Compose is all you need for the containerized setup. Compose provides Node.js and Go, and this setup was tested on a MacBook. On macOS, install and start a current release of [Docker Desktop](https://docs.docker.com/desktop/setup/install/mac-install/).

```sh
git clone https://github.com/ustuncem/calculator.git
cd calculator
docker compose up
```

Once both services are running, open [localhost:3000](http://localhost:3000) for the calculator or [localhost:8080/docs](http://localhost:8080/docs) for the API docs. Vite reloads frontend changes and Air rebuilds the Go API when you edit it. Press Ctrl+C to stop the stack.

### Run the services directly

Use **Node.js 24** with npm and **Go 1.27.4**, matching the versions used in Docker and CI. Start the backend from the repository root in one terminal.

```sh
cd backend
go run ./internal/calculator
```

From the repository root in a second terminal, start the frontend on port 3000.

```sh
cd frontend
npm ci
npm run dev -- --host 127.0.0.1 --port 3000 --strictPort
```

Vite forwards API requests to the Go server on port 8080. Open the calculator at [localhost:3000](http://localhost:3000).

## 🏗️ How it works

The frontend uses **Vite, React, and TypeScript**, with Tailwind CSS for styling and Motion for animations. The backend uses **Go**, with Chi for routing and Huma for OpenAPI. Its domain-driven design keeps the expression rules separate from the application use case and HTTP layer. The structure is inspired by [Three Dots Labs’ Wild Workouts](https://github.com/ThreeDotsLabs/wild-workouts-go-ddd-example).

One option was an endpoint for each arithmetic operation. That would leave the client coordinating intermediate results and deciding which operation to run first. The calculator sends the whole expression to a single endpoint. A lexer reads the tokens, a parser checks the grammar and precedence, and an evaluator performs exact arithmetic with Go’s `math/big.Rat`.

With the arithmetic rules in one place, the frontend can focus on editing, animation, and showing where an expression went wrong. It can even continue a rounded result using the original expression. If you calculate `1 / 3` and then press `* 3`, the client sends `(1 / 3) * 3` and gets exactly `1`.

For the project scope, input limits, and design notes, see the [feature set](specs/features.md), [calculator rules](specs/business_rules.md), and [AI prompt excerpts](specs/ai-prompts.md).

## 🔌 Use the API

Send a JSON object with an `expression` string to `POST /api/v1/calculate`.

```sh
curl -fsS http://localhost:8080/api/v1/calculate \
  -H 'Content-Type: application/json' \
  --data '{"expression":"0.1 + 0.2"}'
```

```json
{ "result": "0.3", "rounded": false }
```

Try a compound expression with grouping and a percentage. This returns `"210"`.

```sh
curl -fsS http://localhost:8080/api/v1/calculate \
  -H 'Content-Type: application/json' \
  --data '{"expression":"200 * (1 + 10%) - 20 / 2"}'
```

Results are decimal strings. For repeating decimals, the API rounds to 15 fractional places and sets `rounded` to `true`.

For more examples, import the [Calculator API Postman collection](postman/calculator.postman_collection.json) and select the [Local environment](postman/local.postman_environment.json) or [Production environment](postman/production.postman_environment.json). The collection includes successful requests, errors, and input boundaries. The API also serves [interactive docs](http://localhost:8080/docs) and an [OpenAPI definition](http://localhost:8080/openapi.json).

## 🧪 Run the tests

From the repository root, run the native Go tests and the Vitest suite. Install the frontend dependencies with `npm ci` in `frontend/` first.

```sh
(cd backend && go test ./...)
npm --prefix frontend test
```

For Playwright, install Google Chrome and keep the full stack running on port 3000.

```sh
npm --prefix frontend run test:browser
```

Run the Go and Postman contract checks in Docker, using a separate Compose project.

```sh
docker compose -p calculator-check up --build --exit-code-from verify verify
docker compose -p calculator-check --profile verify down
```

<details>
<summary>Coverage and CI checks</summary>

On November 27, 2026, Go tests covered **90.7%** of backend statements and **100%** of expression-domain statements. The 46 Vitest tests covered **64.53%** of frontend statements. Seven Playwright tests and 66 Postman assertions run separately from statement coverage.

Generate HTML coverage reports from the repository root.

```sh
mkdir -p coverage/backend
(cd backend && go test -race -count=1 -coverpkg=./... -coverprofile=../coverage/backend/coverage.out ./...)
(cd backend && go tool cover -func=../coverage/backend/coverage.out > ../coverage/backend/summary.txt)
(cd backend && go tool cover -html=../coverage/backend/coverage.out -o ../coverage/backend/index.html)
npm --prefix frontend run test:coverage
```

Open `coverage/backend/index.html` and `coverage/frontend/index.html` to browse the reports.

To fuzz the Go evaluator for 10 seconds, run the following from the repository root.

```sh
(cd backend && go test -run '^$' -fuzz '^FuzzEvaluate$' -fuzztime 10s -parallel 4 ./internal/calculator/domain/expression)
```

To run Playwright against the production images the way CI does, use a separate Compose project.

```sh
docker compose -p calculator-check up --build -d web-ci
sh frontend/smoke-test.sh http://127.0.0.1:8181
CALCULATOR_URL=http://127.0.0.1:8181 npm --prefix frontend run test:browser
docker compose -p calculator-check --profile verify down
```

The frontend image build runs lint, format checks, Vitest, and the TypeScript and Vite build. The contract job runs the checked-in assertions and publishes the OpenAPI spec and generated Postman requests in the `postman-contract` GitHub Actions artifact.

</details>

## ☁️ Deployment

GitHub Actions automatically deploys changes to the frontend or backend on a push to `main` after the relevant checks pass. Railway builds each service from its own Dockerfile. The web service is checked at `/` and the API at `/health`. See the [CI workflow](.github/workflows/ci.yml) and [Railway deploy workflow](.github/workflows/deploy.yml).

- **Web** · [Open the production calculator](https://calculator-web-production-710b13d9.up.railway.app/)
- **API** · Use `https://calculator-api-production-537c84c7.up.railway.app` as the base URL. [API docs](https://calculator-api-production-537c84c7.up.railway.app/docs) · [Health check](https://calculator-api-production-537c84c7.up.railway.app/health)
