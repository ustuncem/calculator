package expression

import "testing"

func TestLexerTokens(t *testing.T) {
	l := lexer{input: " .5 + 🧮"}
	for _, want := range []token{
		{kind: number, text: ".5", start: 1, end: 3},
		{kind: '+', start: 4, end: 5},
	} {
		if got := l.next(); got != want {
			t.Fatalf("next() = %+v; want %+v", got, want)
		}
	}
	got := l.next()
	if got.kind != invalid || got.err == nil || got.err.Code != "invalid_token" || got.err.Start != 6 || got.err.End != 8 {
		t.Fatalf("next() = %+v, error %+v; want invalid_token at [6, 8)", got, got.err)
	}
	want := token{kind: endOfInput, start: 8, end: 8}
	if got := l.next(); got != want {
		t.Fatalf("next() = %+v; want %+v", got, want)
	}
}
