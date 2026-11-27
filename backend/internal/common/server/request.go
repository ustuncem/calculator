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

func RegisterJSON[I, O any](router *HTTPRouter, op huma.Operation, maxBytes int64, invalidInput httperr.Definition, handle func(context.Context, *I) (*O, error)) {
	op.MaxBodyBytes = maxBytes + 1
	op.Errors = append([]int{http.StatusBadRequest, http.StatusRequestTimeout, http.StatusRequestEntityTooLarge, http.StatusUnsupportedMediaType}, op.Errors...)
	op.Middlewares = append(huma.Middlewares{router.requireJSON}, op.Middlewares...)
	httperr.SetRequestProblems(&op, httperr.BodyTooLarge(maxBytes), invalidInput)
	huma.Register(router.api, op, protectHandler(op.OperationID, handle))
}

func (router *HTTPRouter) requireJSON(ctx huma.Context, next func(huma.Context)) {
	mediaType, _, err := mime.ParseMediaType(ctx.Header("Content-Type"))
	if err != nil || mediaType != "application/json" {
		_ = huma.WriteErr(router.api, ctx, http.StatusUnsupportedMediaType, "")
		return
	}
	// Give Huma's decoder the same media type the middleware accepted.
	request, _ := humachi.Unwrap(ctx)
	request.Header.Set("Content-Type", mediaType)
	next(ctx)
}

func unmarshalJSON(data []byte, target any) error {
	if _, validating := target.(*any); validating && json.Valid(data) {
		decoder := json.NewDecoder(bytes.NewReader(data))
		decoder.UseNumber()
		return decoder.Decode(target)
	}
	return json.Unmarshal(data, target)
}
