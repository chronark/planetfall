package main

import (
	"context"
	"encoding/json"
	"github.com/chronark/planetfall/svc/proxy/pkg/ping"
	"log"
	"net/http"
	"os"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/region", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		err := json.NewEncoder(w).Encode(map[string]any{
			"Headers": r.Header,
			"FLY_REGION":        os.Getenv("FLY_REGION"),
		})
		if err != nil {
			log.Println(err)
		}

	})

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		ctx := context.Background()
		req := ping.Request{}
		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		log.Printf("Received request: %+v\n", req)

		res, err := ping.Ping(ctx, req)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(res)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	})
	log.Println("listening on port", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
