package expression

import (
	"errors"
	"strings"
	"testing"
)

func TestParseAcceptsValidGrammarBeforeEvaluation(t *testing.T) {
	if _, err := parse("+(.5 * -5.) / (1 - 1)"); err != nil {
		t.Fatalf("parse returned %v for valid grammar", err)
	}
}

func TestParseErrors(t *testing.T) {
	tests := []struct {
		expression, code string
		start, end       int
	}{
		{"", "expected_operand", 0, 0},
		{"   ", "expected_operand", 3, 3},
		{"2 +", "expected_operand", 3, 3},
		{"%", "expected_operand", 0, 1},
		{"2 + %", "expected_operand", 4, 5},
		{"10%%", "expected_operator", 3, 4},
		{"10%2", "expected_operator", 3, 4},
		{"--3", "expected_operand", 1, 2},
		{"2 * --3", "expected_operand", 5, 6},
		{"2(3 + 4)", "expected_operator", 1, 2},
		{"1 2", "expected_operator", 2, 3},
		{"(1 2)", "expected_operator", 3, 4},
		{"1,5", "invalid_token", 1, 2},
		{"1e3", "invalid_token", 1, 2},
		{"2 ^ 3", "invalid_token", 2, 3},
		{"1 × 2", "invalid_token", 2, 3},
		{" 1 + 🧮", "invalid_token", 5, 7},
		{"🧮", "invalid_token", 0, 2},
		{".", "invalid_number", 0, 1},
		{"1..2", "invalid_number", 2, 3},
		{"()", "expected_operand", 1, 2},
		{"(1", "expected_closing_parenthesis", 2, 2},
		{"1)", "unexpected_closing_parenthesis", 1, 2},
		{"0000000000000000", "too_many_digits", 15, 16},
		{"-00000000.00000000", "too_many_digits", 17, 18},
		{strings.Repeat("1+", 40) + "12.", "too_many_operands", 80, 83},
		{strings.Repeat("(", 33) + "1" + strings.Repeat(")", 33), "nesting_limit_exceeded", 32, 33},
	}
	for _, tt := range tests {
		t.Run(tt.expression, func(t *testing.T) {
			_, err := parse(tt.expression)
			var got *Error
			if !errors.As(err, &got) || got.Code != tt.code || got.Start != tt.start || got.End != tt.end || got.Detail == "" {
				t.Fatalf("parse(%q) error = %#v; want %s [%d, %d)", tt.expression, got, tt.code, tt.start, tt.end)
			}
		})
	}
}
