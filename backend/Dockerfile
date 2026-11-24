FROM golang:1.27.4 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go test ./...
RUN CGO_ENABLED=0 go build -trimpath -o /calculator ./internal/calculator

FROM scratch
COPY --from=build /calculator /calculator
USER 65532:65532
EXPOSE 8080
ENTRYPOINT ["/calculator"]
