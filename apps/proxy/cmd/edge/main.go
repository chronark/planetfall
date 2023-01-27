package main

import (
	"context"
	"encoding/json"
	"fmt"
	"syscall/js"

	"github.com/chronark/planetfall/apps/proxy/pkg/ping"
)

func main() {
	fmt.Println("Go Web Assembly")
	js.Global().Set("ping", js.FuncOf(pingEndpoint))
	select {}

}

func pingEndpoint(this js.Value, args []js.Value) interface{} {
	if len(args) != 1 {
		return "Error: Invalid number of arguments"
	}
	input := args[0].String()
	handler := js.FuncOf(func(this js.Value, p []js.Value) interface{} {
		resolve := p[0]
		reject := p[1]
		go func() {
			req := ping.Request{}
			err := json.Unmarshal([]byte(input), &req)
			if err != nil {
				reject.Invoke("Error: Invalid request: " + err.Error())
			}
			res, err := ping.Ping(context.Background(), req)
			if err != nil {
				reject.Invoke("Error: " + err.Error())
			}
			resJSON, err := json.Marshal(res)
			if err != nil {
				reject.Invoke("Error: " + err.Error())
			}
			fmt.Println("go", string(resJSON))
			resolve.Invoke(string(resJSON))
		}()
		return nil
	})

	promiseConstructor := js.Global().Get("Promise")
	return promiseConstructor.New(handler)

}
