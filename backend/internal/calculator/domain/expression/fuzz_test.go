package expression_test

import (
	"errors"
	"regexp"
	"strings"
	"testing"
	"unicode/utf16"

	"calculator/backend/internal/calculator/domain/expression"
)

func FuzzEvaluate(f *testing.F) {
	for _, seed := range []string{
		"", "2 + 3 * 4", "1 / 0 +", "8 / (3 - 3)", "(1 / 3) * 3", "2 / 3",
		"-0", "2 * --3", ".5 + 5.", "🧮", "1 + \xff", "0000000000000000",
		"999999999999999 + 1", "-100000000000000 * 12 + 0.125",
		strings.Repeat("1+", 40) + "1", strings.Repeat("(", 33) + "1" + strings.Repeat(")", 33),
	} {
		f.Add(seed)
	}

	canonical := regexp.MustCompile(`^-?((0|[1-9][0-9]{0,14})(\.[0-9]*[1-9])?|[1-9](\.[0-9]*[1-9])?E\+[1-9][0-9]+)$`)
	f.Fuzz(func(t *testing.T, input string) {
		result, err := expression.Evaluate(input)
		if err != nil {
			var expressionError *expression.Error
			if !errors.As(err, &expressionError) {
				t.Fatalf("unexpected error type: %T", err)
			}
			size := len(utf16.Encode([]rune(input)))
			if expressionError.Start < 0 || expressionError.End < expressionError.Start || expressionError.End > size {
				t.Fatalf("invalid span [%d, %d) in expression of UTF-16 length %d", expressionError.Start, expressionError.End, size)
			}
			return
		}
		if !canonical.MatchString(result.Value) || result.Value == "-0" {
			t.Fatalf("noncanonical decimal %q", result.Value)
		}
	})
}
