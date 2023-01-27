package main

import (
	"context"
	"encoding/json"
	"fmt"
	"syscall/js"
"time"
	"github.com/chronark/planetfall/apps/proxy/pkg/ping"
)

func main() {
	fmt.Println("Go Web Assembly")
	js.Global().Set("ping", pingFunction())
	// prevent the program from exiting

	close := time.After(10 * time.Second)
	<-close
	
}

func pingFunction() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		defer func() {
			if r := recover(); r != nil {
				fmt.Println("Recovered from", r)
			}
		}() 

		if len(args) != 1 {
			return "Error: Invalid number of arguments"
		}
		input := args[0].String()
		req := ping.Request{}
		err := json.Unmarshal([]byte(input), &req)
		if err != nil {
			return "Error: Invalid request: " + err.Error()
		}
		res, err := ping.Ping(context.Background(), req)
		if err != nil {
			return "Error: " + err.Error()
		}
		resJSON, err := json.Marshal(res)
		if err != nil {
			return "Error: " + err.Error()
		}
		return string(resJSON)

	})
}
