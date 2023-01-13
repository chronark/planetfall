FROM golang:1.19-alpine as builder

WORKDIR /planetfall

COPY . .

WORKDIR /planetfall/apps/proxy

RUN go mod download

RUN go build -o ./dist/cmd/fly/main ./cmd/fly/main.go 



FROM golang:1.19-alpine

WORKDIR /planetfall
COPY --from=builder /planetfall/apps/proxy/dist/cmd/fly/main proxy

CMD ["./proxy"]
