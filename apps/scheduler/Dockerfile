
FROM node:16

RUN npm i -g pnpm turbo


WORKDIR /planetfall

COPY . .


RUN pnpm install -r 
RUN pnpm turbo run build --filter=scheduler


CMD ["node", "./apps/scheduler/dist/main.js"]
