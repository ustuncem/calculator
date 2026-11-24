package httperr

import (
	"fmt"
	"net/http"
)

const TypePath = "/problems/"

type Problem struct {
	Type   string `json:"type" format:"uri-reference" doc:"Problem type URI, relative to the API origin."`
	Title  string `json:"title" doc:"Stable human-readable summary of the problem type."`
	Status int    `json:"status"`
	Detail string `json:"detail"`
	Code   string `json:"code"`
}

func (p *Problem) Error() string             { return p.Detail }
func (p *Problem) GetStatus() int            { return p.Status }
func (p *Problem) ContentType(string) string { return "application/problem+json" }

type Definition struct {
	Code   string
	Status int
	Title  string
	Detail string
}

func (d Definition) New(detail string) *Problem {
	if detail == "" {
		detail = d.Detail
	}
	return &Problem{Type: TypePath + d.Code, Title: d.Title, Status: d.Status, Detail: detail, Code: d.Code}
}

var transportProblems = map[int]Definition{
	http.StatusBadRequest:            {"invalid_json", 400, "Invalid JSON", "Send one valid JSON value."},
	http.StatusNotAcceptable:         {"not_acceptable", 406, "Unsupported response format", "The response is available as JSON."},
	http.StatusRequestTimeout:        {"request_timeout", 408, "Request body timed out", "The request body took too long to read."},
	http.StatusRequestEntityTooLarge: {"body_too_large", 413, "Request body too large", "Send a body within the endpoint's size limit."},
	http.StatusUnsupportedMediaType:  {"unsupported_media_type", 415, "Unsupported media type", "Send the request with Content-Type application/json."},
	http.StatusInternalServerError:   {"internal_error", 500, "Internal error", "An unexpected error occurred."},
}

var requestFailed = Definition{"request_failed", 0, "Request failed", "Refer to the HTTP status and detail in the response."}

func BodyTooLarge(maxBytes int64) Definition {
	definition := transportProblems[http.StatusRequestEntityTooLarge]
	definition.Detail = fmt.Sprintf("Send a JSON body of at most %d bytes.", maxBytes)
	return definition
}

func statusProblem(status int, detail string) *Problem {
	if definition, ok := transportProblems[status]; ok {
		return definition.New("")
	}
	problem := requestFailed.New(detail)
	problem.Status = status
	return problem
}
