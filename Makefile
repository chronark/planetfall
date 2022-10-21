
rm:
	rm -rf ./**/node_modules; rm -rf ./**/dist; rm -rf ./**/.next; rm -rf ./**/.turbo

build: rm
	yarn install
	yarn build

deploy: rm build
	terraform -chdir=deployment init
	terraform -chdir=deployment apply -var-file=".tfvars" -auto-approve

dev: rm build
	npx turbo run dev --filter=!scheduler

fmt: rm
	deno fmt
