package httperr

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func Documentation(definitions []Definition) http.HandlerFunc {
	byCode := map[string]Definition{requestFailed.Code: requestFailed}
	for _, definition := range transportProblems {
		byCode[definition.Code] = definition
	}
	for _, definition := range definitions {
		byCode[definition.Code] = definition
	}
	return func(w http.ResponseWriter, r *http.Request) {
		code := chi.URLParam(r, "code")
		definition, ok := byCode[code]
		if !ok {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		fmt.Fprintf(w, "%s\n\n%s\n\nCode: %s\n", definition.Title, definition.Detail, code)
		if definition.Status != 0 {
			fmt.Fprintf(w, "HTTP status: %d\n", definition.Status)
		}
	}
}
