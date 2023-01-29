package main

import (
	"errors"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/madflojo/tasks"
)

type Scheduler struct {
	scheduler *tasks.Scheduler
}

func NewScheduler() *Scheduler {
	return &Scheduler{
		scheduler: tasks.New(),
	}

}

func (s *Scheduler) Add(endpointId string) error {
	err := s.scheduler.AddWithID(endpointId, &tasks.Task{
		Interval: time.Duration(5 * time.Second),
		TaskFunc: func() error {
			fmt.Println("hello")
			return nil
		},
		ErrFunc: func(err error) {
			fmt.Println("error" + err.Error())
		},
	})
	if errors.Is(err, tasks.ErrIDInUse) {
		return nil
	}
	return err
}
func (s *Scheduler) Remove(endpointId string) {
	s.scheduler.Del(endpointId)
}

func (s *Scheduler) Stop() {
	s.scheduler.Stop()
}


func (s *Scheduler) SyncEndpoint()error {
	


}

func main() {

	s := NewScheduler()
	defer s.Stop()

	s.Add("1")

	exit := make(chan os.Signal, 1) // we need to reserve to buffer size 1, so the notifier are not blocked
	signal.Notify(exit, os.Interrupt, syscall.SIGTERM)

	<-exit
}
