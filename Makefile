
VERSION := $(shell git describe --tags --always)
BUILDTIME := $(shell date -u '+%Y%m%d')

deploy-scheduler:
	aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 750095769533.dkr.ecr.us-east-1.amazonaws.com
	docker build \
		-t planetfall/scheduler:latest \
		--build-arg version=${VERSION} \
		--build-arg build=${BUILDTIME} \
		-f=svc/scheduler/Dockerfile \
		--platform=linux/amd64 \
		.
	docker tag planetfall/scheduler:latest 750095769533.dkr.ecr.us-east-1.amazonaws.com/planetfall/scheduler:latest
	docker push 750095769533.dkr.ecr.us-east-1.amazonaws.com/planetfall/scheduler:latest