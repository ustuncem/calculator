package ports_test

import (
	"encoding/json"
	"net/http/httptest"
	"strings"
	"testing"

	"calculator/backend/internal/calculator/app/query"
	"calculator/backend/internal/calculator/ports"
)

func TestCalculateRequestContract(t *testing.T) {
	handler := ports.NewHTTPHandler(query.Calculate)
	const valid = `{"expression":"8+1"}`
	for _, test := range []struct {
		name, body, contentType string
		status                  int
		code, detailContains    string
	}{
		{"exact field name", valid, "application/json", 200, "", ""},
		{"JSON with parameter", valid, "application/json; charset=utf-8", 200, "", ""},
		{"JSON with optional whitespace", valid, "application/json ; charset=utf-8", 200, "", ""},
		{"wrong field casing", `{"Expression":"8+1"}`, "application/json", 422, "invalid_expression_input", ""},
		{"extra property", `{"expression":"8+1","extra":true}`, "application/json", 422, "invalid_expression_input", "body.extra: unexpected property"},
		{"case variant alongside exact name", `{"expression":"8+1","Expression":"2"}`, "application/json", 422, "invalid_expression_input", "body.Expression"},
		{"missing expression", `{}`, "application/json", 422, "invalid_expression_input", ""},
		{"null expression", `{"expression":null}`, "application/json", 422, "invalid_expression_input", ""},
		{"numeric expression", `{"expression":3}`, "application/json", 422, "invalid_expression_input", ""},
		{"blank expression", `{"expression":" "}`, "application/json", 422, "invalid_expression_input", ""},
		{"malformed JSON", `{`, "application/json", 400, "invalid_json", ""},
		{"trailing JSON", valid + " {}", "application/json", 400, "invalid_json", ""},
		{"unsupported type", valid, "text/plain", 415, "unsupported_media_type", ""},
	} {
		t.Run(test.name, func(t *testing.T) {
			request := httptest.NewRequest("POST", "/api/v1/calculate", strings.NewReader(test.body))
			request.Header.Set("Content-Type", test.contentType)
			response := httptest.NewRecorder()
			handler.ServeHTTP(response, request)
			if response.Code != test.status {
				t.Fatalf("got HTTP %d, want %d: %s", response.Code, test.status, response.Body)
			}
			var body map[string]any
			if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
				t.Fatal(err)
			}
			if test.status == 200 {
				if body["result"] != "9" || body["rounded"] != false {
					t.Fatalf("unexpected result: %v", body)
				}
				return
			}
			detail, _ := body["detail"].(string)
			if response.Header().Get("Content-Type") != "application/problem+json" ||
				body["code"] != test.code || body["type"] != "/problems/"+test.code ||
				detail == "" || !strings.Contains(detail, test.detailContains) {
				t.Fatalf("unexpected problem: %v", body)
			}
			for _, field := range []string{"start", "end"} {
				if _, present := body[field]; present {
					t.Errorf("body-level problem contains %s: %v", field, body)
				}
			}
		})
	}
}
