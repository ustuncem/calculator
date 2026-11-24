package server

import (
	"bytes"
	"context"
	"encoding/json"
	"mime"
	"net/http"

	"calculator/backend/internal/common/server/httperr"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humachi"
)

func init() {
	// Match JSON property names exactly as published in OpenAPI.
	huma.ValidateStrictCasing = true
}

func RegisterJSON[I, O any](api huma.API, op huma.Operation, maxBytes int64, invalidInput httperr.Definition, handle func(context.Context, *I) (*O, error)) {
	op.MaxBodyBytes = maxBytes + 1
	op.Errors = append([]int{http.StatusBadRequest, http.StatusRequestTimeout, http.StatusRequestEntityTooLarge, http.StatusUnsupportedMediaType}, op.Errors...)
	op.Middlewares = append(huma.Middlewares{requireJSON(api)}, op.Middlewares...)
	httperr.SetRequestProblems(&op, httperr.BodyTooLarge(maxBytes), invalidInput)
	huma.Register(api, op, protectHandler(op.OperationID, handle))
}

func requireJSON(api huma.API) func(huma.Context, func(huma.Context)) {
	return func(ctx huma.Context, next func(huma.Context)) {
		mediaType, _, err := mime.ParseMediaType(ctx.Header("Content-Type"))
		if err != nil || mediaType != "application/json" {
			_ = huma.WriteErr(api, ctx, http.StatusUnsupportedMediaType, "")
			return
		}
		// Give Huma's decoder the same media type the middleware accepted.
		request, _ := humachi.Unwrap(ctx)
		request.Header.Set("Content-Type", mediaType)
		next(ctx)
	}
}

func unmarshalJSON(data []byte, target any) error {
	if _, validating := target.(*any); validating && json.Valid(data) {
		decoder := json.NewDecoder(bytes.NewReader(data))
		decoder.UseNumber()
		return decoder.Decode(target)
	}
	return json.Unmarshal(data, target)
}
