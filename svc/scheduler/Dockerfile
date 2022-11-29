
FROM --platform=linux/amd64 node:18
WORKDIR /planetfall
RUN npm i -g pnpm

COPY . .
RUN pnpm install
RUN pnpm turbo run build --filter=scheduler


CMD ["node", "./svc/scheduler/dist/main.js"]


