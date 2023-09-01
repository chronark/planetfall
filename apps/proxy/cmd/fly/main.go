package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/chronark/planetfall/apps/proxy/pkg/ping"
	"github.com/gofiber/fiber/v2"
)

type IdleChecker struct {
	lastHeartbeat time.Time
	sync.RWMutex
	Close chan struct{}
}

func (i *IdleChecker) Heartbeat() {
	i.Lock()
	defer i.Unlock()
	i.lastHeartbeat = time.Now()

}

func NewIdleChecker() *IdleChecker {

	i := &IdleChecker{
		lastHeartbeat: time.Now(),
		Close:         make(chan struct{}),
	}

	
	return i
}

type ResponseError struct {
	Error struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
}

func handleError(c *fiber.Ctx, status int, code string, message string) error {
	re := ResponseError{}
	re.Error.Code = code
	re.Error.Message = message

	return c.Status(status).JSON(re)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	region := os.Getenv("FLY_REGION")
	if region == "" {
		log.Fatal("FLY_REGION not set")
	}

	close := make(chan os.Signal, 1)
	signal.Notify(close, os.Interrupt, syscall.SIGTERM)
	app := fiber.New(fiber.Config{
		DisableStartupMessage: true,
	})

	idle := NewIdleChecker()

	// Send a heartbeat for every incoming request
	app.Use(func(c *fiber.Ctx) error {
		idle.Heartbeat()
		return c.Next()
	})

	app.Get("/health", func(c *fiber.Ctx) error {
		log.Println("received health check")
		return c.SendString("OK")
	})
	app.Post("/ping/:requestedRegion", func(c *fiber.Ctx) error {

		requestedRegion := c.Params("requestedRegion")
		if requestedRegion == "" {
			return handleError(c, 404, "NOT_FOUND", "Invalid region")
		}
		if requestedRegion != region {
			c.Response().Header.Add("Fly-Replay", fmt.Sprintf("region=%s", requestedRegion))
			return c.SendStatus(202)
		}
		req := ping.PingRequest{}
		err := c.BodyParser(&req)
		if err != nil {
			return handleError(c, 400, "BAD_REQUEST", err.Error())
		}

		res, err := ping.Ping(c.UserContext(), req)
		if err != nil {
			log.Printf("Error pinging: %s", err.Error())
			return handleError(c, 500, "INTERNAL_SERVER_ERROR", err.Error())
		}

		return c.JSON(res)
	})

	go func() {
		err := app.Listen(fmt.Sprintf(":%s", port))
		if err != nil {
			log.Fatalf("Error listening: %s", err.Error())
		}

	}()

	for {
		select {
		case <-close:
		case <-idle.Close:
			log.Println("Shutting down server")
			err := app.Shutdown()
			if err != nil {
				log.Printf("Error shutting down: %s\n", err.Error())
				os.Exit(1)
			}
			os.Exit(0)
		}
	}
}
