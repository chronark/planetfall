FROM node:18 
WORKDIR /planetfall
RUN npm i -g pnpm turbo

ARG version
ENV PLANETFALL_VERSION ${version}


ARG build
ENV PLANETFALL_BUILD ${build}


COPY . .
RUN pnpm install

RUN pnpm turbo run build --filter=scheduler...


CMD ["node", "svc/scheduler/dist/main.js"]


# FROM node:18-alpine

# WORKDIR /planetfall

# COPY . .
# RUN pnpm install
# RUN npx turbo run build --filter=scheduler
# CMD ["node", "svc/scheduler/dist/main.js"]