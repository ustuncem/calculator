package expression

import "math/big"

func Evaluate(input string) (Result, error) {
	program, err := parse(input)
	if err != nil {
		return Result{}, err
	}

	var stack []*big.Rat
	for _, t := range program {
		switch t.kind {
		case number:
			value, _ := new(big.Rat).SetString(t.text)
			stack = append(stack, value)
		case negate:
			value := stack[len(stack)-1]
			value.Neg(value)
		default:
			left, right := stack[len(stack)-2], stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			switch t.kind {
			case '+':
				left.Add(left, right)
			case '-':
				left.Sub(left, right)
			case '*':
				left.Mul(left, right)
			case '/':
				if right.Sign() == 0 {
					return Result{}, t.failure("division_by_zero", "The divisor evaluates to zero.")
				}
				left.Quo(left, right)
			}
		}
	}
	return formatDecimal(stack[0]), nil
}
