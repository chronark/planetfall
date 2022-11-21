package main

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/chronark/planetfall/svc/proxy/pkg/ping"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

// All values are unix timestamps in milliseconds
type Timing struct {
	DnsStart          int64 `json:"dnsStart"`
	DnsDone           int64 `json:"dnsDone"`
	ConnectStart      int64 `json:"connectStart"`
	ConnectDone       int64 `json:"connectDone"`
	TlsHandshakeStart int64 `json:"tlsHandshakeStart"`
	TlsHandshakeDone  int64 `json:"tlsHandshakeDone"`
	FirstByteStart    int64 `json:"firstByteStart"`
	FirstByteDone     int64 `json:"firstByteDone"`
	TransferStart     int64 `json:"transferStart"`
	TransferDone      int64 `json:"transferDone"`
}

type CheckResponse struct {
	Status  int               `json:"status"`
	Latency int64             `json:"latency"`
	Body    string            `json:"body"`
	Headers map[string]string `json:"headers"`
	Time    int64             `json:"time"`
	Timing  Timing            `json:"timing"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func handleError(err error, statusCode int) (events.LambdaFunctionURLResponse, error) {
	body, err := json.Marshal(ErrorResponse{Error: err.Error()})
	if err != nil {
		return events.LambdaFunctionURLResponse{StatusCode: 500}, err
	}
	return events.LambdaFunctionURLResponse{
		StatusCode: statusCode,
		Body:       string(body),
	}, nil
}

func HandleRequest(ctx context.Context, event events.LambdaFunctionURLRequest) (events.LambdaFunctionURLResponse, error) {

	if event.Headers["content-type"] != "application/json" {
		return events.LambdaFunctionURLResponse{StatusCode: 400, Body: "use application/json"}, nil
	}

	req := ping.Request{}
	err := json.Unmarshal([]byte(event.Body), &req)
	if err != nil {
		return handleError(err, http.StatusBadRequest)
	}

	responses, err := ping.Ping(ctx, req)
	responseBody, err := json.Marshal(responses)
	if err != nil {
		return handleError(err, http.StatusInternalServerError)
	}

	return events.LambdaFunctionURLResponse{
		StatusCode: 200,
		Body:       string(responseBody),
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
	}, nil

}

func main() {
	lambda.Start(HandleRequest)
}
