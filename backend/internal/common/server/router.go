package server

import (
	"context"
	"net/http"
	"sync"

	"calculator/backend/internal/common/server/httperr"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humachi"
	"github.com/go-chi/chi/v5"
)

// Huma exposes its validation and error policies as process-wide settings.
var configureHuma = sync.OnceFunc(func() {
	huma.ValidateStrictCasing = true
	httperr.ConfigureHumaErrors()
})

type HTTPRouter struct {
	mux *chi.Mux
	api huma.API
}

func (router *HTTPRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	router.mux.ServeHTTP(w, r)
}

func NewHTTPRouter(config huma.Config, problemTypes []httperr.Definition) *HTTPRouter {
	configureHuma()
	router := chi.NewRouter()
	router.Get(httperr.TypePath+"{code}", httperr.Documentation(problemTypes))
	config.CreateHooks = nil
	jsonFormat := huma.DefaultJSONFormat
	jsonFormat.Unmarshal = unmarshalJSON
	config.Formats = map[string]huma.Format{"application/json": jsonFormat, "json": jsonFormat}
	api := humachi.New(router, config)

	huma.Register(api, huma.Operation{
		OperationID:   "health",
		Method:        http.MethodGet,
		Path:          "/health",
		Summary:       "Check service health",
		DefaultStatus: http.StatusOK,
	}, func(context.Context, *struct{}) (*struct{}, error) {
		return nil, nil
	})
	return &HTTPRouter{mux: router, api: api}
}
