package expression

import (
	"math/big"
	"strings"
)

type Result struct {
	Value   string
	Rounded bool
}

func formatDecimal(value *big.Rat) Result {
	places, exact := value.FloatPrec()
	if !exact {
		places = 15
	}
	decimal := value.FloatString(places)
	if places > 0 {
		decimal = strings.TrimRight(strings.TrimRight(decimal, "0"), ".")
	}
	if decimal == "-0" {
		decimal = "0"
	}
	return Result{Value: decimal, Rounded: !exact}
}
