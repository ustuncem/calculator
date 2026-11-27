package ports

import (
	"errors"
	"reflect"

	"calculator/backend/internal/calculator/domain/expression"
	commonerrors "calculator/backend/internal/common/errors"
	"calculator/backend/internal/common/server/httperr"

	"github.com/danielgtaylor/huma/v2"
)

type problem struct {
	httperr.Problem
	Start int `json:"start" required:"false" doc:"Zero-based UTF-16 start offset for expression errors."`
	End   int `json:"end" required:"false" doc:"Exclusive UTF-16 end offset for expression errors."`
}

func registerProblemSchema(registry huma.Registry) {
	typ := reflect.TypeFor[problem]()
	registry.RegisterTypeAlias(reflect.TypeFor[httperr.Problem](), typ)
	schema := registry.Schema(typ, false, "Problem")
	exampleCode := expression.DivisionByZero.Code()
	schema.Properties["type"].Examples = []any{httperr.TypePath + exampleCode}
	schema.Properties["title"].Examples = []any{"Division by zero"}
	schema.Properties["code"].Examples = []any{exampleCode}
}

func calculationProblem(err error) error {
	var coded commonerrors.Coded
	if !errors.As(err, &coded) {
		return err
	}
	for _, definition := range calculationProblems {
		if definition.Code != coded.ErrorCode() {
			continue
		}
		if expressionError, ok := errors.AsType[*expression.Error](err); ok {
			return &problem{
				Problem: *definition.New(expressionError.Detail),
				Start:   expressionError.Start,
				End:     expressionError.End,
			}
		}
		return definition.New("")
	}
	return err
}
