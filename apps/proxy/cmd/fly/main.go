package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/axiomhq/axiom-go/axiom"
	"github.com/axiomhq/axiom-go/axiom/ingest"
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
		DisableStartupMessage: false,
	})
	ax, err := axiom.NewClient(
		axiom.SetPersonalTokenConfig(os.Getenv("AXIOM_TOKEN"), os.Getenv("AXIOM_ORG")),
	)
	if err != nil {
		log.Printf("Error creating axiom: %s\n", err.Error())
		os.Exit(1)
	}
	err = ax.ValidateCredentials(context.Background())
	if err != nil {
		log.Printf("Error validating axiom credentials: %s\n", err.Error())
		os.Exit(1)
	}

	idle := NewIdleChecker()

	// Send a heartbeat for every incoming request
	app.Use(func(c *fiber.Ctx) error {
		idle.Heartbeat()
		return c.Next()
	})

	app.Use(func(c *fiber.Ctx) error {
		err := c.Next()

		errMessage := ""
		if err != nil {
			errMessage = err.Error()
		}
		_, axiomErr := ax.Datasets.IngestEvents(c.UserContext(), "ping-fly", []axiom.Event{
			{
				ingest.TimestampField: time.Now(),
				"method":              c.Method(),
				"path":                c.Path(),
				"status":              c.Response().StatusCode(),
				"error":               errMessage,
			},
		})
		if axiomErr != nil {
			log.Printf("Error sending event to axiom: %s\n", axiomErr.Error())
		}
		return err

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
		req := ping.Request{}
		err := c.BodyParser(&req)
		if err != nil {
			return handleError(c, 400, "BAD_REQUEST", err.Error())
		}

		res, err := ping.Ping(c.UserContext(), req)
		if err != nil {
			return handleError(c, 500, "INTERNAL_SERVER_ERROR", err.Error())
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
