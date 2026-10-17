
FROM node:22-alpine AS base

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./

FROM base AS migrations

RUN npm ci --include=dev && npm cache clean --force
COPY --chown=node:node migrations/ ./migrations/
USER node
CMD ["npm", "run", "migrate"]

FROM base AS runtime

RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node src/ ./src/

USER node

EXPOSE 3000

CMD ["node", "src/server.js"]
