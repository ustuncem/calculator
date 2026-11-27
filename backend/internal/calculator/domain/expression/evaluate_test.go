package expression_test

import (
	"errors"
	"strings"
	"testing"

	"calculator/backend/internal/calculator/domain/expression"
)

func TestEvaluate(t *testing.T) {
	tests := []struct {
		expression string
		value      string
		rounded    bool
	}{
		{"0.1 + 0.2", "0.3", false},
		{"2 + 3 * 4", "14", false},
		{"(2 + 3) * 4", "20", false},
		{"8 / 4 / 2", "1", false},
		{"10 - 3 - 2", "5", false},
		{"-(2.5 + 1.5) / 2", "-2", false},
		{"2 * -3", "-6", false},
		{"2 - -3", "5", false},
		{"+ (2 + +3)", "5", false},
		{" .5 + 5. ", "5.5", false},
		{"0005.000", "5", false},
		{"00000000000000.", "0", false},
		{".000000000000001", "0.000000000000001", false},
		{"0 / 5", "0", false},
		{"-0", "0", false},
		{"(1 / 3) * 3", "1", false},
		{"(1 / 3) - (1 / 3)", "0", false},
		{"1 / 6", "0.166666666666667", true},
		{"2 / 3", "0.666666666666667", true},
		{"-2 / 3", "-0.666666666666667", true},
		{"10 / 3", "3.333333333333333", true},
		{"1 / 11", "0.090909090909091", true},
		{"61 / 3000000000000", "0.000000000020333", true},
		{"1 / 300000000000000", "0.000000000000003", true},
		{"1 - 1 / (3 * 100000000000000 * 10)", "1", true},
		{"1 / (3 * 1000000000 * 1000000000)", "0", true},
		{"-1 / (3 * 1000000000 * 1000000000)", "0", true},
		{"1 / 8", "0.125", false},
		{"1 / 200000000000000", "0.000000000000005", false},
		{"0.000000001 * 0.000000001", "0.000000000000000001", false},
		{"999999999999999", "999999999999999", false},
		{"999999999999999 + 1", "1E+15", false},
		{"-100000000000000 * 12", "-1.2E+15", false},
		{"100000000000000 * 12 + 0.125", "1.200000000000000125E+15", false},
		{"100000000000000 * 40 / 3", "1.333333333333333333333333333333E+15", true},
		{"((1234567890 + 9876543210) * (3000000000 - 2000000000)) / (5000000000 / 2500000000)", "5.55555555E+18", false},
		{"999999999999999 * 999999999999999 + 999999999999999", "9.99999999999999E+29", false},
		{"0.00000000000001 * 0.00000000000002", "0.0000000000000000000000000002", false},
		{"999999999999999 / (900000000000007 - 900000000000000)", "142857142857142.714285714285714", true},
		{strings.Repeat("100000000000000+", 39) + "100000000000000", "4E+15", false},
		{strings.Repeat("(", 32) + "1" + strings.Repeat(")", 32), "1", false},
		{strings.Repeat("(", 32) + "1" + strings.Repeat(")", 32) + " + (2)", "3", false},
	}
	for _, tt := range tests {
		t.Run(tt.expression, func(t *testing.T) {
			want := expression.Result{Value: tt.value, Rounded: tt.rounded}
			got, err := expression.Evaluate(tt.expression)
			if err != nil || got != want {
				t.Fatalf("Evaluate(%q) = %+v, %v; want %+v", tt.expression, got, err, want)
			}
		})
	}
}

func TestEvaluationErrorPrecedence(t *testing.T) {
	tests := []struct {
		input, code string
		start, end  int
	}{
		{"1 / 0 +", "expected_operand", 7, 7},
		{"1 / 0 + 2", "division_by_zero", 2, 3},
		{"8 / (3 - 3)", "division_by_zero", 2, 3},
		{"8 / -0", "division_by_zero", 2, 3},
		{"2 / (3 - 3) + 4 / -0", "division_by_zero", 2, 3},
		{"2 / (3 - 2) + 4 / -0", "division_by_zero", 16, 17},
		{"2 / (3 - 3) + 4 / -0 +", "expected_operand", 22, 22},
		{"1 / (1 / 0)", "division_by_zero", 7, 8},
		{"1 / 0 + 1e3", "invalid_token", 9, 10},
	}
	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			_, err := expression.Evaluate(tt.input)
			var got *expression.Error
			if !errors.As(err, &got) || got.Code != tt.code || got.Start != tt.start || got.End != tt.end || got.Detail == "" {
				t.Fatalf("Evaluate(%q) error = %#v; want %s [%d, %d)", tt.input, got, tt.code, tt.start, tt.end)
			}
		})
	}
}
