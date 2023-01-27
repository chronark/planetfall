package ping

import (
	"context"
	"crypto/tls"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httptrace"
	"strings"
	"time"

	"github.com/chronark/planetfall/apps/proxy/pkg/tags"
)

type Request struct {
	Url     string            `json:"url"`
	Method  string            `json:"method"`
	Body    string            `json:"body"`
	Headers map[string]string `json:"headers"`
	//Timeout in milliseconds
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

type Response struct {
	Status  int               `json:"status,omitempty"`
	Latency int64             `json:"latency,omitempty"`
	Body    string            `json:"body,omitempty"`
	Headers map[string]string `json:"headers,omitempty"`
	Time    int64             `json:"time"`
	Timing  Timing            `json:"timing"`
	Error   string            `json:"error,omitempty"`
	Tags    []string          `json:"tags,omitempty"`
}

func Ping(ctx context.Context, req Request) ([]Response, error) {

	if req.Checks == 0 {
		req.Checks = 1
	}

	responses := make([]Response, req.Checks)
	for i := 0; i < req.Checks; i++ {
		var err error
		responses[i], err = check(ctx, req)
		if err != nil {
			return []Response{}, err
		}
	}
	return responses, nil

}

func check(ctx context.Context, input Request) (Response, error) {
	log.Printf("Checking [%s] %s: %#v\n", input.Method, input.Url, input)

	now := time.Now()
	timing := Timing{}

	req, err := http.NewRequest(input.Method, input.Url, strings.NewReader(input.Body))
	if err != nil {
		return Response{}, err
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

	log.Printf("Request: %#v\n", req)
	t := &http.Transport{}

	defer t.CloseIdleConnections()
	client := &http.Client{
		Transport: t,
		Timeout:   time.Duration(input.Timeout) * time.Millisecond,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			// Do not follow redirects
			return http.ErrUseLastResponse
		},
	}
	start := time.Now()
	res, err := client.Do(req)
	timing.TransferDone = time.Now().UnixMilli()
	latency := time.Since(start).Milliseconds()
	if errors.Is(err, context.DeadlineExceeded) {
		return Response{
			Time:   now.UnixMilli(),
			Timing: timing,
			Error:  fmt.Sprintf("Timeout after %d ms", input.Timeout),
		}, nil
	}
	if err != nil {
		return Response{}, err
	}

	defer res.Body.Close()
	log.Printf("Response from %s: [%d] \n", req.URL, res.StatusCode)
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return Response{}, err
	}
	headers := make(map[string]string)
	for key := range res.Header {
		headers[key] = res.Header.Get(key)
	}

	foundTags, err := tags.Parse(string(body), res.Header.Clone())
	if err != nil {
		return Response{}, err
	}
	if len(body) > 1000 {
		body = body[:1000]
	}
	return Response{
		Time:    now.UnixMilli(),
		Status:  res.StatusCode,
		Body:    base64.StdEncoding.EncodeToString(body),
		Headers: headers,
		Timing:  timing,
		Latency: latency,
		Tags:    foundTags,
	}, nil
}
