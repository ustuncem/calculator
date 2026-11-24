package expression

import commonerrors "calculator/backend/internal/common/errors"

type Error struct {
	commonerrors.CodedError
	Start int
	End   int
}

func newError(code, detail string, start, end int) *Error {
	return &Error{Code: code, Detail: detail, Start: start, End: end}
}
