FROM node:22-bookworm-slim AS dependencies

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Install the specific dependency versions from package-lock.json
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS source 

# Copy app source after dependencies for better layer cashing
COPY . . 

# Prisma config requires this while loading
# Client gen does not conntect to this placehlder database
ENV DATABASE_URL=postgresql://build@127.0.0.1:5432

RUN npm run db:generate -- --config prisma7.config.ts

FROM source AS builder

# creates .next/standalone via next.config.ts
RUN npm run build

# The Compose migration and seed jobs use this stage
FROM source AS database-tools

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Standalone output contains runtime dependencies
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# App doesnt need root privs
USER node

EXPOSE 3000

CMD [ "node", "server.js" ]