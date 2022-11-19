# FROM node:18 as builder
# WORKDIR /planetfall
# RUN npm i -g turbo
# COPY . .
# RUN turbo prune --scope=@planetfall/scheduler --docker

# # Add lockfile and package.json's of isolated subworkspace
# FROM node:18 as installer
# WORKDIR /planetfall
# RUN npm i -g pnpm

# COPY --from=builder /planetfall/out/json/ .
# COPY --from=builder /planetfall/out/pnpm-lock.yaml .
# COPY --from=builder /planetfall/out/pnpm-workspace.yaml .
# RUN pnpm install

# # Build the project
# COPY --from=builder /planetfall/out/full/ .
# COPY turbo.json .
# RUN pnpm turbo run build --filter=scheduler...

# FROM node:18 as runner
# WORKDIR /planetfall

# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 scheduler
# USER scheduler


# COPY --from=installer /planetfall .
 
# ARG version
# ENV PLANETFALL_VERSION ${version}


# ARG build
# ENV PLANETFALL_BUILD ${build}


# CMD ["node", "./svc/scheduler/dist/main.js"]

FROM node:18
WORKDIR /planetfall
RUN npm i -g pnpm

COPY . .
RUN pnpm install
RUN pnpm turbo run build --filter=scheduler

CMD ["node", "./svc/scheduler/dist/main.js"]


