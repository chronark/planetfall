
FROM node:18 

RUN npm i -g pnpm turbo


WORKDIR /planetfall

COPY . .


RUN pnpm install -r 
RUN pnpm turbo run build --filter=scheduler


ENV NODE_ENV=production
CMD ["node", "./apps/scheduler/dist/main.js"]
