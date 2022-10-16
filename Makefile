
clean:
	rm -rf ./**/node_modules;
	rm -rf ./**/dist
	rm -rf ./**/.next
	rm -rf ./**/.turbo

build: clean
	yarn install
	yarn build

deploy: clean build
	terraform -chdir=deployment init
	terraform -chdir=deployment apply -var-file=".tfvars" -auto-approve

dev: clean build
	npx turbo run dev --filter=web

fmt: clean
	deno fmt
