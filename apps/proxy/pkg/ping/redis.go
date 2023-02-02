package ping

import (
	"context"
	"encoding/base64"
	"fmt"
	
	"log"
	"time"

	"github.com/go-redis/redis/v8"
)

func RedisPing(ctx context.Context, req Request) ([]Response, error) {
	if req.Checks == 0 {
		req.Checks = 1
	}

	opts, err := redis.ParseURL("redis://default:d9b70522f05d461cb972e66a5fe8bc1c@fly-latency.upstash.io")
	if err != nil {
		return nil, fmt.Errorf("unable to parse testRedisUrl: %w", err)
	}

	db := redis.NewClient(opts)
	defer func(){
		err := db.Close()
		if err != nil {
			log.Printf("Error closing redis connection: %v", err)
		}
	}()
	err = db.Ping(ctx).Err()
	if err != nil {
		return nil, fmt.Errorf("unable to ping redis: %w", err)
	}
	responses := make([]Response, req.Checks)
	for i := 0; i < req.Checks; i++ {
		var err error
		responses[i], err = redisCheck(ctx, db, req)
		if err != nil {
			return nil, err
		}
	}
	return responses, nil

}

func redisCheck(ctx context.Context, db *redis.Client, input Request) (Response, error) {
	log.Printf("Checking redis")
	key := "planetfall:testkey"
	err := db.Set(ctx, key, "testvalue", 0).Err()
	if err != nil {
		return Response{}, err
	}
	now := time.Now()
	res, err := db.Get(ctx, key).Result()
	latency := time.Since(now).Milliseconds()

	if err != nil {
		return Response{}, err
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
