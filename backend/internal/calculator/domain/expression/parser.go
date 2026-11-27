package expression

import "fmt"

const (
	MaxOperands = 40
	MaxNesting  = 32
)

type parser struct {
	lexer    lexer
	current  token
	operands int
	program  []token
}

func parse(expression string) ([]token, error) {
	p := parser{lexer: lexer{input: expression}}
	p.advance()
	if err := p.expression(1, 0); err != nil {
		return nil, err
	}
	if p.current.kind == ')' {
		return nil, p.current.failure(UnexpectedClosingParenthesis, "Remove this closing parenthesis or add the matching opening parenthesis.")
	}
	if p.current.kind != endOfInput {
		return nil, p.current.failure(ExpectedOperator, "Add an arithmetic operator between operands.")
	}
	return p.program, nil
}

func (p *parser) expression(minimum, depth int) error {
	if err := p.operand(depth); err != nil {
		return err
	}
	for prec := precedence(p.current.kind); prec >= minimum; prec = precedence(p.current.kind) {
		operator := p.current
		p.advance()
		if err := p.expression(prec+1, depth); err != nil {
			return err
		}
		p.program = append(p.program, operator)
	}
	return nil
}

func (p *parser) operand(depth int) error {
	sign := p.current
	if sign.kind == '+' || sign.kind == '-' {
		p.advance()
	}
	if err := p.atom(depth); err != nil {
		return err
	}
	if p.current.kind == '%' {
		p.program = append(p.program, p.current)
		p.advance()
	}
	if sign.kind == '-' {
		sign.kind = negate
		p.program = append(p.program, sign)
	}
	return nil
}

func (p *parser) atom(depth int) error {
	t := p.current
	switch t.kind {
	case number:
		if p.operands == MaxOperands {
			return t.failure(TooManyOperands, fmt.Sprintf("Use at most %d numbers per expression.", MaxOperands))
		}
		p.operands++
		p.program = append(p.program, t)
		p.advance()
	case '(':
		if depth == MaxNesting {
			return t.failure(NestingLimitExceeded, fmt.Sprintf("Use at most %d nested groups.", MaxNesting))
		}
		p.advance()
		if err := p.expression(1, depth+1); err != nil {
			return err
		}
		switch p.current.kind {
		case ')':
			p.advance()
		case endOfInput:
			return p.current.failure(ExpectedClosingParenthesis, "Close this group with a parenthesis.")
		default:
			return p.current.failure(ExpectedOperator, "Add an arithmetic operator between operands.")
		}
	default:
		return t.failure(ExpectedOperand, "Enter a number or parenthesized expression.")
	}
	return nil
}

func (p *parser) advance() {
	p.current = p.lexer.next()
}

func precedence(kind byte) int {
	switch kind {
	case '+', '-':
		return 1
	case '*', '/':
		return 2
	default:
		return 0
	}
}
