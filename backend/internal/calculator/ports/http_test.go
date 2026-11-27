package ports_test

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"calculator/backend/internal/calculator/app/query"
	"calculator/backend/internal/calculator/domain/expression"
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
			response, body := postCalculation(t, handler, strings.NewReader(test.body), test.contentType)
			if response.Code != test.status {
				t.Fatalf("got HTTP %d, want %d: %s", response.Code, test.status, response.Body)
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

func TestCalculateBodyLimitWithoutContentLength(t *testing.T) {
	for _, tt := range []struct {
		name   string
		bytes  int
		status int
	}{
		{"accepts 4096 bytes", 4096, http.StatusOK},
		{"rejects 4097 bytes", 4097, http.StatusRequestEntityTooLarge},
	} {
		t.Run(tt.name, func(t *testing.T) {
			var evaluated bool
			handler := ports.NewHTTPHandler(func(input string) (expression.Result, error) {
				evaluated = true
				return query.Calculate(input)
			})
			const input = `{"expression":"2/3"}`
			body := input + strings.Repeat(" ", tt.bytes-len(input))
			response, got := postCalculation(t, handler, io.NopCloser(strings.NewReader(body)), "application/json")
			if response.Code != tt.status || evaluated != (tt.status == http.StatusOK) {
				t.Fatalf("got HTTP %d, evaluated %t; want HTTP %d: %s", response.Code, evaluated, tt.status, response.Body)
			}
			if tt.status == http.StatusOK {
				if got["result"] != "0.666666666666667" || got["rounded"] != true {
					t.Fatalf("unexpected rounded result: %v", got)
				}
				return
			}
			if response.Header().Get("Content-Type") != "application/problem+json" ||
				got["code"] != "body_too_large" || got["type"] != "/problems/body_too_large" ||
				got["detail"] != "Send a JSON body of at most 4096 bytes." {
				t.Fatalf("unexpected body limit problem: %v", got)
			}
		})
	}
}

func TestCalculateExpressionProblemSpans(t *testing.T) {
	handler := ports.NewHTTPHandler(query.Calculate)
	for _, tt := range []struct {
		input  string
		code   string
		title  string
		detail string
		start  int
		end    int
	}{
		{`{"expression":"🧮"}`, "invalid_token", "Invalid token", "Use a decimal digit, space, parenthesis or arithmetic operator.", 0, 2},
		{`{"expression":"2 +"}`, "expected_operand", "Expected an operand", "Enter a number or parenthesized expression.", 3, 3},
		{`{"expression":"8 / (3 - 3)"}`, "division_by_zero", "Division by zero", "The divisor evaluates to zero.", 2, 3},
	} {
		t.Run(tt.code, func(t *testing.T) {
			response, got := postCalculation(t, handler, strings.NewReader(tt.input), "application/json")
			if response.Code != http.StatusUnprocessableEntity ||
				response.Header().Get("Content-Type") != "application/problem+json" ||
				got["status"] != float64(http.StatusUnprocessableEntity) || got["code"] != tt.code ||
				got["type"] != "/problems/"+tt.code || got["title"] != tt.title || got["detail"] != tt.detail ||
				got["start"] != float64(tt.start) || got["end"] != float64(tt.end) {
				t.Fatalf("HTTP %d with problem %v; want HTTP 422 %s [%d, %d)", response.Code, got, tt.code, tt.start, tt.end)
			}
		})
	}
}

func TestCalculateInternalFailureReturnsGenericProblem(t *testing.T) {
	failure := errors.New("private calculation failure")
	for _, tt := range []struct {
		name      string
		calculate ports.CalculateFunc
	}{
		{"error", func(string) (expression.Result, error) { return expression.Result{}, failure }},
		{"panic", func(string) (expression.Result, error) { panic(failure) }},
	} {
		t.Run(tt.name, func(t *testing.T) {
			handler := ports.NewHTTPHandler(tt.calculate)
			response, got := postCalculation(t, handler, strings.NewReader(`{"expression":"8+1"}`), "application/json")
			if response.Code != http.StatusInternalServerError ||
				response.Header().Get("Content-Type") != "application/problem+json" ||
				got["code"] != "internal_error" || got["detail"] != "An unexpected error occurred." ||
				strings.Contains(response.Body.String(), failure.Error()) {
				t.Fatalf("HTTP %d with problem %v; want a generic internal error", response.Code, got)
			}
		})
	}
}

func postCalculation(t *testing.T, handler http.Handler, input io.Reader, contentType string) (*httptest.ResponseRecorder, map[string]any) {
	t.Helper()
	request := httptest.NewRequest(http.MethodPost, "/api/v1/calculate", input)
	request.Header.Set("Content-Type", contentType)
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	var got map[string]any
	if err := json.Unmarshal(response.Body.Bytes(), &got); err != nil {
		t.Fatalf("HTTP %d returned invalid JSON: %v\n%s", response.Code, err, response.Body)
	}
	return response, got
}
