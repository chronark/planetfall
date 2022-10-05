 FROM node:18 as builder

 WORKDIR /planetfall
 RUN yarn global add turbo

 COPY . .
 RUN turbo prune --scope=@planetfall/scheduler --docker

 FROM node:18 as installer
 WORKDIR /planetfall
 COPY .gitignore .gitignore
 COPY --from=builder /planetfall/out/json/ .
 COPY --from=builder /planetfall/out/yarn.lock ./yarn.lock
 RUN yarn install


#  Build the project
 COPY --from=builder /planetfall/out/full/ .
 COPY turbo.json turbo.json
 RUN yarn turbo run build --filter=scheduler...
 

 CMD ["node", "svc/scheduler/dist/main.js"]


# FROM node:18-alpine

# WORKDIR /planetfall

# COPY . .
# RUN yarn install
# RUN npx turbo run build --filter=scheduler
# CMD ["node", "svc/scheduler/dist/main.js"]