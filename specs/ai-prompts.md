# AI-assisted development

These excerpts show how the project requirements, implementation, and release review were directed. Each quotation is an excerpt from a user prompt.

### Define the product limits

> samsung allows up to 40 operands. we can do that. a character limit is not good because large numbers can be entered.

The expression grammar counts numeric operands. A separate HTTP body limit bounds the incoming JSON. The acceptance examples cover both rules. [Business rules](business_rules.md)

### Connect the frontend to the Go backend

> We need env files for production and development. development will look at the dev URL which is localhost and production will look at the url in railway.

The frontend sends calculation requests to its own origin. Vite and Caddy route them to the configured Go upstream. [Development configuration](../frontend/vite.config.ts) · [Production configuration](../frontend/Caddyfile)

### Refine the frontend design

> We need to transform this to something more modular so tests are easy.

The editor owns draft transitions, and the HTTP mutation submits expressions and retains the last successful calculation. [Draft transitions](../frontend/src/calculator/utils/calculatorInput.ts) · [Submission](../frontend/src/calculator/hooks/useCalculateMutation.ts)

### Review the release

> Check the bugs before I approve v1. Is there anything missing?

The review identified differences between keypad and keyboard interaction, and between the returned rounding flag and the displayed result. The browser suite exercises those paths through the frontend proxy. [Browser regressions](../frontend/e2e/calculator.pw.ts)
