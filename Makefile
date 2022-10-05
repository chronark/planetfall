VERSION := $(shell git describe --tags --always)


deploy-scheduler:
	aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 750095769533.dkr.ecr.us-east-1.amazonaws.com
	docker build -t planetfall/scheduler:${VERSION} -f=svc/scheduler/Dockerfile .
	docker tag planetfall/scheduler:${VERSION} 750095769533.dkr.ecr.us-east-1.amazonaws.com/planetfall/scheduler:${VERSION}
	docker push 750095769533.dkr.ecr.us-east-1.amazonaws.com/planetfall/scheduler:${VERSION}