VERSION := $(shell git describe --tags --always)
SCHEDULER_IMAGE := chronark/planetfall-scheduler
SCHEDULER_TAG := ${SCHEDULER_IMAGE}:${VERSION}
PINGER_IMAGE := chronark/planetfall-pinger
PINGER_TAG := ${PINGER_IMAGE}:${VERSION}

rm:
	rm -rf ./**/node_modules; rm -rf ./**/dist; rm -rf ./**/.next; rm -rf ./**/.turbo

build: rm build-proxy
	pnpm install
	pnpm build

build-proxy: export GOOS=linux
build-proxy: export GOARCH=amd64
build-proxy:
	cd svc/proxy && \
	rm -rf dist && \
	go mod tidy && \
	go build -o ./dist/cmd/aws/main ./cmd/aws/main.go 

deploy: build-proxy
	$(MAKE) build-fly-ping
	$(MAKE) build-scheduler
	terraform -chdir=deployment init -upgrade
	terraform -chdir=deployment apply -var-file=".tfvars" -auto-approve

	
	flyctl deploy --app=planetfall-pinger --image=${PINGER_TAG}
	flyctl deploy --app=planetfall-scheduler --image=${SCHEDULER_TAG}


build-scheduler:
	docker build \
	 	--platform=linux/amd64 \
		-t ${SCHEDULER_TAG} \
		-t ${SCHEDULER_IMAGE}:latest \
		-f svc/scheduler/Dockerfile \
		.
	docker push ${SCHEDULER_TAG}
	docker push ${SCHEDULER_IMAGE}:latest


build-fly-ping:
	docker build \
	 	--platform=linux/amd64 \
		-t ${PINGER_TAG} \
		-t ${PINGER_IMAGE}:latest \
		-f svc/proxy/Dockerfile.fly \
		.
	docker push ${PINGER_TAG}
	docker push ${PINGER_IMAGE}:latest



dev: rm build
	pnpm turbo run dev 

fmt: rm
	pnpm fmt


tinybird:
	docker run -v $$(pwd)/pkg/tinybird:/mnt/data -it tinybirdco/tinybird-cli-docker