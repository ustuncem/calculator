# Calculator feature set

## Essential release

| Capability | Acceptance evidence |
| --- | --- |
| Evaluate a complete expression in one API call | Posting `-(2.5 + 1.5) / 2` returns `{"result":"-2","rounded":false}`. |
| Support all four required operations | The README or Postman collection demonstrates addition, subtraction, multiplication and division through the same endpoint. |
| Preserve decimal precision | `0.1 + 0.2` returns exactly `"0.3"`. The client can distinguish a repeating result from an exact result. |
| Explain a failed calculation | Invalid syntax and division by zero produce stable error codes and locations within the submitted expression. |
| Bound public input | Test numeric literals of 15 and 16 digits, expressions with 40 and 41 operands, and nesting at 32 and 33 levels. Test the HTTP body boundary independently. |
| Continue a calculation | After equals, an operator extends the prior expression with its grouping preserved. A digit starts a new calculation. The API remains stateless. |
| Verify the API and its architecture | Run arithmetic and parser unit tests, HTTP contract tests, parser fuzz seeds and a package dependency check. Generate a Go statement coverage report. Run the checked-in Postman examples against a running service. |
| Package and deploy the API | Build and run the checked-in API Dockerfile locally. Deploy from the same Dockerfile on Railway, listen on the supplied `PORT`, and verify a calculation through the public HTTPS URL. |
| Make the submission reviewable | Provide setup and run instructions, API examples, design assumptions, coverage, AI prompts, a Git repository link and a Railway demo URL. |

The assignment also requires a responsive React client and frontend unit tests. The API decisions here specify what that client can rely on.

## If time permits

| Capability | Scope |
| --- | --- |
| Percentage | Postfix percentage with one meaning throughout an expression. |
| Powers | Integer exponents, documented precedence and a bounded resource cost. |
| Square root | Real roots, exact where possible, with an explicit approximation signal. |
| Performance report | Record workload, concurrency, deployment resources, duration, throughput, latency percentiles and errors. |

The optional operators have design rules in [business rules](business_rules.md). Advertise each operator in the API documentation only when its behavior and bounds pass the acceptance tests.
