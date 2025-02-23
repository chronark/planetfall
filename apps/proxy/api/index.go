package handler

import (
	"context"
	"encoding/json"
	"github.com/chronark/planetfall/apps/proxy/pkg/ping"
	"fmt"
	"net/http"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	req := ping.PingRequest{}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		fmt.Println("Error decoding request: ", err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	fmt.Printf("Received request: %+v\n", req)

	res, err := ping.Ping(ctx, req)
	if err != nil {
		fmt.Println("Error pinging: ", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(res)
	if err != nil {
		fmt.Println("Error encoding response: ", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

