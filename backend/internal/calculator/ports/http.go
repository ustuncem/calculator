package ports

import (
	"context"
	"fmt"
	"net/http"

	"calculator/backend/internal/calculator/domain/expression"
	"calculator/backend/internal/common/server"

	"github.com/danielgtaylor/huma/v2"
)

type CalculateFunc func(string) (expression.Result, error)

type calculateInput struct {
	Body struct {
		Expression string `json:"expression" minLength:"1" example:"0.1 + 0.2" doc:"Decimal arithmetic expression using +, -, *, / and parentheses."`
	}
}

type calculateOutput struct {
	Body struct {
		Result  string `json:"result" example:"0.3" doc:"Canonical decimal string. Magnitudes of 10^15 or greater use scientific notation, such as 1E+15."`
		Rounded bool   `json:"rounded" doc:"Whether the result was rounded to 15 fractional places."`
	}
}

const maxBodyBytes = 4096

func NewHTTPHandler(calculate CalculateFunc) http.Handler {
	config := huma.DefaultConfig("Calculator API", "1.0.0")
	registerProblemSchema(config.OpenAPI.Components.Schemas)
	router := server.NewHTTPRouter(config, problemTypes())

	server.RegisterJSON(router, huma.Operation{
		OperationID: "calculate",
		Method:      http.MethodPost,
		Path:        "/api/v1/calculate",
		Summary:     "Evaluate a decimal expression",
		Description: fmt.Sprintf("Accepts up to %d digits per literal, %d operands and %d nested groups. The JSON body may contain up to %d bytes.",
			expression.MaxDigitsPerLiteral, expression.MaxOperands, expression.MaxNesting, maxBodyBytes),
	}, maxBodyBytes, invalidExpressionInput, calculate.handle)
	return router
}

func (calculate CalculateFunc) handle(_ context.Context, input *calculateInput) (*calculateOutput, error) {
	result, err := calculate(input.Body.Expression)
	if err != nil {
		return nil, calculationProblem(err)
	}

	output := &calculateOutput{}
	output.Body.Result = result.Value
	output.Body.Rounded = result.Rounded
	return output, nil
}
