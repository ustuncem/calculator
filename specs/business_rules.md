# Calculator business rules

## Essential expression rules

| Rule | Examples and boundaries |
| --- | --- |
| Input syntax | Accept decimal digits, a decimal point, parentheses, unary signs, the four binary operators and postfix `%`. Spaces may separate tokens. `2 * (3 + 4)` is valid. `2(3 + 4)`, `1 2`, `1,5`, `1e3` and an empty expression are invalid. |
| Decimal entry | Accept `.5`, `5.` and `0`. A decimal point alone, or a second point in a number, is invalid. |
| Digits per literal | Accept up to 15 digits as typed, including leading and trailing zeros. The sign and decimal point do not count. `0.000001` uses seven digits. A sixteenth digit exceeds the limit. |
| Operand count | Allow 40 numeric literals per submitted expression. Each occurrence counts once, including repeated values. Signs, grouping and operators add no operands. `-12.5 + (3 * 4)` uses three. Reject the 41st literal and identify its span. |
| Precedence | Parentheses group first, followed by postfix percentage, unary signs, multiplication and division, then addition and subtraction. Equal-precedence binary operators associate left to right. `2 + 3 * 4 = 14` and `8 / 4 / 2 = 1`. |
| Unary signs | Permit one prefix sign per operand, including before a group. Accept `2 * -3`, `2 - -3` and `-(2 + 3)`. Reject `--3`. |
| Percentage | Place one `%` after a number or closed group to divide that value by 100. `10% = 0.1`, `200 + 10% = 200.1` and `200 * (1 + 10%) = 220`. Reject `%10`, `2 + %` and `10%%`. `%` adds no numeric literal to the operand count. |
| Nesting | Allow 32 simultaneously open parenthesized groups. Reject the opening parenthesis that would begin level 33. Separate groups at the same level do not accumulate depth. Optional function parentheses count once. |
| Full validation | Consume and validate the whole expression before evaluating arithmetic. `1 / 0 +` reports a missing operand at the end. `1 / 0 + 2` reports division by zero at the slash. Return one actionable error per request. |
| Division | Reject any divisor that evaluates to zero, including `-0` and `(3 - 3)`. A zero numerator is valid when the divisor is nonzero. |

## Results and continuation

- Evaluate the four operations with exact intermediate values. `(1 / 3) * 3` returns `{"result":"1","rounded":false}`.
- Preserve the value of every terminating result. Remove unnecessary fractional trailing zeros and normalize negative zero to `"0"`. `0.000000001 * 0.000000001` returns `"0.000000000000000001"` exactly.
- Round a nonterminating result to the nearest value at 15 fractional places, then remove unnecessary trailing zeros. `2 / 3` returns `{"result":"0.666666666666667","rounded":true}`. A nonzero result that rounds to zero also carries `rounded:true`.
- Format results with an absolute value of 10^15 or greater in scientific notation. Use one digit before the decimal point, followed by `E+` and the exponent. Preserve every significant digit of the resulting value. `999999999999999 + 1` returns `{"result":"1E+15","rounded":false}`. The 15-digit entry limit still applies to input literals.
- After equals, continuing with a binary operator or `%` groups and reuses the original expression. For instance, continuing `1 / 3` with `* 3` submits `(1 / 3) * 3`. Typing a new digit starts fresh. Apply all request limits to the continued expression. Keep the previous result visible if continuation exceeds a limit.
- The keypad treats a displayed scientific result as one value. Backspace deletes it as a unit when the caret touches the result.
- After equals, `±` evaluates the opposite sign of the original expression. Changing sign twice restores the original expression. A failed sign change keeps the previous result available for retry.
- The UI labels rounded results, including rounded zero, and restores that label when the user recalls the last result. It retains the returned decimal string and original expression so presentation cannot change arithmetic.

## Request limits and error contract

The product limits are digits, operands and nesting. There is no separate character-count rule. For a boundary test, join 40 copies of the 15-digit literal `100000000000000` with `+`. The resulting 639-character expression must succeed with `{"result":"4E+15","rounded":false}`.

**Proposed HTTP guard: 4 KiB (4,096 bytes) for the complete JSON request body.** This bounds how much input the server reads before JSON decoding and arithmetic parsing. It includes JSON syntax, whitespace and escape sequences. Two JSON encodings of an identical expression can therefore differ in byte size. Enforce the limit while reading even when the client omits Content-Length. An over-limit body receives HTTP 413 before the evaluator is called. Confirm the byte value against real client payloads before treating it as fixed.

Test valid JSON padded with whitespace to exactly 4,096 and 4,097 bytes. The first should reach evaluation and the second should receive 413. Independently test 40 versus 41 operands and 32 versus 33 groups using small bodies. This distinguishes a transport rejection from a calculator rule failure.

**Wire mapping.** Use Problem Details JSON. Each problem type has a stable `code` and a documented `type` URI of the form `/problems/{code}`, resolved against the API origin. The `title` gives a short, human-readable summary that stays the same for each type. Use `type` or `code` for programmatic handling. Expression errors include a zero-based start and exclusive end within the decoded expression. Use UTF-16 code units for compatibility with JavaScript string slicing. An end-of-input span has equal start and end. Body-level failures have no expression span.

| Condition | HTTP | Suggested code or location |
| --- | --- | --- |
| Unsupported request media type | 415 | `unsupported_media_type` |
| HTTP body exceeds the configured byte limit | 413 | `body_too_large` |
| Malformed JSON or trailing JSON value | 400 | `invalid_json` |
| Missing, null, non-string or blank expression | 422 | `invalid_expression_input` |
| Invalid token, missing operator or missing operand | 422 | A specific syntax code, e.g. `expected_operand`. For `2 +`, the span is [3, 3). |
| Literal, operand count or grouping exceeds its limit | 422 | `too_many_digits`, `too_many_operands` or `nesting_limit_exceeded` |
| Divisor evaluates to zero | 422 | `division_by_zero`. For `8 / (3 - 3)`, the slash occupies [2, 3). |
| Unexpected internal failure | 500 | `internal_error` |

## Optional operations

- **Power.** Accept integer exponents. Exponentiation associates right to left and binds more tightly than a leading minus. `2^3^2 = 512`, `-2^2 = -4`, `(-2)^2 = 4` and `2^-3 = 0.125`. Reject fractional exponents and `0^0` as domain errors. `0^-1` is division by zero. Before enabling powers, choose and test budgets for exponent magnitude and intermediate result size. Enforce them before computing a large power.
- **Square root.** Accept real, nonnegative arguments. `sqrt(0.25)` returns `"0.5"` exactly. `sqrt(2)` returns `"1.414213562373095"` with `rounded:true`. Reject `sqrt(-1)` with a domain error pointing to the function name. Before enabling roots inside compound expressions, specify how precision and approximation propagate through intermediate irrational values.

## Research context

One reviewed Go calculator sets a depth budget of 32 covering groups, prefix operators and power chains. Our essential rule counts open groups. The same project sets a 4 KiB HTTP cap, while another uses 8 KiB. These are comparisons, not service capacity measurements. [Depth budget](https://github.com/gabrielcoffee/sezzlecalc/blob/main/backend/internal/calc/expr.go), [4 KiB body cap](https://github.com/gabrielcoffee/sezzlecalc/blob/main/backend/internal/api/server.go), [8 KiB body cap](https://github.com/JLLoaiza/sezzle-calculator/blob/main/backend/internal/handler/calculator.go).
