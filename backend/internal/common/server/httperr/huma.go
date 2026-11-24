package httperr

import (
	"maps"

	"github.com/danielgtaylor/huma/v2"
)

const requestProblemsKey = "httperr.requestProblems"

func init() {
	huma.NewError = func(status int, detail string, _ ...error) huma.StatusError {
		return statusProblem(status, detail)
	}
	huma.NewErrorWithContext = func(ctx huma.Context, status int, detail string, _ ...error) huma.StatusError {
		if op := ctx.Operation(); op != nil {
			definitions, _ := op.Metadata[requestProblemsKey].(map[int]Definition)
			if definition, ok := definitions[status]; ok {
				return definition.New("")
			}
		}
		return statusProblem(status, detail)
	}
}

func SetRequestProblems(op *huma.Operation, definitions ...Definition) {
	byStatus := make(map[int]Definition, len(definitions))
	for _, definition := range definitions {
		if definition.Code != "" {
			byStatus[definition.Status] = definition
		}
	}
	metadata := maps.Clone(op.Metadata)
	if metadata == nil {
		metadata = make(map[string]any)
	}
	metadata[requestProblemsKey] = byStatus
	op.Metadata = metadata
}
