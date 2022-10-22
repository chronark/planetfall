
rm:
	rm -rf ./**/node_modules; rm -rf ./**/dist; rm -rf ./**/.next; rm -rf ./**/.turbo

build: rm
	yarn install
	yarn build

build-proxy: export GOOS=linux
build-proxy: export GOARCH=amd64
build-proxy:
	cd svc/proxy-aws && \
	rm -rf dist && \
	go mod tidy && \
	go build -o ./dist/main ./main.go && \
	zip ./dist/function.zip ./dist/main

deploy: build-proxy
	terraform -chdir=deployment init
	terraform -chdir=deployment apply -var-file=".tfvars" -auto-approve

dev: rm build
	npx turbo run dev --filter=!scheduler

fmt: rm
	deno fmt
