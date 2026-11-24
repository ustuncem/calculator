package server

import (
	"context"
	"net/http"

	"calculator/backend/internal/common/server/httperr"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humachi"
	"github.com/go-chi/chi/v5"
)

func NewHTTPRouter(config huma.Config, problemTypes []httperr.Definition) (http.Handler, huma.API) {
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
	return router, api
}
