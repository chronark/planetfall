VERSION := $(shell git describe --tags --always)
SCHEDULER_TAG := chronark/planetfall-scheduler:${VERSION}

rm:
	rm -rf ./**/node_modules; rm -rf ./**/dist; rm -rf ./**/.next; rm -rf ./**/.turbo

build: rm
	pnpm install
	pnpm build

build-proxy: export GOOS=linux
build-proxy: export GOARCH=amd64
build-proxy:
	cd svc/proxy-aws && \
	rm -rf dist && \
	go mod tidy && \
	go build -o ./dist/main ./main.go 
	# zip ./dist/function.v2.zip ./dist/main

deploy: build-proxy
	terraform -chdir=deployment init -upgrade
	terraform -chdir=deployment apply -var-file=".tfvars" -auto-approve
	flyctl -c ./svc/scheduler/fly.toml deploy --dockerfile=./svc/scheduler/Dockerfile --push
	# cd svc/scheduler && flyctl deploy --image ${SCHEDULER_TAG}


build-scheduler:
	docker build \
	 	--platform=linux/amd64 \
		-t ${SCHEDULER_TAG} \
		-f svc/scheduler/Dockerfile \
		.
	docker push ${SCHEDULER_TAG}


dev: rm build
	pnpm turbo run dev 

fmt: rm
	pnpm fmt


tinybird:
	docker run -v $$(pwd)/pkg/tinybird:/mnt/data -it tinybirdco/tinybird-cli-docker