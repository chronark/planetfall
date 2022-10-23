package main

import (
	"context"
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptrace"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

type Request struct {
	Url     string            `json:"url"`
	Method  string            `json:"method"`
	Body    string            `json:"body"`
	Headers map[string]string `json:"headers"`
	// Timeout in milliseconds
	Timeout int `json:"timeout"`
	// How many checks should run
	Checks int `json:"checks"`
}

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

	input := Request{}
	err := json.Unmarshal([]byte(event.Body), &input)
	if err != nil {
		return handleError(err, http.StatusBadRequest)
	}
	if input.Checks == 0 {
		input.Checks = 1
	}

	responses := make([]CheckResponse, input.Checks)
	for i := 0; i < input.Checks; i++ {
		responses[i], err = check(ctx, input)
		if err != nil {
			return handleError(err, http.StatusInternalServerError)
		}
	}

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

func check(ctx context.Context, input Request) (CheckResponse, error) {
	now := time.Now()
	timing := Timing{}

	req, err := http.NewRequest(input.Method, input.Url, strings.NewReader(input.Body))
	if err != nil {
		return CheckResponse{}, err
	}
	for key, value := range input.Headers {
		req.Header.Add(key, value)
	}
	trace := &httptrace.ClientTrace{
		DNSStart:          func(_ httptrace.DNSStartInfo) { timing.DnsStart = time.Now().UnixMilli() },
		DNSDone:           func(_ httptrace.DNSDoneInfo) { timing.DnsDone = time.Now().UnixMilli() },
		ConnectStart:      func(_, _ string) { timing.ConnectStart = time.Now().UnixMilli() },
		ConnectDone:       func(_, _ string, _ error) { timing.ConnectDone = time.Now().UnixMilli() },
		TLSHandshakeStart: func() { timing.TlsHandshakeStart = time.Now().UnixMilli() },
		TLSHandshakeDone:  func(_ tls.ConnectionState, _ error) { timing.TlsHandshakeDone = time.Now().UnixMilli() },
		GotConn: func(_ httptrace.GotConnInfo) {
			timing.FirstByteStart = time.Now().UnixMilli()
		},
		GotFirstResponseByte: func() {
			timing.FirstByteDone = time.Now().UnixMilli()
			timing.TransferStart = time.Now().UnixMilli()
		},
	}

	req = req.WithContext(httptrace.WithClientTrace(req.Context(), trace))

	client := &http.Client{
		Timeout: time.Duration(input.Timeout) * time.Millisecond,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			// Do not follow redirects
			return http.ErrUseLastResponse
		},
	}
	start := time.Now()
	res, err := client.Do(req)
	timing.TransferDone = time.Now().UnixMilli()
	latency := time.Since(start).Milliseconds()
	if err != nil {
		return CheckResponse{}, err
	}

	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return CheckResponse{}, err
	}
	headers := make(map[string]string)
	for key := range res.Header {
		headers[key] = res.Header.Get(key)
	}
	if len(body) > 1000 {
		body = body[:1000]
	}
	return CheckResponse{
		Time: now.UnixMilli(),
		Status:  res.StatusCode,
		Body:    base64.StdEncoding.EncodeToString(body),
		Headers: headers,
		Timing:  timing,
		Latency: latency,
	}, nil
}
