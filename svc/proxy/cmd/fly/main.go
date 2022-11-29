package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/chronark/planetfall/svc/proxy/pkg/ping"
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

	t := time.NewTicker(10 * time.Second)
	go func() {

		for range t.C {
			log.Println("Checking if idle")
			i.Lock()
			lastAccessed := i.lastHeartbeat
			i.Unlock()
			if time.Since(lastAccessed) > time.Minute {
				log.Println("IdleChecker: Shutting down")
				t.Stop()
				i.Close <- struct{}{}
			}
		}

	}()
	return i
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	close := make(chan os.Signal, 1)
	signal.Notify(close, os.Interrupt, syscall.SIGTERM)
	app := fiber.New(fiber.Config{
		DisableStartupMessage: false,
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
	app.Post("/", func(c *fiber.Ctx) error {

		req := ping.Request{}
		err := c.BodyParser(&req)
		if err != nil {
			return c.Status(400).JSON(map[string]string{"error": err.Error()})
		}

		res, err := ping.Ping(c.UserContext(), req)
		if err != nil {
			return c.Status(500).JSON(map[string]string{"error": err.Error()})
		}

		return c.JSON(res)
	})

	go func() {
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
				log.Println("Server shut down")
				os.Exit(0)
			}
		}
	}()

	err := app.Listen(fmt.Sprintf(":%s", port))
	if err != nil {
		log.Fatalf("Error listening: %s", err.Error())
	}

}
