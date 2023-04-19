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

/*
curl https://proxy-go.vercel.app/api \
-H "Content-Type: application/json" \
-d '{
	"url": "https://definite-viper-32652.upstash.io/get/key",
	"method": "GET",
	"headers": {  "Authorization": "AX-MASQgZGNjNGFmYjItZmQyMi00OWQ0LTlmOWMtZGE4OWFmOTU0MDUzZjIxOGUwOTk0NWQ5NDMzMDhiYzU0MzJlMjdlMWZhNWE="},
	"timeout": 10000,
	"followRedirects": true,
	"prewarm": true,
	"runs": 1
}' 
*/
type PingRequest struct {
	Url     string            `json:"url"`
	Method  string            `json:"method"`
	Body    string            `json:"body"`
	Headers map[string]string `json:"headers"`
	//Timeout in milliseconds
	Timeout         int  `json:"timeout"`
	FollowRedirects bool `json:"followRedirects"`

	// Fires one request ahead of time without measuring the response time
	Prewarm bool `json:"prewarm"`

	// Runs multiple times and returns all responses
	Runs int `json:"runs"`
}
type checkRequest struct {
	Url     string            `json:"url"`
	Method  string            `json:"method"`
	Body    string            `json:"body"`
	Headers map[string]string `json:"headers"`
	//Timeout in milliseconds
	Timeout int `json:"timeout"`
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
	Latency int64             `json:"latency"`
	Body    string            `json:"body,omitempty"`
	Headers map[string]string `json:"headers,omitempty"`
	Time    int64             `json:"time"`
	Timing  Timing            `json:"timing"`
	Error   string            `json:"error,omitempty"`
	Tags    []string          `json:"tags,omitempty"`
}

func Ping(ctx context.Context, req PingRequest) ([]Response, error) {
	if req.Runs <= 0 {
		req.Runs = 1
	}
	t := &http.Transport{}
	client := &http.Client{
		Transport: t,
		Timeout:   time.Duration(req.Timeout) * time.Millisecond,
		CheckRedirect: func(_ *http.Request, _ []*http.Request) error {
			if !req.FollowRedirects {
				// Do not follow redirects
				return http.ErrUseLastResponse
			}
			return nil

		},
	}
	defer t.CloseIdleConnections()

	if req.Prewarm {
		_, err := check(ctx, client, checkRequest{
			Url:     req.Url,
			Method:  req.Method,
			Body:    req.Body,
			Headers: req.Headers,
			Timeout: req.Timeout,
		})
		if err != nil {
			return nil, err
		}
	}
	checkReq := checkRequest{
		Url:     req.Url,
		Method:  req.Method,
		Body:    req.Body,
		Headers: req.Headers,
		Timeout: req.Timeout,
	}

	responses := make([]Response, req.Runs)
	for i := 0; i < req.Runs; i++ {

		res, err := check(ctx, client, checkReq)
		if err != nil {
			return nil, err
		}
		// Repeat once
		if res.Error != "" {
			res, err = check(ctx, client, checkReq)
		}
		if err != nil {
			return nil, err
		}
		responses[i] = res
	}
	return responses, nil
}

func check(ctx context.Context, client *http.Client, input checkRequest) (Response, error) {
	log.Printf("Checking [%s] %s: %#v\n", input.Method, input.Url, input)

	now := time.Now()
	timing := Timing{}

	req, err := http.NewRequest(input.Method, input.Url, strings.NewReader(input.Body))
	if err != nil {
		return Response{}, fmt.Errorf("Unable to create request: %w", err)
	}
	req.Header.Set("User-Agent", "planetfall/1.0")

	for key, value := range input.Headers {
		req.Header.Set(key, value)
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
		return Response{}, fmt.Errorf("Error while checking %s: %w", input.Url, err)
	}

	defer res.Body.Close()
	log.Printf("Response from %s: [%d] \n", req.URL, res.StatusCode)
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return Response{}, fmt.Errorf("Error while reading body from %s: %w", input.Url, err)
	}
	headers := make(map[string]string)
	for key := range res.Header {
		headers[key] = res.Header.Get(key)
	}

	foundTags := []string{}
	if res.Header.Get("Content-Type") == "text/html" {
		foundTags, err = tags.Parse(string(body), res.Header.Clone())
		if err != nil {
			return Response{}, fmt.Errorf("Error while parsing tags from %s: %w", input.Url, err)
		}
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
