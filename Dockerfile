FROM node:18

COPY . .
RUN yarn install
RUN npx turbo run build --filter=scheduler

CMD ["node", "./svc/scheduler/dist/main.js"]