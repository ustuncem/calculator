package expression

import (
	"fmt"
	"unicode/utf8"
)

const MaxDigitsPerLiteral = 15

type lexer struct {
	input                string
	byteOffset, position int
}

func (l *lexer) next() token {
	for l.byteOffset < len(l.input) && l.input[l.byteOffset] == ' ' {
		l.byteOffset++
		l.position++
	}

	start := l.position
	if l.byteOffset == len(l.input) {
		return token{kind: endOfInput, start: start, end: start}
	}

	ch := l.input[l.byteOffset]
	switch {
	case isDigit(ch) || ch == '.':
		return l.decimal()
	case ch == '+' || ch == '-' || ch == '*' || ch == '/' || ch == '%' || ch == '(' || ch == ')':
		l.byteOffset++
		l.position++
		return token{kind: ch, start: start, end: l.position}
	default:
		r, size := utf8.DecodeRuneInString(l.input[l.byteOffset:])
		l.byteOffset += size
		l.position++
		if r > 0xffff {
			l.position++
		}
		return badToken(InvalidToken, "Use a decimal digit, space, parenthesis or arithmetic operator.", start, l.position)
	}
}

func (l *lexer) decimal() token {
	startByte, start := l.byteOffset, l.position
	digits, point := 0, false
	for l.byteOffset < len(l.input) {
		ch := l.input[l.byteOffset]
		switch {
		case isDigit(ch):
			digits++
			if digits > MaxDigitsPerLiteral {
				return badToken(TooManyDigits, fmt.Sprintf("Use at most %d digits per number.", MaxDigitsPerLiteral), l.position, l.position+1)
			}
		case ch == '.':
			if point {
				return badToken(InvalidNumber, "Use at most one decimal point per number.", l.position, l.position+1)
			}
			point = true
		default:
			goto done
		}
		l.byteOffset++
		l.position++
	}

done:
	if digits == 0 {
		return badToken(InvalidNumber, "A number must contain at least one digit.", start, l.position)
	}
	return token{kind: number, text: l.input[startByte:l.byteOffset], start: start, end: l.position}
}

func isDigit(ch byte) bool {
	return '0' <= ch && ch <= '9'
}
