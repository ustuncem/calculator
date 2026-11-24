package errors

type Coded interface {
	error
	ErrorCode() string
}

type CodedError struct {
	Code   string
	Detail string
}

func (e *CodedError) Error() string     { return e.Detail }
func (e *CodedError) ErrorCode() string { return e.Code }
