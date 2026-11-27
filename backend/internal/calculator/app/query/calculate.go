package query

import (
	"strings"

	"calculator/backend/internal/calculator/domain/expression"
	commonerrors "calculator/backend/internal/common/errors"
)

const InvalidExpressionInputCode = "invalid_expression_input"

var ErrBlankExpression = &commonerrors.CodedError{Code: InvalidExpressionInputCode, Detail: "expression is blank"}

func Calculate(input string) (expression.Result, error) {
	if strings.TrimSpace(input) == "" {
		return expression.Result{}, ErrBlankExpression
	}
	return expression.Evaluate(input)
}
