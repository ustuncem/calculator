package expression

import (
	"math/big"
	"strconv"
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
	return Result{Value: formatLargeDecimal(decimal), Rounded: !exact}
}

func formatLargeDecimal(decimal string) string {
	const scientificThresholdExponent = 15
	unsigned, negative := strings.CutPrefix(decimal, "-")
	integer, fraction, _ := strings.Cut(unsigned, ".")
	exponent := len(integer) - 1
	if exponent < scientificThresholdExponent {
		return decimal
	}

	digits := strings.TrimRight(integer+fraction, "0")
	coefficient := digits[:1]
	if len(digits) > 1 {
		coefficient += "." + digits[1:]
	}
	if negative {
		coefficient = "-" + coefficient
	}
	return coefficient + "E+" + strconv.Itoa(exponent)
}
