package main

import (
	"context"
	"encoding/json"
	"github.com/chronark/planetfall/svc/proxy/pkg/ping"
	"log"
	
)

func main() {
	
		
		req := ping.Request{
			Url: "https://google.com",
			Method: "GET",
			Checks: 1,
		}
	
		res, err := ping.Ping(context.Background(), req)
		if err != nil {
			log.Fatal(err)
			return
		}

		b, err := json.MarshalIndent(res, "", "  ")
		if err != nil {
			log.Fatal(err)
			return
		}
		log.Println(string(b))
		
		


}
