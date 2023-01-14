
# base image that contains global dependencies
FROM node:18 as base

RUN npm i -g pnpm turbo





FROM base AS installer
WORKDIR /planetfall


COPY pnpm-lock.yaml .
RUN pnpm fetch


FROM base 
WORKDIR /planetfall

COPY --from=installer /planetfall/node_modules .

COPY . .
RUN pnpm install -r 
RUN pnpm turbo run build --filter=scheduler


CMD ["node", "./apps/scheduler/dist/main.js"]
