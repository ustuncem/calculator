package ports

import (
	"net/http"

	"calculator/backend/internal/calculator/app/query"
	"calculator/backend/internal/calculator/domain/expression"
	"calculator/backend/internal/common/server/httperr"
)

var invalidExpressionInput = invalidExpression(query.InvalidExpressionInputCode, "Invalid expression input", "Provide an expression as a nonblank JSON string.")

var calculationProblems = []httperr.Definition{
	invalidExpressionInput,
	invalidExpression(expression.InvalidToken.Code(), "Invalid token", "Use decimal digits and the supported arithmetic symbols."),
	invalidExpression(expression.InvalidNumber.Code(), "Invalid number", "A decimal literal needs at least one digit and may contain one decimal point."),
	invalidExpression(expression.ExpectedOperand.Code(), "Expected an operand", "Enter a number or parenthesized expression."),
	invalidExpression(expression.ExpectedOperator.Code(), "Expected an operator", "Add an arithmetic operator between operands."),
	invalidExpression(expression.ExpectedClosingParenthesis.Code(), "Expected a closing parenthesis", "Close the open group with a parenthesis."),
	invalidExpression(expression.UnexpectedClosingParenthesis.Code(), "Unexpected closing parenthesis", "Match each closing parenthesis with an open group."),
	invalidExpression(expression.TooManyDigits.Code(), "Too many digits", "The literal exceeds the limit on digits per number."),
	invalidExpression(expression.TooManyOperands.Code(), "Too many operands", "The expression exceeds the limit on numeric literals."),
	invalidExpression(expression.NestingLimitExceeded.Code(), "Nesting limit exceeded", "The expression exceeds the limit on simultaneously open groups."),
	invalidExpression(expression.DivisionByZero.Code(), "Division by zero", "The divisor evaluates to zero."),
}

func invalidExpression(code, title, detail string) httperr.Definition {
	return httperr.Definition{Code: code, Status: http.StatusUnprocessableEntity, Title: title, Detail: detail}
}

func problemTypes() []httperr.Definition {
	return append([]httperr.Definition{httperr.BodyTooLarge(maxBodyBytes)}, calculationProblems...)
}
