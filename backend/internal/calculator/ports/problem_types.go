package ports

import (
	"net/http"

	"calculator/backend/internal/common/server/httperr"
)

var invalidExpressionInput = invalidExpression("invalid_expression_input", "Invalid expression input", "Provide an expression as a nonblank JSON string.")

var calculationProblems = []httperr.Definition{
	invalidExpressionInput,
	invalidExpression("invalid_token", "Invalid token", "Use decimal digits and the supported arithmetic symbols."),
	invalidExpression("invalid_number", "Invalid number", "A decimal literal needs at least one digit and may contain one decimal point."),
	invalidExpression("expected_operand", "Expected an operand", "Enter a number or parenthesized expression."),
	invalidExpression("expected_operator", "Expected an operator", "Add an arithmetic operator between operands."),
	invalidExpression("expected_closing_parenthesis", "Expected a closing parenthesis", "Close the open group with a parenthesis."),
	invalidExpression("unexpected_closing_parenthesis", "Unexpected closing parenthesis", "Match each closing parenthesis with an open group."),
	invalidExpression("too_many_digits", "Too many digits", "The literal exceeds the limit on digits per number."),
	invalidExpression("too_many_operands", "Too many operands", "The expression exceeds the limit on numeric literals."),
	invalidExpression("nesting_limit_exceeded", "Nesting limit exceeded", "The expression exceeds the limit on simultaneously open groups."),
	invalidExpression("division_by_zero", "Division by zero", "The divisor evaluates to zero."),
}

func invalidExpression(code, title, detail string) httperr.Definition {
	return httperr.Definition{Code: code, Status: http.StatusUnprocessableEntity, Title: title, Detail: detail}
}

func problemTypes() []httperr.Definition {
	return append([]httperr.Definition{httperr.BodyTooLarge(maxBodyBytes)}, calculationProblems...)
}
