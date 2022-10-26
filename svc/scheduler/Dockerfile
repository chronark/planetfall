 FROM node:18 as builder

 WORKDIR /planetfall
 RUN pnpm global add turbo

 COPY . .
 RUN turbo prune --scope=@planetfall/scheduler --docker

 FROM node:18 as installer
 WORKDIR /planetfall

ARG version
ENV PLANETFALL_VERSION ${version}


ARG build
ENV PLANETFALL_BUILD ${build}

 COPY .gitignore .gitignore
 COPY --from=builder /planetfall/out/json/ .
 COPY --from=builder /planetfall/out/pnpm-lock.yaml ./pnpm-lock.yaml
 RUN pnpm install


#  Build the project
 COPY --from=builder /planetfall/out/full/ .
 COPY turbo.json turbo.json
 RUN pnpm turbo run build --filter=scheduler...
 

 CMD ["node", "svc/scheduler/dist/main.js"]


# FROM node:18-alpine

# WORKDIR /planetfall

# COPY . .
# RUN pnpm install
# RUN npx turbo run build --filter=scheduler
# CMD ["node", "svc/scheduler/dist/main.js"]