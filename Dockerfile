FROM node:current-alpine AS base
RUN npm install -g pnpm
USER node
WORKDIR /home/node

FROM base AS builder
COPY --chown=node:node . .
ENV NODE_ENV=development
RUN pnpm install && pnpm run build

FROM base
COPY --from=builder --chown=node:node [ \
  "/home/node/pnpm-lock.yaml", \
  "/home/node/package.json", \
  "/home/node/server.js", \
  "."]
COPY --chown=node:node --from=builder ["/home/node/public", "./public"]
ENV NODE_ENV=production
RUN ["pnpm", "install"]

EXPOSE $PORT
CMD ["node", "server.js"]
