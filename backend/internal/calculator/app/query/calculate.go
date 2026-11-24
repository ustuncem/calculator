package query

import (
	"strings"

	"calculator/backend/internal/calculator/domain/expression"
	commonerrors "calculator/backend/internal/common/errors"
)

var ErrBlankExpression = &commonerrors.CodedError{Code: "invalid_expression_input", Detail: "expression is blank"}

func Calculate(input string) (expression.Result, error) {
	if strings.TrimSpace(input) == "" {
		return expression.Result{}, ErrBlankExpression
	}
	return expression.Evaluate(input)
}
