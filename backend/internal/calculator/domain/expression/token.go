package expression

const (
	endOfInput = 0
	number     = 'n'
	invalid    = '?'
	negate     = 'u'
)

type token struct {
	kind       byte
	text       string
	start, end int
	err        *Error
}

func badToken(code, detail string, start, end int) token {
	return token{kind: invalid, err: newError(code, detail, start, end)}
}

func (t token) failure(code, detail string) *Error {
	if t.err != nil {
		return t.err
	}
	return newError(code, detail, t.start, t.end)
}
