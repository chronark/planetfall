
FROM --platform=linux/amd64 node:18
WORKDIR /planetfall
RUN npm i -g pnpm
COPY pnpm-lock.yaml ./
RUN pnpm fetch 

COPY . .
RUN pnpm install -r --offline
RUN pnpm turbo run build --filter=scheduler


CMD ["node", "./apps/scheduler/dist/main.js"]


