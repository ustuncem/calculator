package expression

import (
	"fmt"
	"math/big"
)

func Evaluate(input string) (Result, error) {
	program, err := parse(input)
	if err != nil {
		return Result{}, err
	}
	return evaluateProgram(program)
}

func evaluateProgram(program []token) (Result, error) {
	var stack []*big.Rat
	for _, t := range program {
		top := len(stack) - 1
		switch t.kind {
		case number:
			value, _ := new(big.Rat).SetString(t.text)
			stack = append(stack, value)
			continue
		case negate:
			stack[top].Neg(stack[top])
			continue
		case '%':
			stack[top].Quo(stack[top], big.NewRat(100, 1))
			continue
		case '+':
			stack[top-1].Add(stack[top-1], stack[top])
		case '-':
			stack[top-1].Sub(stack[top-1], stack[top])
		case '*':
			stack[top-1].Mul(stack[top-1], stack[top])
		case '/':
			if stack[top].Sign() == 0 {
				return Result{}, t.failure(DivisionByZero, "The divisor evaluates to zero.")
			}
			stack[top-1].Quo(stack[top-1], stack[top])
		default:
			return Result{}, fmt.Errorf("unknown evaluator instruction %q", t.kind)
		}
		stack = stack[:top]
	}
	return formatDecimal(stack[0]), nil
}
