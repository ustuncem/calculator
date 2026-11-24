package expression

import (
	"errors"
	"testing"
)

func TestUnknownInstructionReturnsInternalError(t *testing.T) {
	program := []token{{kind: number, text: "2"}, {kind: number, text: "3"}, {kind: 0xff}}
	result, err := evaluateProgram(program)
	_, isExpressionError := errors.AsType[*Error](err)
	if err == nil || result != (Result{}) || isExpressionError {
		t.Fatalf("got %+v, %v; want an internal error and no result", result, err)
	}
}
