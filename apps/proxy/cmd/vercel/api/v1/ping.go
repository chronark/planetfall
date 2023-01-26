package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/chronark/planetfall/apps/proxy/pkg/ping"
)


type ErrorResponse struct {
	Error string `json:"error"`
}

func handleError(w http.ResponseWriter, err error, statusCode int) {
	body, err := json.Marshal(ErrorResponse{Error: err.Error()})
	if err != nil {
		panic(err)
	}
	w.WriteHeader(statusCode)
	_, err = w.Write(body)
	if err != nil {
		panic(err)
	}
}

func Handler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	if r.Header.Get("content-type") != "application/json" {
		handleError(w, errors.New("use application/json"), http.StatusBadRequest)
		return
	}

	req := ping.Request{}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		handleError(w, err, http.StatusBadRequest)
		return
	}

	responses, err := ping.Ping(context.Background(), req)
	if err != nil {
		handleError(w, err, http.StatusInternalServerError)
		return
	}

	responseBody, err := json.Marshal(responses)
	if err != nil {
		handleError(w, err, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_, err = w.Write(responseBody)
	if err != nil {
		handleError(w, err, http.StatusInternalServerError)
		return
	}

}
