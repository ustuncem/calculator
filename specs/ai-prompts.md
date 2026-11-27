# AI-assisted development

These examples come from the calculator project chats. Some are shortened or lightly edited for reuse.

### Use `/grill-me` before writing the spec

> Before drafting the calculator spec, use `/grill-me`. Help me decide which rules are essential and which can wait. Start with operator precedence, division by zero, and input limits.

The discussion turned those choices into explicit rules and a feature list. [Grill Me skill](../.agents/skills/grill-me/SKILL.md) · [Feature list](features.md)

### Define the product limits

> samsung allows up to 40 operands. we can do that. a character limit is not good because large numbers can be entered.

The expression grammar counts numeric operands. A separate HTTP body limit bounds the incoming JSON. The acceptance examples cover both rules. [Business rules](business_rules.md)

### Research Go architecture with Three Dots Labs’ Wild Workouts

> Compare our Go backend side by side with Wild Workouts. Show where shared HTTP setup lives in each project, then walk me through one calculation request from the handler to the domain and back. Apply the structure while keeping the existing calculation behavior and the Chi and Huma stack.

The comparison guided the refactor. Shared routing moved into `common/server`, while the calculator kept its endpoint and expression rules in its own module. [Wild Workouts server](https://github.com/ThreeDotsLabs/wild-workouts-go-ddd-example/blob/master/internal/common/server/http.go) · [Calculator server](../backend/internal/common/server/router.go) · [Calculator endpoint](../backend/internal/calculator/ports/http.go)

### Connect the frontend to the Go backend

> We need env files for production and development. development will look at the dev URL which is localhost and production will look at the url in railway.

The frontend sends calculation requests to its own origin. Vite and Caddy route them to the configured Go upstream. [Development configuration](../frontend/vite.config.ts) · [Production configuration](../frontend/Caddyfile)

### Bring design tokens into the frontend with Figma MCP

> Can you access this calculator design through Figma MCP? Use its primary and secondary palettes, gradients, and Inter typeface to set up the frontend theme. Check what Tailwind already provides for the browser reset.

Figma MCP supplied the design values for the CSS theme, and Tailwind Preflight handled the browser reset. [Figma design](https://www.figma.com/design/4if29UjismqgQUMhnnNuYC/Untitled?node-id=39-274) · [Theme stylesheet](../frontend/src/index.css)

### Keep the first implementation small with Ponytail

> Use the `ponytail` skill and reuse the existing UI components. Build the calculator display first and make it responsive to the available height. Check with me before starting the keypad.

This gave us a working display to review before building the keypad. [Ponytail skill](../.agents/skills/ponytail/SKILL.md) · [Calculator display](../frontend/src/calculator/components/CalculatorDisplay.tsx)

### Use SOLID to clarify responsibilities

> The display, input logic, and error feedback are too tightly coupled. We need to transform this to something more modular so tests are easy. Refactor with SOLID principles in mind and leave writing the tests for later.

The editor owns draft transitions, and the HTTP mutation submits expressions and retains the last successful calculation. [Draft transitions](../frontend/src/calculator/utils/calculatorInput.ts) · [Submission](../frontend/src/calculator/hooks/useCalculateMutation.ts)

### Apply DRY to a specific behavior

> The theme toggle already has a press animation. Package that behavior in a reusable button and use it for both the theme toggle and backspace.

Both controls use the same press animation through a shared button. [Animated button](../frontend/src/common/components/atoms/AnimatedButton.tsx)

### Test the core behavior

> Lock in the behavior we already verified manually. Write unit tests for the core calculator logic in React and Go, then generate coverage reports for both.

The unit tests cover expression editing in React and arithmetic evaluation in Go. [Input tests](../frontend/src/calculator/utils/__tests__/calculatorInput.test.ts) · [Evaluation tests](../backend/internal/calculator/domain/expression/evaluate_test.go)

### Verify CI with GitHub MCP

> Commit and push the Vitest changes, then check that CI passes.

GitHub MCP opened the workflow jobs and logs for the pushed commit. The logs confirmed that Vitest ran and the frontend smoke test passed. [GitHub Actions run](https://github.com/ustuncem/calculator/actions/runs/45932451221)

### Review v1 with Matt Pocock’s `codebase-design` skill

> Use `codebase-design` to review the React and Go codebases. Check the bugs before I approve v1. Is there anything missing? Check for React and Go code smells and DDD, SOLID, or DRY issues. List the findings before making fixes.

The review identified differences between keypad and keyboard interaction, and between the returned rounding flag and the displayed result. The browser suite exercises those paths through the frontend proxy. [Codebase Design skill](../.agents/skills/codebase-design/SKILL.md) · [Browser regressions](../frontend/e2e/calculator.pw.ts)

### Delegate confirmed review fixes to subagents

> Gather the v1 review findings and use subagents to fix the confirmed issues. Coordinate their work and keep percentage for a follow-up.

Three subagents handled calculation state, the browser editor, and the Go HTTP layer. The main agent integrated the changes and ran the release checks. [CI checks](../.github/workflows/ci.yml) · [Frontend checks](../.github/workflows/frontend.yml)
