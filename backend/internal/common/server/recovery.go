package server

import (
	"context"
	"errors"
	"log"
	"net/http"
	"runtime/debug"

	"github.com/danielgtaylor/huma/v2"
)

func protectHandler[I, O any](operation string, handle func(context.Context, *I) (*O, error)) func(context.Context, *I) (*O, error) {
	return func(ctx context.Context, input *I) (output *O, err error) {
		defer func() {
			if failure := recover(); failure != nil {
				log.Printf("%s panicked: %v\n%s", operation, failure, debug.Stack())
				output = nil
				err = huma.NewError(http.StatusInternalServerError, "")
			}
		}()
		output, err = handle(ctx, input)
		var problem huma.StatusError
		if err != nil && !errors.As(err, &problem) {
			log.Printf("%s failed: %v", operation, err)
			return nil, huma.NewError(http.StatusInternalServerError, "")
		}
		return output, err
	}
}
