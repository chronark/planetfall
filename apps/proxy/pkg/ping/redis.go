package ping

import (
	"context"
	"encoding/base64"
	"fmt"

	"log"
	"time"

	"github.com/go-redis/redis/v8"
)

func RedisPing(ctx context.Context, req PingRequest) ([]Response, error) {

	opts, err := redis.ParseURL(req.Urls[0])
	if err != nil {
		return nil, fmt.Errorf("unable to parse testRedisUrl: %w", err)
	}

	db := redis.NewClient(opts)
	defer func() {
		err := db.Close()
		if err != nil {
			log.Printf("Error closing redis connection: %v", err)
		}
	}()
	err = db.Ping(ctx).Err()
	if err != nil {
		return nil, fmt.Errorf("unable to ping redis: %w", err)
	}
	responses := make([]Response, 1)

	responses[0], err = redisCheck(ctx, db, checkRequest{
		Url:     req.Urls[0],
		Method:  req.Method,
		Body:    req.Body,
		Headers: req.Headers,
		Timeout: req.Timeout,
	})
	if err != nil {
		return nil, err
	}

	return responses, nil

}

func redisCheck(ctx context.Context, db *redis.Client, input checkRequest) (Response, error) {
	log.Printf("Checking redis")
	key := "planetfall:testkey"
	now := time.Now()
	res, err := db.Get(ctx, key).Result()
	latency := time.Since(now).Milliseconds()

	if err != nil {
		return Response{}, fmt.Errorf("unable to get testkey: %w", err)
	}

	return Response{
		Time:    now.UnixMilli(),
		Status:  200,
		Body:    base64.StdEncoding.EncodeToString([]byte(res)),
		Headers: make(map[string]string),
		Timing:  Timing{},
		Latency: latency,
		Tags:    []string{},
	}, nil
}
