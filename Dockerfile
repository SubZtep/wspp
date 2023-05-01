FROM node:current-alpine AS base
RUN npm install -g pnpm
USER node
WORKDIR /home/node

FROM base AS builder
COPY --chown=node:node . .
ENV NODE_ENV=development
RUN pnpm install && \
    pnpm run build && \
    pnpm prune --prod

FROM base
COPY --chown=node:node --from=builder ["/home/node", "."]
ENV NODE_ENV=production

EXPOSE $PORT
CMD ["node", "build/server.js"]
