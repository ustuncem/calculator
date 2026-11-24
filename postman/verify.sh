#!/bin/sh
set -eu

: "${API_URL:?Set API_URL to the test API origin}"

git init --quiet
mkdir -p postman/specs
spec=postman/specs/calculator.openapi.json
curl --fail --silent --show-error --retry 20 --retry-connrefused \
  --retry-delay 1 --retry-max-time 30 --max-time 5 \
  --output "$spec" "$API_URL/openapi.json"

# Rebuild the generated requests from the API that this run will test.
postman spec generate collection "$spec" --name "Calculator API Contract" --force
postman collection run /suite/calculator.postman_collection.json \
  --env-var "baseUrl=$API_URL" --timeout-request 5000 --no-report-events
