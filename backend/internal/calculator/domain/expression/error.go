package expression

import commonerrors "calculator/backend/internal/common/errors"

type ErrorKind int

const (
	InvalidToken ErrorKind = iota
	InvalidNumber
	ExpectedOperand
	ExpectedOperator
	ExpectedClosingParenthesis
	UnexpectedClosingParenthesis
	TooManyDigits
	TooManyOperands
	NestingLimitExceeded
	DivisionByZero
	errorKindCount
)

var errorCodes = [errorKindCount]string{
	InvalidToken:                 "invalid_token",
	InvalidNumber:                "invalid_number",
	ExpectedOperand:              "expected_operand",
	ExpectedOperator:             "expected_operator",
	ExpectedClosingParenthesis:   "expected_closing_parenthesis",
	UnexpectedClosingParenthesis: "unexpected_closing_parenthesis",
	TooManyDigits:                "too_many_digits",
	TooManyOperands:              "too_many_operands",
	NestingLimitExceeded:         "nesting_limit_exceeded",
	DivisionByZero:               "division_by_zero",
}

func (kind ErrorKind) Code() string { return errorCodes[kind] }

func ErrorCodes() [errorKindCount]string { return errorCodes }

type Error struct {
	commonerrors.CodedError
	Start int
	End   int
}

func newError(kind ErrorKind, detail string, start, end int) *Error {
	return &Error{Code: kind.Code(), Detail: detail, Start: start, End: end}
}
