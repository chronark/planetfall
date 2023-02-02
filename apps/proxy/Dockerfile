FROM golang:1.19-alpine as builder

WORKDIR /planetfall/apps/proxy

COPY apps/proxy/go.mod .
COPY apps/proxy/go.sum .
RUN go mod download

WORKDIR /planetfall
COPY . .

WORKDIR /planetfall/apps/proxy
RUN go build -o ./dist/cmd/fly/main ./cmd/fly/main.go 



FROM golang:1.19-alpine

WORKDIR /planetfall
COPY --from=builder /planetfall/apps/proxy/dist/cmd/fly/main proxy

CMD ["./proxy"]
