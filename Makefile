VERSION := $(shell git describe --tags --always)
SCHEDULER_TAG := chronark/planetfall-scheduler:${VERSION}
PINGER_TAG := chronark/planetfall-pinger:${VERSION}

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
	# zip ./dist/cmd/aws/function.zip ./dist/cmd/aws/main

deploy: 
	terraform -chdir=deployment init -upgrade
	terraform -chdir=deployment apply -var-file=".tfvars" -auto-approve
	$(MAKE) build-fly-ping
	flyctl -c ./svc/proxy/fly.toml deploy --image ${PINGER_TAG}
	$(MAKE) build-scheduler
	flyctl -c ./svc/scheduler/fly.toml deploy --dockerfile=./svc/scheduler/Dockerfile --push


build-scheduler:
	docker build \
	 	--platform=linux/amd64 \
		-t ${SCHEDULER_TAG} \
		-f svc/scheduler/Dockerfile \
		.
	docker push ${SCHEDULER_TAG}


build-fly-ping:
	docker build \
	 	--platform=linux/amd64 \
		-t ${PINGER_TAG} \
		-f svc/proxy/Dockerfile.fly \
		.
	docker push ${PINGER_TAG}


dev: rm build
	pnpm turbo run dev 

fmt: rm
	pnpm fmt


tinybird:
	docker run -v $$(pwd)/pkg/tinybird:/mnt/data -it tinybirdco/tinybird-cli-docker