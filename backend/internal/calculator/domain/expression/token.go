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

func badToken(kind ErrorKind, detail string, start, end int) token {
	return token{kind: invalid, err: newError(kind, detail, start, end)}
}

func (t token) failure(kind ErrorKind, detail string) *Error {
	if t.err != nil {
		return t.err
	}
	return newError(kind, detail, t.start, t.end)
}
