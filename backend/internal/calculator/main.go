package main

import (
	"log"

	"calculator/backend/internal/calculator/app/query"
	"calculator/backend/internal/calculator/ports"
	"calculator/backend/internal/common/server"
)

func main() {
	if err := server.Run(ports.NewHTTPHandler(query.Calculate)); err != nil {
		log.Fatal(err)
	}
}
